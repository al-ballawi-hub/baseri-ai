export interface AnalysisResult {
    uxScore: number;
    overallSummary: string;
    croTips: {
        tip: string;
        impact: "High" | "Medium" | "Low";
    }[];
    criticalIssues: {
        id: string;
        title: string;
        description: string;
        solution: string;
        suggestedFix: string; // Code block
        severity?: "Critical" | "Major" | "Minor";
    }[];
}

export interface ScanResult {
    success: boolean;
    data: AnalysisResult;
    screenshot: string; // Base64
    error?: string;
}
