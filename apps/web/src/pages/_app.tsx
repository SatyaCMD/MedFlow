import type { AppProps } from 'next/app';
import React from 'react';
import { Providers } from '../app/providers';
import '../app/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
