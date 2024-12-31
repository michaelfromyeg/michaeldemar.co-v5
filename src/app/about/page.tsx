import { Metadata } from 'next'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'About | Michael DeMarco',
  description:
    'Learn more about Michael DeMarco, a software engineer based in San Francisco.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="prose prose-gray max-w-none dark:prose-invert">
        <h1 className="mb-8 text-4xl font-bold">About</h1>
        {/* Main content card with improved spacing */}
        <Card>
          <CardContent className="pl-6 pr-6">
            <div>
              <p>
                Hey there! I&apos;m Michael, an Honours Computer Science
                graduate from{' '}
                <a
                  href="https://ubc.ca"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  The University of British Columbia (UBC)
                </a>{' '}
                and software engineer at{' '}
                <a
                  href="https://notion.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  Notion
                </a>
                . Originally from Edmonton, Alberta, I moved to Vancouver to
                pursue my undergraduate studies in 2019, complementing my major
                with a{' '}
                <a
                  href="https://datascience.ubc.ca/minor"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  minor in Data Science
                </a>
                . During my time at UBC, I participated in both the{' '}
                <a
                  href="https://sciencecoop.ubc.ca"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  co-op program
                </a>{' '}
                and completed an enriching study abroad term at the{' '}
                <a
                  href="https://nus.edu.sg"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  National University of Singapore
                </a>
                .
              </p>
              <p>
                My professional journey has been shaped by diverse experiences
                across leading tech companies and research institutions.
                I&apos;ve had the privilege of working at{' '}
                <a
                  href="https://tesla.com/supercharger"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  Tesla
                </a>{' '}
                on Supercharging infrastructure,{' '}
                <a
                  href="https://amazon.jobs/en/teams/scot"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  Amazon
                </a>{' '}
                in Supply Chain Optimization Technologies,{' '}
                <a
                  href="https://research.samsung.com/srca"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  Samsung Electronics
                </a>{' '}
                in B2B software development, and{' '}
                <a
                  href="https://curo46.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  General Genomics
                </a>
                . A highlight of my career was contributing to{' '}
                <a
                  href="https://asc-csa.gc.ca/eng"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  The Canadian Space Agency&apos;s
                </a>{' '}
                first lunar rover project.
              </p>
              <p>
                Education has always been a passion of mine. As an{' '}
                <a
                  href="https://cs.ubc.ca/ta/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  Undergraduate Teaching Assistant
                </a>
                , I taught nine different computer science courses, ranging from
                introductory programming and data science to advanced topics
                like parallel computing and computer networking. This experience
                has deeply influenced my approach to problem-solving and
                technical communication.
              </p>
              <p>
                Currently, I&apos;m based in San Francisco, where I&apos;m
                working full-time at Notion. I completed a post-graduate
                internship there on the Web Infrastructure team to work on
                performance tooling. I managed to snag a return offer to the
                Collections (Databases) team, where I work on front-end
                performance. When I&apos;m not coding, you&apos;ll find me
                exploring (either aboard or in San Francisco), reading, watching
                movies, building half-baked side projects, playing sports,
                making music, or spending time with friends and family.
              </p>
              <p>
                I&apos;d love to connect. Feel free to reach out via any of the
                platforms in the footer, down below.
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Image grid with consistent sizing */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-72 w-72 overflow-hidden rounded-lg">
              <Image
                src="/images/me.jpg"
                alt="My headshot from my time at Notion"
                width={300}
                height={300}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <p className="text-sm text-muted-foreground">
              My face! (July 2024)
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="h-72 w-72 overflow-hidden rounded-lg">
              <Image
                src="/images/scrabble.png"
                alt="My friends and I"
                width={300}
                height={300}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <p className="text-sm text-muted-foreground">
              From the blog. (Jan 2021)
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="h-72 w-72 overflow-hidden rounded-lg">
              <Image
                src="/images/leo1.png"
                alt="A picture of my pet tortoise Leo"
                width={300}
                height={300}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              My pet tortoise Leo! (Jun 2020)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
