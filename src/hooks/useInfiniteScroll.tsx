import { MutableRefObject, useRef, useMemo, useState, useEffect } from 'react';
import { PostListItemType } from 'types/PostItem.types';

const NUMBER_OF_ITEMS_PER_PAGE = 3;

const useInfiniteScroll = function (
  selectedCategory: string,
  posts: PostListItemType[],
) {
  const containerRef: MutableRefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement>(null);
  const [count, setCount] = useState<number>(1);

  const postListByCategory = useMemo(
    () =>
      posts.filter(
        ({
          node: {
            frontmatter: { categories },
          },
        }: PostListItemType) =>
          selectedCategory !== 'All'
            ? categories.includes(selectedCategory)
            : true,
      ),
    [selectedCategory],
  );

  const observer: MutableRefObject<IntersectionObserver | null> =
    useRef<IntersectionObserver>(null);

  // 빌드 시에 Window API 를 사용할 수 없어 module Not Found error가 나지 않도록
  // 렌더링 이후에 실행되는 useEffect에 사용합니다.
  useEffect(() => {
    observer.current = new IntersectionObserver((entries, observer) => {
      if (!entries[0].isIntersecting) return;

      setCount(value => value + 1);
      observer.unobserve(entries[0].target);
    });
  }, []);

  // 선택된 카테고리가 바뀌면 초기화 합니다.
  useEffect(() => setCount(1), [selectedCategory]);

  useEffect(() => {
    if (
      NUMBER_OF_ITEMS_PER_PAGE * count >= postListByCategory.length ||
      containerRef.current === null ||
      containerRef.current.children.length === 0
    ) {
      return;
    }

    observer.current?.observe(
      // 항상 가장 마지막 요소만을 관측합니다.
      containerRef.current.children[containerRef.current.children.length - 1],
    );
  }, [count, selectedCategory]);

  return {
    containerRef,
    postList: postListByCategory.slice(0, count * NUMBER_OF_ITEMS_PER_PAGE),
  };
};

export default useInfiniteScroll;
