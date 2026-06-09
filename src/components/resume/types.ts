export interface BaseEntry {
  id: string
  location: string
  startDate: string
  endDate?: string | null
}

export interface ResumeEntryProps extends BaseEntry {
  title: string
  subtitle: string
  highlightsHtml: React.ReactNode[]
  tags?: string[]
  links?: Array<{
    href: string
    label: string
  }>
  logoPath?: string
}

// Shapes of the entries in cv.json that the resume renders.
export interface CvWork {
  id: string
  name: string
  position: string
  location: string
  url?: string
  startDate: string
  endDate?: string | null
  summary?: string
  highlights: string[]
  skills?: string[]
  teams?: string[]
}

export interface CvEducation {
  id: string
  institution: string
  area?: string
  studyType: string
  location: string
  url?: string
  startDate: string
  endDate?: string | null
  score?: string
  courses?: Array<{ name: string }>
}

export interface CvProject {
  id: string
  name: string
  position?: string
  location: string
  url?: string
  githubUrl?: string
  startDate: string
  endDate?: string | null
  summary?: string
  highlights: string[]
}

export interface CvData {
  work: CvWork[]
  education: CvEducation[]
  projects: CvProject[]
}

// resume.json selects which cv.json entries (by id) to render.
export interface ResumeSelection {
  work: string[]
  education: string[]
  projects: string[]
}

// Superset of the fields processEntry reads across the three entry types.
export interface CvEntry {
  id: string
  location: string
  startDate: string
  endDate?: string | null
  name?: string
  position?: string
  teams?: string[]
  studyType?: string
  institution?: string
  area?: string
  score?: string
  courses?: Array<{ name: string }>
  summary?: string
  url?: string
  githubUrl?: string
  highlights?: string[]
}
