declare module '*.svg?react' {
  import React from 'react';

  const ReactComponent: React.FC<React.SVGProps<'svg'> & { title?: string }>;

  export default ReactComponent;
}