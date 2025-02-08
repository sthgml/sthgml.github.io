import React from 'react';
import styled from '@emotion/styled';
import { Link } from 'gatsby';
import { Layout } from 'gatsby-plugin-image';
import { MainImageProps } from 'gatsby-plugin-image/dist/src/components/main-image';
import { PlaceholderProps } from 'gatsby-plugin-image/dist/src/components/placeholder';
import { FunctionComponent } from 'react';

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 88px;
  height: 60px;

  background-color: #000;

  a > img {
    width: 120px;
    height: 40px;
    margin-bottom: 0;
  }

  > div {
    display: flex;
    gap: 20px;

    span {
      color: white;
      font-family: 'DosPilgiMedium';

      &:active {
        text-decoration: underline solid white;
      }
    }
  }
`;

const Header: FunctionComponent = function () {
  return (
    <HeaderWrapper>
      <Link to="/">
        <img src={'./BOXO.svg'} alt="logo" />
      </Link>
      <div>
        <Link to="/">
          <span>About</span>{' '}
        </Link>
        <Link to="/blog">
          <span>Blog</span>
        </Link>
        <Link to="https://boxohee.notion.site/portfolio?pvs=4" target="_blank">
          <span>Portfolio</span>{' '}
        </Link>
      </div>
    </HeaderWrapper>
  );
};

export default Header;

export interface IGatsbyImageData {
  layout: Layout;
  width: number;
  height: number;
  backgroundColor?: string;
  images: Pick<MainImageProps, 'sources' | 'fallback'>;
  placeholder?: Pick<PlaceholderProps, 'sources' | 'fallback'>;
}
