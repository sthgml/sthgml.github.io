import React, { ReactNode } from 'react'
import styled from "@emotion/styled";
import GlobalStyle from './GlobalStyle';
import Footer from './Footer';

type TemplateProps = {
  children: ReactNode
}

export default function Template({
  children
}: TemplateProps ) {
  return (
    <Container>
      <GlobalStyle />
      {children}
      <Footer />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
