// app/blog/[slug]/mdx-components.tsx
import React from 'react'
import { MDXComponents } from 'mdx/types'
import CodeBlock from '@/components/mdx/code-block'
import MDXImage from '@/components/mdx/custom-image'

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
  // Images
  p: (props) => {
    // Check if the only child is an img element
    const children = React.Children.toArray(props.children)
    if (
      children.length === 1 &&
      React.isValidElement(children[0]) &&
      children[0].type === 'img'
    ) {
      const imgElement = children[0] as React.ReactElement
      const { src, alt, ...rest } = imgElement.props as any
      return <MDXImage src={src} alt={alt} {...rest} />
    }
    return <p {...props} />
  },
}
