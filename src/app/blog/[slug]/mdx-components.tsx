// app/blog/[slug]/mdx-components.tsx
import { MDXComponents } from 'mdx/types'
import CodeBlock from '@/components/mdx/code-block'
// import CustomLink from '@/components/mdx/custom-link'
// import CustomImage from '@/components/mdx/custom-image'
// import Callout from '@/components/mdx/callout'

export const mdxComponents: MDXComponents = {
  // Code blocks
  pre: ({ children, className, ...props }) => {
    const lang = className?.replace('language-', '')
    return (
      <CodeBlock language={lang} className={className} {...props}>
        {children}
      </CodeBlock>
    )
  },
  // // Links
  // a: CustomLink,
  // // Images
  // img: ({ src, alt, ...props }: any) => (
  //   <CustomImage src={src || ''} alt={alt || ''} {...props} />
  // ),
  // // Callouts
  // Callout,
  // // Optional: Override default elements
  // h2: ({ children }) => (
  //   <h2 className="group relative mt-10 scroll-mt-20 text-2xl font-bold tracking-tight">
  //     <a
  //       href={\`#\${children}\`}
  //       className="absolute -left-5 top-0 hidden text-muted-foreground group-hover:inline-block"
  //       aria-label="Anchor"
  //     >
  //       #
  //     </a>
  //     {children}
  //   </h2>
  // ),
}
