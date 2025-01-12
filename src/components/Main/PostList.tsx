import styled from '@emotion/styled';
import PostItem from 'components/Main/PostItem';
import useInfiniteScroll from 'hooks/useInfiniteScroll';
import { PostListItemType } from 'types/PostItem.types';

const PostListWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;
  width: 768px;
  margin: 0 auto;
  padding: 50px 0 100px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    width: 100%;
    padding: 50px 20px;
  }
`;

interface PostListProps {
  selectedCategory: string;
  posts: PostListItemType[];
}

function PostList({ selectedCategory, posts }: PostListProps) {

  const { containerRef, postList } = useInfiniteScroll(selectedCategory, posts)

  console.log(postList)
  return (
    <PostListWrapper ref={containerRef}>
      {postList.map(post => (
        <PostItem
          key={post.node.id}
          {...post.node.frontmatter}
          link={post.node.fields?.slug}
        />
      ))}
    </PostListWrapper>
  );
};

export default PostList;