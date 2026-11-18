import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'src/payload-types.ts',
      'migrations/**',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
];

export default config;
