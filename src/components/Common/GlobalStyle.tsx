import React, { FunctionComponent } from 'react';
import { Global, css } from '@emotion/react';
import emotionReset from 'emotion-reset';

const defaultStyle = css`
  ${emotionReset}
  @font-face {
    font-family: 'DOSPilgiMedium';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2304-2@1.0/DOSPilgiMedium.woff2')
      format('woff2');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff')
      format('woff');
    font-weight: 400;
    font-style: normal;
  }

  * {
    padding: 0;
    box-sizing: border-box;
    font-family: 'Pretendard', serif;
    background-color: #000;
    color: #fff;
  }

  html,
  body,
  #___gatsby {
    height: 100%;
  }

  a,
  a:hover {
    color: inherit;
    text-decoration: none;
    cursor: pointer;
  }
`;

const GlobalStyle: FunctionComponent = function () {
  return <Global styles={defaultStyle} />;
};

export default GlobalStyle;
