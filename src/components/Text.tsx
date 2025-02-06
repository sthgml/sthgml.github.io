import React, { FunctionComponent } from 'react';

type TextProps = {
  text: string;
};

const Text: FunctionComponent<TextProps> = function ({ text }) {
  console.log('sohee');
  return <div>{text}</div>;
};

export default Text;
