// src/components/Lnav.js
import React, { useState } from 'react';
import './Lnav.css';
import { Button } from 'react-bootstrap';
import { FaListUl, FaPlusCircle, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Feather icons for categories
import { FiCpu, FiMusic, FiHeart, FiBook, FiActivity, FiUsers, FiClock, FiFilm, FiGrid } from 'react-icons/fi';

function Lnav({ setCurrentView, fn ,setIsLoggedIn}) {
  

  const [currentBtn, setCurrentBtn] = useState('Poll List');
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    
  };

  const categories = [
    'Technology', 'Songs', 'Health', 'Education', 'Sports',
    'Politics', 'Current', 'Entertainment', 'Others'
  ];

  // Icon mapping for categories
  const categoryIcons = {
    Technology: <FiCpu className="category-icon" />,
    Songs: <FiMusic className="category-icon" />,
    Health: <FiHeart className="category-icon" />,
    Education: <FiBook className="category-icon" />,
    Sports: <FiActivity className="category-icon" />,
    Politics: <FiUsers className="category-icon" />,
    Current: <FiClock className="category-icon" />,
    Entertainment: <FiFilm className="category-icon" />,
    Others: <FiGrid className="category-icon" />
  };

  return (
    <div className="lnav-container">
      <div className="nav-buttons">
        <Button variant="light" className={`nav-btn ${currentBtn === 'Poll List' ? 'btn-active' : ''}`} onClick={() => {
          setCurrentView('Poll List')
          setCurrentBtn('Poll List');
          fn('');
        }}>
          <FaListUl className="icon" /> Poll List
        </Button>

        <Button variant="light" className={`nav-btn ${currentBtn === 'Add Poll' ? 'btn-active' : ''}`} onClick={() => {
          setCurrentView('Add Poll')
          setCurrentBtn('Add Poll');
        }}>
          <FaPlusCircle className="icon" /> Add Poll
        </Button>

        <Button variant="light" className={`nav-btn ${currentBtn === 'User Details' ? 'btn-active' : ''}`} onClick={() => {
          setCurrentView('User Details')
          setCurrentBtn('User Details');
        }}>
          <FaUser className="icon" /> User Details
        </Button>
      </div>

      <div className="category-section">
        <div className="category-title">CATEGORIES</div>
        <div className="category-scroll">
          {categories.map(cat => (
            <Button
              key={cat}
              variant="light"
              className={`category-btn ${currentBtn === cat ? 'btn-active' : ''}`}
              onClick={() => {
                setCurrentBtn(cat);
                fn(cat);
              }}
            >
              {categoryIcons[cat]} {/* Icon added here */}
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="signout-wrapper">
        <Button className="signout-btn" onClick={handleSignOut}>
          Sign Out <FaSignOutAlt />
        </Button>
      </div>
    </div>
  );
}

export default Lnav;
