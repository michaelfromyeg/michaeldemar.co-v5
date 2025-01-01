import { Feed } from 'feed'
import { Post } from '@/types/blog'
import blogData from '@/data/blog.json'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'

async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHtml)
    .process(markdown)
  return result.toString()
}

export async function generateRssFeed() {
  const siteURL = 'https://michaeldemar.co'
  const author = {
    name: 'Michael DeMarco',
    email: 'michaelfromyeg@gmail.com',
    link: siteURL,
  }

  const feed = new Feed({
    title: "Michael DeMarco's Blog",
    description: 'Thoughts on software engineering, technology, and life',
    id: siteURL,
    link: siteURL,
    language: 'en',
    image: `${siteURL}/og-image.png`,
    favicon: `${siteURL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, Michael DeMarco`,
    generator: 'Feed for Node.js',
    feedLinks: {
      rss2: `${siteURL}/feed.xml`,
    },
    author,
  })

  const posts = blogData.posts as Post[]

  // Process all posts in parallel
  await Promise.all(
    posts
      .filter((post) => post.status === 'Published')
      .sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime()
      )
      .map(async (post) => {
        const url = `${siteURL}/blog/${post.slug}`
        feed.addItem({
          title: post.title,
          id: url,
          link: url,
          description: post.description,
          content: await markdownToHtml(post.content),
          author: [author],
          date: new Date(post.publishedDate),
          image: post.coverImage
            ? {
                url: `${siteURL}${post.coverImage}`,
                type: 'image/webp',
              }
            : undefined,
        })
      })
  )

  return feed
}
