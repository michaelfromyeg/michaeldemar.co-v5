import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function stripString(str: string): string {
  return str
    .replace(/\r\n/g, ' ') // Replace Windows line endings
    .replace(/\n/g, ' ') // Replace Unix line endings
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim() // Remove leading/trailing whitespace
}

// utils/processResumeData.ts
function stripAllStrings(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return stripString(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => stripAllStrings(item))
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = stripAllStrings(value)
    }
    return result
  }

  return obj
}

export function processResumeData(cvData: unknown, resumeData: unknown) {
  return {
    cv: stripAllStrings(cvData),
    resume: stripAllStrings(resumeData),
  }
}
