import React from 'react';
import { ChartConfig } from '../../api/types';
export interface ConfigFormProps {
    config: ChartConfig;
    onChange: (config: ChartConfig) => void;
    onReset: () => void;
}
export declare const ConfigForm: React.FC<ConfigFormProps>;
//# sourceMappingURL=ConfigForm.d.ts.map