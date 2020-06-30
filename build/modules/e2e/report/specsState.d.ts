import { SpecReport, AppReport, TestReport } from 'vtex';
import { ReportProps } from './index';
export declare const completedSpec: (specReport: SpecReport) => boolean;
export declare const passedSpec: (specReport: SpecReport) => boolean;
export declare const passedApp: (appReport: AppReport) => boolean;
export declare const parseReport: (report: TestReport) => ReportProps;
