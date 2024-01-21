import React from 'react';

import ExternalAnchor from './external-anchor';

export default function Footer() {
  const year = 2024;

  return (
    <footer className='flex h-10 w-full items-center justify-center border-t border-border text-sm'>
      Made by &nbsp;
      <ExternalAnchor href='https://defibuilder.com/' className='text-primary'>
        DeFi Builder
      </ExternalAnchor>
      &nbsp; at LFGHO hackathon &nbsp; {year}
    </footer>
  );
}
