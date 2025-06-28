import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Signup from './components/Signup';
import Login from './components/Login';
import Verifypg from './components/Verifypg';
import Resetpassword from './components/Resetpassword';
import Home from './components/Home';

import React, { useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("userId") !== null);

  return (
    <BrowserRouter>
      {isLoggedIn ? (
        <Routes>
          <Route path="/" element={<Home setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

          <Route path="/Verifypg" element={<Verifypg />} />
          <Route path="/resetpassword" element={<Resetpassword />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
