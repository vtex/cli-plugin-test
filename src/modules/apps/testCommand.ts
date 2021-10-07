import retry from 'async-retry'
import chalk from 'chalk'
import { concat, map, prop } from 'ramda'
import type { PinnedDeps, BatchStream } from 'vtex'
import {
  Builder,
  createFlowIssueError,
  createPathToFileObject,
  YarnFilesManager,
  fixPinnedDependencies,
  toAppLocator,
  logger,
  ManifestEditor,
  getAppRoot,
  listenBuild,
  listLocalFiles,
  ProjectUploader,
  validateAppAction,
} from 'vtex'
import { runYarnIfPathExists } from 'vtex/lib/modules/utils'

const root = getAppRoot()
const buildersToRunLocalYarn = ['react', 'node']
const RETRY_OPTS_TEST = {
  retries: 2,
  minTimeout: 1000,
  factor: 2,
}

const performTest = async (
  projectUploader: ProjectUploader,
  extraData: { yarnFilesManager: YarnFilesManager },
  unsafe: boolean
): Promise<void> => {
  const yarnFilesManager = await YarnFilesManager.createFilesManager(root)

  extraData.yarnFilesManager = yarnFilesManager
  yarnFilesManager.logSymlinkedDependencies()

  const testApp = async (bail: any, tryCount: number) => {
    const test = true
    const [localFiles, linkedFiles] = await Promise.all([
      listLocalFiles(root, test).then((paths) => map(createPathToFileObject(root), paths)),
      yarnFilesManager.getYarnLinkedFiles(),
    ])

    const filesWithContent = concat(localFiles, linkedFiles) as BatchStream[]

    if (tryCount === 1) {
      const linkedFilesInfo = linkedFiles.length ? `(${linkedFiles.length} from linked node modules)` : ''

      logger.info(`Sending ${filesWithContent.length} file${filesWithContent.length > 1 ? 's' : ''} ${linkedFilesInfo}`)
      logger.debug('Sending files')
      filesWithContent.forEach((p) => logger.debug(p.path))
    }

    if (tryCount > 1) {
      logger.info(`Retrying...${tryCount - 1}`)
    }

    try {
      const { code } = await projectUploader.sendToTest(filesWithContent, { tsErrorsAsWarnings: unsafe })

      if (code !== 'build.accepted') {
        bail(new Error('Please, update your builder-hub to the latest version!'))
      }
    } catch (err) {
      const { response } = err
      const { status } = response
      const data = response?.data
      const { message } = data
      const statusMessage = status ? `: Status ${status}` : ''

      logger.error(`Error testing app${statusMessage} (try: ${tryCount})`)
      if (message) {
        logger.error(`Message: ${message}`)
      }

      if (status && status < 500) {
        return
      }

      throw err
    }
  }

  await retry(testApp, RETRY_OPTS_TEST)
}

export default async (options) => {
  await validateAppAction('test')
  const unsafe = !!(options.unsafe || options.u)
  const manifest = await ManifestEditor.getManifestEditor()

  try {
    await manifest.writeSchema()
  } catch (e) {
    logger.debug('Failed to write schema on manifest.')
  }

  const appId = toAppLocator(manifest)

  const builder = Builder.createClient({}, { timeout: 60000 })
  const projectUploader = ProjectUploader.getProjectUploader(appId, builder)

  try {
    const pinnedDeps: PinnedDeps = await builder.getPinnedDependencies()

    await fixPinnedDependencies(pinnedDeps, buildersToRunLocalYarn, manifest.builders)
  } catch (e) {
    logger.info('Failed to check for pinned dependencies')
  }

  // Always run yarn locally for some builders
  map(runYarnIfPathExists, buildersToRunLocalYarn)

  const onError = {
    // eslint-disable-next-line
    build_failed: () => {
      logger.error(`App build failed. Waiting for changes...`)
    },
  }

  const onBuild = async () => {
    process.exit()
  }

  logger.info(`Testing app ${appId}`)

  const extraData = { linkConfig: null }

  try {
    // @ts-ignore
    const buildTrigger = performTest.bind(this, projectUploader, extraData, unsafe)
    const [subject] = appId.split('@')

    await listenBuild(subject, buildTrigger, { waitCompletion: false, onBuild, onError }).then(prop('unlisten'))
  } catch (e) {
    if (e.response) {
      const { data } = e.response

      if (data.code === 'routing_error' && /app_not_found.*vtex\.builder-hub/.test(data.message)) {
        return logger.error(
          'Please install vtex.builder-hub in your account to enable app testing (vtex install vtex.builder-hub)'
        )
      }

      if (data.code === 'link_on_production') {
        throw createFlowIssueError(
          `Please use a dev workspace to test apps. Create one with (${chalk.blue(
            'vtex use <workspace> -rp'
          )}) to be able to test apps`
        )
      }
    }

    throw e
  }
}
