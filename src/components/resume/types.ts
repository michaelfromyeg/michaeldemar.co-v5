// components/DynamicResume/types.ts
export interface BaseEntry {
    id: string;
    location: string;
    startDate: string;
    endDate?: string | null;
}

export interface ResumeEntryProps extends BaseEntry {
    title: string;
    subtitle: string;
    highlightsHtml: React.ReactNode[];
    tags: string[];
    links?: Array<{
        href: string;
        label: string;
    }>;
}