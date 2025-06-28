// components/Rnav.js
import React, { useEffect, useState } from 'react';
import './Rnav.css';
import axios from 'axios';
import { FaHeart, FaCheckCircle } from 'react-icons/fa'; // Icons for Like and Vote

function Rnav() {
  const API = process.env.REACT_APP_API_URL;
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token= localStorage.getItem('userToken');

  const trendingAPI = `${API}/poll/trending`;

  useEffect(() => {
    axios.get(trendingAPI,{
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
      .then((res) => {
        setPolls(res.data.data); // API returns polls array
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load trending polls');
        setLoading(false);
      });
  }, []);

  return (
    <div className="rnav-container">
      <h4 className="rnav-heading">TRENDING POLLS</h4>
      <hr />

      {loading ? (
        <p>Loading polls...</p>
      ) : error ? (
        <p>{error}</p>
      ) : polls.length === 0 ? (
        <p>No trending polls available</p>
      ) : (
        polls.map((poll, index) => (
          <div key={index} className="poll-card">
            <div className="poll-question">Question: {poll.question}</div>
            <div className="poll-info">
              <FaCheckCircle className="icon vote-icon" />
              <span className="poll-votes">{poll.total_votes} Votes</span>
            </div>
            <div className="poll-info">
              <FaHeart className="icon like-icon" />
              <span className="poll-likes">{poll.total_likes} Likes</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Rnav;
