import { IGatsbyImageData } from 'gatsby-plugin-image';

export interface PostFrontmatterType {
  title: string;
  date: string;
  categories: string[];
  summary: string;
  thumbnail: {
    childImageSharp: {
      gatsbyImageData: IGatsbyImageData;
    };
    publicURL: string;
  };
}

export interface Postype {
  title: string;
  date: string;
  categories: string[];
  summary: string;
  thumbnail: {
    childImageSharp: {
      gatsbyImageData: IGatsbyImageData;
    };
  };
}

export interface PostType {
  node: {
    frontmatter: PostFrontmatterType;
  };
}

export interface PostListItemType {
  node: {
    id: string;
    fields: {
      slug: string;
    };
    frontmatter: PostFrontmatterType;
  };
}
