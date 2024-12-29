import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// If you need more specific date formatting options:
export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  })
}

export function formatDateWithTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
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
function stripAllStrings(obj: any): any {
  if (typeof obj === 'string') {
    return stripString(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => stripAllStrings(item))
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = stripAllStrings(value)
    }
    return result
  }

  return obj
}

export function processResumeData(cvData: any, resumeData: any) {
  return {
    cv: stripAllStrings(cvData),
    resume: stripAllStrings(resumeData),
  }
}
