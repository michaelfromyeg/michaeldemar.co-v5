import React from 'react'
import { MDXComponents } from 'mdx/types'
import CodeBlock from '@/components/mdx/code-block'
import MDXImage from '@/components/mdx/mdx-image'
import SmartLink from '@/components/mdx/smart-link'

const isLink = (element: any): element is React.ReactElement => {
  return (
    React.isValidElement(element) &&
    (element.type === 'a' ||
      (element.type as any)?.name === 'a' ||
      typeof element.type === 'function')
  )
}

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
  // Handle paragraphs that might contain special content
  p: (props) => {
    const children = React.Children.toArray(props.children)

    // Handle single image
    if (
      children.length === 1 &&
      React.isValidElement(children[0]) &&
      children[0].type === 'img'
    ) {
      const props = children[0].props as any
      return <MDXImage {...props} />
    }

    // Handle single link
    if (children.length === 1 && isLink(children[0])) {
      const props = children[0].props as any
      return <SmartLink {...props} inline={false} />
    }

    // Regular paragraph
    return <p {...props} />
  },
  // Regular inline links
  a: (props) => {
    return <SmartLink {...props} inline={true} />
  },
}
