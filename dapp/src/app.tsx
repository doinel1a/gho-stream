import React from 'react';

import { BrowserRouter } from 'react-router-dom';

import Footer from './components/footer';
import Navbar from './components/navbar';
import EStorageKeys from './constants/keys';
import ConnectKitProvider from './providers/connect-kit';
import ThemeProvider from './providers/theme';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme='system' storageKey={EStorageKeys.theme}>
        <ConnectKitProvider>
          <Navbar />

          <main className='flex h-full flex-col items-center justify-center'>
            <h1 className='text-4xl'>GhoStream | Hackathon LFGHO</h1>
          </main>

          <Footer />
        </ConnectKitProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
