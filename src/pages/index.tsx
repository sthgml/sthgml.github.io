import React from 'react';
import Template from 'components/Common/Template';
import { graphql } from 'gatsby';
import { IGatsbyImageData } from 'gatsby-plugin-image';
import { FunctionComponent } from 'react';
import styled from '@emotion/styled';

interface IndexPageProps {
  data: {
    site: {
      siteMetadata: {
        title: string;
        description: string;
        siteUrl: string;
      };
    };
    file: {
      childImageSharp: {
        gatsbyImageData: IGatsbyImageData;
      };
      publicURL: string;
    };
  };
}

const IndexPage: FunctionComponent<IndexPageProps> = function ({
  data: {
    site: {
      siteMetadata: { title, description, siteUrl },
    },
    file: { publicURL },
  },
}) {
  return (
    <Template
      title={title}
      description={description}
      url={siteUrl}
      image={publicURL}
    >
      <ImageWrapper>
        <img src={'./drawing.gif'} />
      </ImageWrapper>
    </Template>
  );
};

export default IndexPage;

const ImageWrapper = styled.div`
  width: 100vw;
  aspect-ratio: 16/9;
  background-color: #fff;

  > img {
    mix-blend-mode: exclusion;
    width: 100vw;
    aspect-ratio: 16/9;
    object-fit: cover;
    margin-bottom: -20px;
  }
`;

export const getPostList = graphql`
  query getPostList {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    file(name: { eq: "profile-image" }) {
      publicURL
    }
  }
`;
