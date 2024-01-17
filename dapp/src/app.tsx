import React from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from './components/layout';
import EStorageKeys from './constants/keys';
import HomePage from './pages/home';
import NotFoundPage from './pages/not-found';
import ConnectKitProvider from './providers/connect-kit';
import ThemeProvider from './providers/theme';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme='system' storageKey={EStorageKeys.theme}>
        <ConnectKitProvider>
          <Layout>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='*' element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </ConnectKitProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
