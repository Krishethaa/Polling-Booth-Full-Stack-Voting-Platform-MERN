// src/components/Home.js
import React, { useState } from 'react';
import Lnav from './Lnav';
import PollList from './PollList';
import AddPoll from './AddPoll';
import UserDetails from './UserDetails';
import CategoryPolls from './CategoryPolls';
import './Home.css';
import Rnav from './Rnav';
import Topnav from './Topnav';

function Home({ setIsLoggedIn }) {
 
  const [currentView, setCurrentView] = useState('Poll List');
  const [searchText, setSearchText] = useState('');  // NEW: state lifted here
 
  const [categry, setCategory] = useState(''); // NEW: state for category

   function handleCategoryChange(value) {
    setCategory(value);  // Update category state
    // Update current view to the selected category  


    console.log("Category changed to:", value);
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const createdBy = user?.user_id;

  const renderView = () => {
    const categories = [
      'Technology', 'Songs', 'Health', 'Education', 'Sports',
      'Politics', 'Current', 'Entertainment', 'Others'
    ];

    // if (categories.includes(currentView)) {
    //   return <CategoryPolls category={currentView} />;
    // }

    switch (currentView) {
      case 'Poll List':
        return <PollList searchText={searchText} cat={categry} />;  // Pass searchText here
      case 'Add Poll':
        return <AddPoll createdBy={createdBy} />;
      case 'User Details':
        return <UserDetails />;
      default:
        return <PollList searchText={searchText} />;
    }

  };

  return (
    <>
      <Topnav searchText={searchText} setSearchText={setSearchText} setIsLoggedIn={setIsLoggedIn} /> 
      <div className="home-container">
        <div className="left-panel">
          <Lnav setCurrentView={setCurrentView} fn={handleCategoryChange} setIsLoggedIn={setIsLoggedIn} />
        </div>
        <div className="middle-panel">
          {renderView()}
        </div>


        <div className="right-panel">
          <Rnav />
        </div>
        
      </div>
    </>
  );
}

export default Home;
