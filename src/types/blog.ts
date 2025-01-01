export interface Post {
  createdDate: string
  description: string
  editedDate: string
  id: string
  publishedDate: string
  slug: string
  status: 'Published' | 'Draft'
  tags: string[]
  title: string
  coverImage?: string
  blurDataURL?: string
  content: string
}
