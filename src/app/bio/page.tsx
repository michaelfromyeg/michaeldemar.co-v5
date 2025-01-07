import React from 'react'
import Image from 'next/image'

const BioPage = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex flex-col items-start gap-8 md:flex-row">
          <div className="relative h-48 w-48 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src="/images/me.jpg"
              alt="Michael DeMarco"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Michael DeMarco</h1>
            <div className="prose dark:prose-invert">
              <p>
                Michael DeMarco is a software engineer at Notion Labs and recent
                Computer Science graduate from the University of British
                Columbia. With former experience at leading technology companies
                including Tesla, Amazon, and Samsung, Michael specializes in
                developing performant web applications and infrastructure. As a
                ten-time teaching assistant and recipient of multiple teaching
                awards, he has demonstrated a commitment to computer science
                education. Michael has contributed to various open-source
                projects, including Kubernetes, and has conducted research in
                algorithm synthesis at UBC&apos;s Algorithms Lab and lunar rover
                navigation at the Canadian Space Agency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BioPage
