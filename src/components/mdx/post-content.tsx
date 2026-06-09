import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypePrism from 'rehype-prism-plus'
import { mdxComponents } from './mdx-components'

import '@/styles/prism.css'

// Canonical MDX renderer shared by blog, design, and travel pages so plugin
// config, custom components, and code-highlight styles stay consistent.
export function PostContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkBreaks],
          rehypePlugins: [
            [
              rehypePrism,
              {
                ignoreMissing: true,
                showLineNumbers: true,
                aliases: {
                  js: 'javascript',
                  py: 'python',
                  sh: 'bash',
                  ts: 'typescript',
                },
              },
            ],
          ],
        },
      }}
    />
  )
}
