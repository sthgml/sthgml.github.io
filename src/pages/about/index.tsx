import React, { FunctionComponent } from 'react';
import { graphql } from 'gatsby';
import Text from 'components/Text';
import Template from 'components/Common/Template';

interface InfoPageProps {
  data: {
    site: {
      siteMetadata: {
        title: string
        description: string
        author: string
        siteUrl: string
      }
    }
    file: {
      publicURL: string
    }
  }
}

const InfoPage: FunctionComponent<InfoPageProps> = function ({
  data: {
    site: {
      siteMetadata: { title, description, author, siteUrl },
    },
    file: {
      publicURL
    }
  },
}) {
  return (
    <Template
      title={title}
      description={description}
      url={siteUrl}
      image={publicURL} 
    >
      <Text text={title} />
      <Text text={description} />
      <Text text={author} />
    </Template>
  );
};

export default InfoPage;

export const metadataQuery = graphql`
  {
    site {
      siteMetadata {
        title
        description
        author
        siteUrl
      }
    }
    file(name: { eq: "profile-image" }) {
      publicURL 
    }
  }
`;