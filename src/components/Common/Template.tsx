import React, { ReactNode } from 'react';
import styled from '@emotion/styled';
import GlobalStyle from './GlobalStyle';
import Footer from './Footer';
import { Helmet } from 'react-helmet';
import Header from './Header';

type TemplateProps = {
  title: string;
  description: string;
  url: string;
  image: string;
  children: ReactNode;
};

export default function Template({
  title,
  description,
  url,
  image,
  children,
}: TemplateProps) {
  return (
    <Container>
      <Helmet>
        <title>Sohee's Devlog</title>

        <meta
          name="description"
          content="항상 발전하기 위해 노력하는 주니어 개발자입니다."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html;charset=UTF-8" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={title} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:site" content="@sohee" />
        <meta name="twitter:creator" content="@sohee" />

        <html lang="ko" />
      </Helmet>
      <GlobalStyle />
      <Header />
      {children}
      <Footer />
    </Container>
  );
}

const Container = styled.main`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
