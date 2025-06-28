import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Topnav.css';
import { FaUserCircle, FaSearch } from 'react-icons/fa';
import { IoSettingsOutline } from "react-icons/io5";
import Swal from 'sweetalert2';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useNavigate } from 'react-router-dom';

function Topnav({ searchText, setSearchText ,setIsLoggedIn }) {
    const API = process.env.REACT_APP_API_URL;
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user?.user_name || 'Guest';
    const userId = user?.user_id;

    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [profileImage, setProfileImage] = useState(null);
    const [show, setShow] = useState(false);

    const[token ,setToken]= useState(localStorage.getItem('userToken'))

    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
  

    // useEffect(() => {
    //     const fetchUser = async () => {
    //         console.log("Inside")
    //         try {
    //                console.log("Inside try")
    //             const res = await axios.get(`${API}/user/getById/${userId}`);

    //         if (res.data.data && res.data.user_profile) {
    //                console.log("profilr frtched ")
    //           setProfileImage(
    //         res.data.user_profile
    //          ) 
    
    //         }


    //         } catch (error) {
    //             console.error('Error fetching user:', error);
    //         }
    //     };

    //     if (userId) {

    //         console.log("fetch data ")
    //         fetchUser();
    //     }
    // }, [userId]);

    useEffect(() =>  {

           const FecthData= async ()=> {
            console.log("FetchData")
              const res = await  axios.get(`${API}/user/getById/${userId}`);

            console.log("Res",res)

     
    setProfileImage(res.data.data.user_profile)
    console.log("imgae",res.data.data.user_profile,)

    console.log("profileImage",profileImage)
    }

          if(token){
        FecthData()
        }

        
        if (searchText.trim() === '') {
            setSearchSuggestions([]);
            return;
        }

     
      

        const fetchSuggestions = async () => {
            try {
                const res = await axios.get(
                    `${API}/poll/by-question?searchText=${encodeURIComponent(searchText)}`,{
        headers:{
           'Authorization':`Bearer ${token}`
        }
      }
                );
                setSearchSuggestions(res.data.polls || []);
            } catch (err) {
                setSearchSuggestions([]);
            }
        };
        fetchSuggestions();

      
       
    
    }, [token,searchText] );

    const handleInputChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleSuggestionClick = (question) => {
        setSearchSuggestions([]);
        setSearchText(question);
    };

    const handleImageUpload = async () => {
    const { value: file } = await Swal.fire({
        title: 'Select image',
        input: 'file',
        inputAttributes: {
            accept: 'image/*',
            'aria-label': 'Upload your profile picture',
        },
    });

    if (file) {
        const formData = new FormData();
        formData.append('user_profile', file); // IMPORTANT: Field name should match multer field in backend

        try {
           await axios.put(`${API}/user/update/${userId}`, formData);

            // Reload updated image 



            Swal.fire('Success!', 'Profile image updated.', 'success');
        } catch (error) {
            console.error('Upload error:', error);
            Swal.fire('Error!', 'Failed to upload image.', 'error');
        }
    }
};


    const handleDeleteAccount = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to recover your account!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API}/user/deletebyId/${userId}`);
                localStorage.removeItem('user');
                Swal.fire('Deleted!', 'Your account has been deleted.', 'success');
                navigate('/Login');
            } catch (error) {
                console.error('Deletion error:', error);
                Swal.fire('Error!', 'Failed to delete account.', 'error');
            }
        }
    };

    const handleGoToLogin = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");

        setIsLoggedIn(false); // Very Important!
        navigate('/Login');
    };

    return (
        <div className="topnav">
            <div className="left">POLLING BOOTH</div>
            <div className="center">
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-box"
                        placeholder="Search Polls"
                        value={searchText}
                        onChange={handleInputChange}
                        autoComplete="off"
                    />
                    {searchSuggestions.length > 0 && (
                        <div className="search-suggestions">
                            {searchSuggestions.map((poll) => (
                                <div
                                    key={poll._id}
                                    className="search-suggestion-item"
                                    onClick={() => handleSuggestionClick(poll.question)}
                                >
                                    {poll.question}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="right">
                Welcome... {userName}
                {profileImage ? (
                    <img src={API+profileImage} alt="Profile" className="profile-image" onClick={handleShow} />
                ) : (
                    <FaUserCircle className="icon" />
                )}

                <IoSettingsOutline onClick={handleShow} />

                <Offcanvas show={show} onHide={handleClose} placement="end">
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Profile</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <p>{userName}</p>
                        <div onClick={handleImageUpload} className="edit-profile-btn">
                            Edit Profile Image
                        </div>

                        <div onClick={handleDeleteAccount} className="delete-account-btn">
                            Delete My Account
                        </div>

                        <div onClick={handleGoToLogin} className="login-btn">
                            Go to Login
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>
            </div>
        </div>
    );
}

export default Topnav;
