export interface PostFrontmatterType {
  title: string
  date: string
  categories: string[]
  summary: string
  thumbnail: {
    publicURL: string
  }
  link: string
}

export interface PostListItemType {
  node: {
    id: string
    frontmatter: PostFrontmatterType
  }
}