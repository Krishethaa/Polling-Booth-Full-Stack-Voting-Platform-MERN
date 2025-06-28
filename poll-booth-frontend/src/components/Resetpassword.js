import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Resetpassword.css';

function Resetpassword() {
    const API = process.env.REACT_APP_API_URL;
    const location = useLocation();
    const navigate = useNavigate();

    const mobile = location.state;

    const [userData, setUserData] = useState(null);
    const [emailInput, setEmailInput] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    // Fetch user details on load
    useEffect(() => {
        if (mobile) {
            axios.get(`${API}/user/getUserByPhoneNumber/${mobile}`)
                .then(res => {
                    setUserData(res.data.data);
                })
                .catch(err => {
                    console.error(err);
                    setError('User not found with this phone number.');
                });
        }
    }, [mobile]);

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');

        if (!userData) {
            setError('User details not found.');
            return;
        }

        if (emailInput !== userData.email) {
            setError('Entered email does not match.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            await axios.put(`${API}/user/update/${userData._id}`, {
                password: newPassword
            });

            alert('Password reset successfully!');
            navigate('/login'); // Redirect to login page
        } catch (err) {
            console.error(err);
            setError('Failed to update password.');
        }
    };

    return (
        <div className="reset-container">
            <h2>Reset Password</h2>
            

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form className="reset-form" onSubmit={handleReset}>
                <input
                    type="email"
                    placeholder="Enter Registered Email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
}

export default Resetpassword;
