import Template from 'components/Common/Template'
import CommentWidget from 'components/Post/CommentWidget'
import PostContent from 'components/Post/PostContent'
import PostHead from 'components/Post/PostHead'
import { graphql } from 'gatsby'
import React, { FunctionComponent } from 'react'
import { PostFrontmatterType } from 'types/PostItem.types'
// import { PostPageItemType } from 'types/PostItem.types' // 바로 아래에서 정의할 것입니다

export type PostPageItemType = {
  node: {
    html: string
    frontmatter: PostFrontmatterType
  }
}

type PostTemplateProps = {
   data: {
    allMarkdownRemark: {
      edges: PostPageItemType[] // 존재하지 않는 타입이므로 에러가 발생하지만 일단 작성해주세요
    }
  }
}

const PostTemplate: FunctionComponent<PostTemplateProps> = function ({data: {
    allMarkdownRemark: { edges },
  }},) {
  const {
    node: {
      html,
      frontmatter: {
        title,
        summary, // 나중에 사용할 예정입니다!
        date,
        categories,
        thumbnail: {
          childImageSharp: { gatsbyImageData },
        },
      },
    },
  } = edges[0];

  return <Template>
    <PostHead
        title={title}
        date={date}
        categories={categories}
        thumbnail={gatsbyImageData}
    />
    <PostContent html={html} />
    <CommentWidget />
  </Template>
}

export default PostTemplate

export const queryMarkdownDataBySlug = graphql`
  query queryMarkdownDataBySlug($slug: String) {
    allMarkdownRemark(filter: { fields: { slug: { eq: $slug } } }) {
      edges {
        node {
          html
          frontmatter {
            title
            summary
            date(formatString: "YYYY.MM.DD.")
            categories
            thumbnail {
              childImageSharp {
                gatsbyImageData
              }
            }
          }
        }
      }
    }
  }
`