import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import axios from 'axios';

function Login({ setIsLoggedIn }) {
    const API = process.env.REACT_APP_API_URL;
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleForgotPassword = () => {
        if (!mobile.trim()) {
            alert("Please enter your mobile number first.");
            return;
        }
        navigate('/resetpassword',{state:mobile});
    };

    const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const response = await axios.post(`${API}/user/login`, {
            phone_number: mobile,
            password: password
        });

        const { data } = response;

        // Extract token and user details
        const { user_id, user_name, phonenumber } = data.data;

        const token =data.token

        // ✅ Store the token in localStorage
        localStorage.setItem("userToken", token);

        // ✅ (Optional) Store user details if needed
        localStorage.setItem("user", JSON.stringify({ user_id, user_name, phonenumber }));

        // ✅ Update state to re-render App
        setIsLoggedIn(true);
        // ✅ Redirect to home/dashboard
        navigate("/");  // change route name as needed
    } catch (err) {
        console.error(err);
        alert("Login failed: " + (err.response?.data?.message || "Server error"));
    }
};


    return (
        <div className="login-container">
            <h2>LOG INTO YOUR ACCOUNT</h2>
            <form className="login-form" onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <button className="forgot-button" onClick={handleForgotPassword}>
                Forgot Password?
            </button>
        </div>
    );
}

export default Login;
