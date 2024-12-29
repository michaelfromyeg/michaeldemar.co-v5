import React from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Briefcase, GraduationCap, Hammer } from 'lucide-react'
import { ResumeEntry } from './entry'
import { ResumeSection } from './section'
import { processEntry } from './utils'

interface Props {
  cvData: any
  resumeData: any
}

export default async function DynamicResume({ cvData, resumeData }: Props) {
  // Process work experience
  const workExperiences = await Promise.all(
    cvData.work
      .filter((exp: any) => resumeData.work.includes(exp.id))
      .map(async (exp: any) => ({
        ...processEntry(exp, 'work'),
        highlightsHtml: await Promise.all(
          exp.highlights.map((highlight: string) => (
            <MDXRemote key={highlight} source={highlight} />
          ))
        ),
      }))
  )

  // Process education
  const education = await Promise.all(
    cvData.education
      .filter((edu: any) => resumeData.education.includes(edu.id))
      .map(async (edu: any) => ({
        ...processEntry(edu, 'education'),
        highlightsHtml: [
          <span key="area">Area: {edu.area}</span>,
          <span key="score">Grade: {edu.score}</span>,
        ],
      }))
  )

  // Process projects
  const projects = await Promise.all(
    cvData.projects
      .filter((proj: any) => resumeData.projects.includes(proj.id))
      .map(async (proj: any) => ({
        ...processEntry(proj, 'projects'),
        highlightsHtml: await Promise.all(
          proj.highlights.map((highlight: string) => (
            <MDXRemote key={highlight} source={highlight} />
          ))
        ),
      }))
  )

  return (
    <div className="space-y-16">
      <ResumeSection
        title="Experience"
        icon={Briefcase}
        linkHref="/blog"
        linkText="Read about my experiences in-depth on my blog"
      >
        {workExperiences.map((exp) => (
          <ResumeEntry key={exp.id} {...exp} />
        ))}
      </ResumeSection>
      <ResumeSection
        title="Education"
        icon={GraduationCap}
        linkHref="/blog"
        linkText="Learn more about my time at UBC on my blog"
      >
        {education.map((edu) => (
          <ResumeEntry key={edu.id} {...edu} />
        ))}
      </ResumeSection>
      <ResumeSection
        title="Projects"
        icon={Hammer}
        linkHref="/projects"
        linkText="Read more detailed write-ups about these projects"
      >
        {projects.map((proj) => (
          <ResumeEntry key={proj.id} {...proj} />
        ))}
      </ResumeSection>
    </div>
  )
}
