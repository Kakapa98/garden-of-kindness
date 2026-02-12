import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Garden from './components/Garden';
import ViewMessage from './components/ViewMessage';
import Donation from './components/Donation';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Garden />} />
        <Route path="/view/:token" element={<ViewMessage />} />
        <Route path="/donate" element={<Donation />} />
      </Routes>
    </HashRouter>
  );
};

export default App;