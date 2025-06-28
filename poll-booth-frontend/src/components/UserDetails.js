import React, { useEffect, useState } from 'react';
import './UserDetails.css';
import axios from 'axios';
import { Card } from 'react-bootstrap'; // Ensure you have react-bootstrap installed

function UserDetails() {
    const API = process.env.REACT_APP_API_URL;
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userId = storedUser?.user_id;
    const userName = storedUser?.user_name;

    const [createdPolls, setCreatedPolls] = useState([]);
    const [votedPolls, setVotedPolls] = useState([]);
    const [showCreated, setShowCreated] = useState(true); // Toggle state
    const token= localStorage.getItem('userToken');

    const fetchCreatedPolls = async () => {
        try {
            const res = await axios.get(`${API}/poll/getPollsByUserId/${userId}`,{
        headers:{
           'Authorization':`Bearer ${token}`
        }
      });
            setCreatedPolls(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert("Failed to load created polls.");
        }
    };

    const fetchVotedPolls = async () => {
        try {
            const res = await axios.get(`${API}/poll/getVotedPollsByUserId/${userId}`,{
        headers:{
           'Authorization':`Bearer ${token}`
        }
      });
            setVotedPolls(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert("Failed to load voted polls.");
        }
    };

    const deleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

        try {
            await axios.delete(`${API}/user/deletebyId/${userId}`);
            localStorage.removeItem("user");
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Account deletion failed.");
        }
    };

    useEffect(() => {
        fetchCreatedPolls();
        fetchVotedPolls();
    }, []);

const renderPollCard = (poll) => (
    <Card key={poll._id} className="user-card">
        <div className="poll-header">
            <h1></h1>
            <span className={`status-badge ${poll.status === 'open' ? 'open' : 'closed'}`}>
                {poll.status === 'open' ? 'Open' : 'Closed'}
            </span>
        </div>
        <p className="poll-questionn">{poll.question}</p>
        <p className="poll-category">Category: <span>{poll.category}</span></p>
        <p className="poll-expiration">Expires: <span>{new Date(poll.expirationTime).toLocaleString()}</span></p>
        <div className="poll-options">
            {poll.options.map((opt, i) => (
                <div key={i} className="option-item">
                    {opt.option}: <span>{opt.count} votes</span>
                </div>
            ))}
        </div>
    </Card>
);

    return (
        <div className="user-details-container">

            {/* Profile Section */}
            <div className="profile-card">
                <h2>Welcome, {userName}</h2>
                        <div className="profile-buttons">
                            <button className="button-animated delete-btn" onClick={deleteAccount}>
                                <span>Delete My Account</span>
                            </button>

<button
    className={`button-animated poll-btn-custom ${showCreated ? 'active' : ''}`}
    onClick={() => setShowCreated(true)}
>
    <span>Created Polls</span>
</button>


<button
    className={`button-animated poll-btn-custom ${!showCreated ? 'active' : ''}`}
    onClick={() => setShowCreated(false)}
>
    <span>Voted Polls</span>
</button>

                        </div>

            </div>

            {/* Polls Section */}
            {showCreated ? (
                <>
                    <h3>My Created Polls</h3>
                    <div className="polls-container">
                        {createdPolls.length === 0 ? (
                            <p>No created polls found.</p>
                        ) : (
                            createdPolls.map(renderPollCard)
                        )}
                    </div>
                </>
            ) : (
                <>
                    <h3>Polls I Voted</h3>
                    <div className="polls-container">
                        {votedPolls.length === 0 ? (
                            <p>No voted polls found.</p>
                        ) : (
                            votedPolls.map(renderPollCard)
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default UserDetails;
