cli-plugin-template
===================

vtex plugin template

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cli-plugin-template.svg)](https://npmjs.org/package/cli-plugin-template)
[![Downloads/week](https://img.shields.io/npm/dw/cli-plugin-template.svg)](https://npmjs.org/package/cli-plugin-template)
[![License](https://img.shields.io/npm/l/cli-plugin-template.svg)](https://github.com/vtex/cli-plugin-template/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @vtex/cli-plugin-test
$ oclif-example COMMAND
running command...
$ oclif-example (-v|--version|version)
@vtex/cli-plugin-test/0.0.0 linux-x64 node-v14.0.0
$ oclif-example --help [COMMAND]
USAGE
  $ oclif-example COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`oclif-example test:e2e`](#oclif-example-teste2e)
* [`oclif-example test:unit`](#oclif-example-testunit)

## `oclif-example test:e2e`

Run your VTEX app's integration tests

```
USAGE
  $ oclif-example test:e2e

OPTIONS
  -h, --help           show CLI help
  -r, --report=report  Check the results and state of a previously started test given its ID

  -t, --token          [Not recommended] Send your personal authorization token to your test session so it's available
                       while running the tests. It can be dangerous because exposes the token via 'authToken'
                       environment variable

  -v, --verbose        Show debug level logs

  -w, --workspace      Test workspace's apps

  --trace              Ensure all requests to VTEX IO are traced
```

_See code: [build/commands/test/e2e.ts](https://github.com/vtex/cli-plugin-test/blob/v0.0.0/build/commands/test/e2e.ts)_

## `oclif-example test:unit`

Run your VTEX app unit tests

```
USAGE
  $ oclif-example test:unit

OPTIONS
  -h, --help     show CLI help
  -u, --unsafe   Allow tests with Typescript errors
  -v, --verbose  Show debug level logs
  --trace        Ensure all requests to VTEX IO are traced

ALIASES
  $ oclif-example test
```

_See code: [build/commands/test/unit.ts](https://github.com/vtex/cli-plugin-test/blob/v0.0.0/build/commands/test/unit.ts)_
<!-- commandsstop -->
