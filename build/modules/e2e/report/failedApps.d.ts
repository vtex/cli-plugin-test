import * as React from 'react';
import { SpecReport } from 'vtex';
interface SpecProps {
    spec: string;
    report: SpecReport;
    hubTestId: string;
}
export declare const FailedSpec: React.FunctionComponent<SpecProps>;
export {};
