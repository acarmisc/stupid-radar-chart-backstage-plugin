import React from 'react';
export interface ChartPreviewProps {
    title: string;
    author: string;
    showAuthor: boolean;
    lockedValues: Record<string, number>;
    extraKpi: {
        name: string;
        value: number;
    } | null;
}
export declare const ChartPreview: React.FC<ChartPreviewProps>;
//# sourceMappingURL=ChartPreview.d.ts.map