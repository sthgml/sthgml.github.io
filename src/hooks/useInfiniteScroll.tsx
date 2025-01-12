import { MutableRefObject, useRef, useMemo, useState, useEffect } from 'react'
import { PostListItemType } from 'types/PostItem.types'

const NUMBER_OF_ITEMS_PER_PAGE = 3

const useInfiniteScroll = function (
  selectedCategory: string,
  posts: PostListItemType[],
) {
  const containerRef: MutableRefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(
    null,
  )
  const [count, setCount] = useState<number>(1)

  const postListByCategory = useMemo(
    () =>
      posts.filter(({ node: { frontmatter: { categories } } }: PostListItemType) =>
        selectedCategory !== 'All'
          ? categories.includes(selectedCategory)
          : true,
      ),
    [selectedCategory],
  );

  const observer: IntersectionObserver = new IntersectionObserver(
    (entries, observer) => {
      // 항상 가장 마지막 요소만 관찰하기 때문에 entries에 담긴 요소는 하나 뿐
      if (!entries[0].isIntersecting) return;

      setCount(value => value + 1);
      // count 값을 변경시키고 나면 즉시 관찰을 중단합니다.
      observer.disconnect();
    },
  )

  // 선택된 카테고리가 바뀌면 초기화 합니다.
  useEffect(() => setCount(1), [selectedCategory])

  useEffect(() => {
    if (
      NUMBER_OF_ITEMS_PER_PAGE * count >= postListByCategory.length ||
      containerRef.current === null ||
      containerRef.current.children.length === 0
    ) {
      return;
    }

    observer.observe( // 항상 가장 마지막 요소만을 관측합니다.
      containerRef.current.children[containerRef.current.children.length - 1],
    )
  }, [count, selectedCategory])
  
  return {
    containerRef,
    postList: postListByCategory.slice(0, count * NUMBER_OF_ITEMS_PER_PAGE),
  }
}

export default useInfiniteScroll