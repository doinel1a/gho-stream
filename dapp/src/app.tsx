import React from 'react';

import { BrowserRouter } from 'react-router-dom';

import Footer from './components/footer';
import Navbar from './components/navbar';
import ThemeProvider from './components/ui/theme/provider';
import EStorageKeys from './constants/keys';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme='system' storageKey={EStorageKeys.theme}>
        <Navbar />

        <main className='flex h-full flex-col items-center justify-center'>
          <h1 className='text-4xl'>GhoStream | Hackathon LFGHO</h1>
        </main>

        <Footer />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
