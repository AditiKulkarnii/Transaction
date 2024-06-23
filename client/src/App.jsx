import React from 'react';
import { BrowserRouter, Route, Routes} from "react-router-dom";
import Dashboard from './pages/Dasboard';
import './App.css';
import Statisctics from './pages/Statistics'; 
const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/statistics" element={<Statisctics />} />
        </Routes>
      </BrowserRouter>
    </>
    
  );
};

export default App;
