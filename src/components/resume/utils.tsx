import type { CvEntry } from './types'

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function processEntry(
  entry: CvEntry,
  type: 'work' | 'education' | 'projects'
) {
  const base = {
    id: entry.id,
    location: entry.location,
    startDate: formatDate(entry.startDate),
    endDate: entry.endDate ? formatDate(entry.endDate) : null,
  }

  switch (type) {
    case 'work':
      return {
        ...base,
        title: entry.position ?? '',
        subtitle: entry.name ?? '',
        tags: entry.teams,
      }
    case 'education':
      return {
        ...base,
        title: entry.studyType ?? '',
        subtitle: entry.institution ?? '',
        tags: entry.courses?.map((course) => course.name) ?? [],
      }
    case 'projects':
      return {
        ...base,
        title: entry.name ?? '',
        subtitle: entry.summary ?? '',
        links: [
          entry.githubUrl
            ? { href: entry.githubUrl, label: 'GitHub Repository' }
            : null,
          entry.url ? { href: entry.url, label: 'Live Demo' } : null,
        ].filter(
          (link): link is { href: string; label: string } => link !== null
        ),
      }
    default:
      throw new Error(`Unknown entry type: ${type}`)
  }
}
