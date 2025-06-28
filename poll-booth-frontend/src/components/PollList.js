// PollList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PollList.css';
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { Button } from 'react-bootstrap';
import { FiSend } from "react-icons/fi";
import { FaRegComment } from "react-icons/fa6";
import { IoMdShare } from "react-icons/io";
import { BsPersonCircle } from "react-icons/bs";
import { FaCommentDots } from "react-icons/fa";
import Form from 'react-bootstrap/Form';
import { FaRegCircleUser } from "react-icons/fa6";
import { FaQuestionCircle } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



function PollList({ searchText, cat }) {
  const API = process.env.REACT_APP_API_URL;
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser?.user_id;
  const [polls, setPolls] = useState([]);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [votedPolls, setVotedPolls] = useState([]);
  const [comment, setComment] = useState("");
  const [commentText, setCommentText] = useState({});
  const [replyText, setReplyText] = useState({});

  const [showNestedCmd,setShowNestedCmd]=useState("")

  const [cmdPollId,setCmdPollId] = useState("");

  const [isOpened, setIsOpened]=useState(true);

  const token= localStorage.getItem('userToken');

  console.log("token",token)

  useEffect(() => {
    fetchPolls(searchText, cat);
    fetchVotedPolls();
  }, [searchText, cat, isOpened]);

  const fetchPolls = (query) => {
    if (query && query.trim() !== '') {

      axios.get(`${API}/poll/by-question?searchText=${encodeURIComponent(query)}`,{
        headers:{
           'Authorization':`Bearer ${token}`
        }
      })
        .then(res => {
          console.log(res);
          
          setPolls(res.data.polls || []);
          setError(null);
        })
        .catch(err => {
          setError("Error fetching data");
          setPolls([]);
        });
    } else if (cat && cat.trim() !== '') {
      axios.get(`${API}/poll/category/${cat}`,{
        headers:{
           'Authorization':`Bearer ${token}`
        }
      })
        .then(res => {
          setPolls(res.data.data || []);
          setError(null);
        })
        .catch(err => {
          setError("Error fetching data");
          setPolls([]);
        });
    } else {
            axios.get(`${API}/poll/getall`,{
                headers:{
           'Authorization':`Bearer ${token}`
        }
            }
          )

      // axios.get('http://localhost:3000/poll/getall')
        .then(res => {
          console.log(res.data.data


          );
          
if(isOpened){
  const openedPolls=res.data.data.filter(pll=>pll.status=='open')
   setPolls(openedPolls);
          setError(null);
}else{

    const closedPolls=res.data.data.filter(pll=>pll.status!='open')
   setPolls(closedPolls);
          setError(null);


}
         
        })
        .catch(err => {
          setError("Error fetching data");
          setPolls([]);
        });
    }
  };

  const fetchVotedPolls = () => {
    axios.get(`${API}/poll/getVotedPollsByUserId/${userId}`,{
        headers:{
           'Authorization':`Bearer ${token}`
        }
      })
      .then(res => {
        setVotedPolls(res.data.data.map(p => p._id));
      })
      .catch(err => {
        console.error("Error fetching voted polls", err);
      });
  };

  const handleOptionChange = (pollId, optionId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [pollId]: optionId,
    }));
  };

  const handleVote = (pollId) => {
     console.log("Voting for poll ID:", pollId);
     console.log("checking");
    const selectedOptionId = selectedOptions[pollId];
    // if (!selectedOptionId) return;

    console.log("Voting for poll ID:", pollId);


    const voteDetails = { pollId, optionId: selectedOptionId, userId };
    console.log(voteDetails)

    axios.put(`${API}/poll/vote`, voteDetails,{
        headers:{
           'Authorization':`Bearer ${token}`
        }
      })
      .then(res => {
        toast.success(res.data.message);

        fetchPolls();
        fetchVotedPolls();
      })
      .catch(err => {
        console.error("Voting failed", err);
      });
  };

  const likePoll = (pollId) => {
    axios.put(`${API}/poll/like/${pollId}`, { userId },{
        headers:{
           'Authorization':`Bearer ${token}`
        }
      })
      .then(() => fetchPolls())
      .catch(err => console.error("Like error:", err));
  };

  const likeComment = (pollId,commentId) => {

    axios.post(`${API}/poll/like-comment`, {pollId, userId, commentId },{
        headers:{
           'Authorization':`Bearer ${token}`
        }
      })
      .then(() => fetchPolls())
      .catch(err => console.error("Like comment error:", err));
  };

  const addComment = (pollId) => {
    axios.post(`${API}/poll/comment`, {
      pollId, userId, commentText: commentText[pollId]
    },{
        headers:{
           'Authorization':`Bearer ${token}`
        }
      }).then(() => {
      setCommentText(prev => ({ ...prev, [pollId]: "" }));
      fetchPolls();
    });
  };

  const addReply = (parentCommentId, pollId) => {

    console.log("Adding reply to comment ID:", parentCommentId);
    console.log("Reply text:", replyText[parentCommentId]);
    console.log("Poll ID:", pollId);

    console.log(cmdPollId);
    console.log({
      userId, parentCommentId: parentCommentId, replyText: replyText[parentCommentId],pollId
    });

    axios.post(`${API}/poll/reply`, {
      userId, parentCommentId: parentCommentId, replyText: replyText[parentCommentId],pollId
    },{
        headers:{
           'Authorization':`Bearer ${token}`
        }
      }).then(() => {
      setReplyText(prev => ({ ...prev, [parentCommentId]: "" }));
      fetchPolls();
    });
  };

  const renderComments = (comments, pollId) => {
    return comments.map((comment, index) => (
      <div key={index} className="comment-box">
        <div className="comment-avatar">
          {/* <BsPersonCircle /> */}
          </div>
        <div className="comment-content">
          <span className="comment-username">@{comment.userName}</span>
          <p className="comment-text">{comment.text}</p>

          <div className="comment-actions">
            <button onClick={() => likeComment(pollId,comment._id)} className="comment-like-btn">
              {comment.likers.includes(userId) ? (<FaHeart className="heart filled hrtbtn" />  ) :
               <CiHeart className="heart empty hrtbtn" />}
            </button><p>{comment.likers.length > 1 ?`${comment.likers.length} likes` :`${comment.likers.length} like`}</p>

            <button className="reply-btn" onClick={() => {
              
              setReplyText(prev => ({ ...prev, [comment._id]: prev[comment._id] ? "" : "" }))
              
              // setCmdPollId(pollId);
          
              
              }}>
              Reply...
            </button> 

          </div>

          <div className="reply-input" style={{ display: replyText[comment._id] !== undefined ? 'flex' : 'none' }}>
            <input
            className='cmt-input'
              type="text"
              placeholder="Write a reply..."
              value={replyText[comment._id] || ""}
              onChange={(e) => setReplyText(prev => ({ ...prev, [comment._id]: e.target.value }))
          }
            />
            <button onClick={() => {
              
              
              addReply(comment._id, pollId);
              
              }}><FiSend /></button>
              
          </div>

          { comment.replies && comment.replies.length > 0 && (
            <div className="replies">{renderComments(comment.replies,pollId)}</div>
          )}
        </div>
      </div>
    ));
  };

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (polls.length === 0) return <div>Loading or no polls found...</div>;

  return (
    <>
    <div className="poll-list">
    <div className='d-flex justify-content-between'>
        <h2>Polls {cat}</h2> 
      <Form>
      <Form.Check // prettier-ignore
        type="switch"
        id="custom-switch"
        label={isOpened ? 'Opened polls' : " closed Polls"}
        onChange={()=>{
          
          setIsOpened(!isOpened)
          console.log(isOpened

          )

        }}

        value={isOpened ? 'Opened polls' : " closed Polls"
        }
      />
   
    </Form>
    </div>
      {polls.map((poll) => {
        const isLiked = poll.likers.includes(userId);

        return (
          <div className="poll-cardd" key={poll._id}>
          <div className="poll-header">
            <div>
              <p><strong><FaRegCircleUser /></strong> {poll.createdBy?.user_name || "Anonymous"}</p>
            </div>
            <div className={`poll-status ${poll.status === 'open' ? 'open' : 'closed'}`}>
              {poll.status.toUpperCase()}
            </div>
          </div>


            <p className="poll-question"><FaQuestionCircle /> {poll.question}</p>

            <div className="poll-meta">
              <span>Poll Ends on: {new Date(poll.expirationTime).toLocaleString()}</span>
              <span className="poll-category">Category: {poll.category}</span>
            </div>

         {
          poll.status=='open' &&    <div className="poll-options">
              {poll.options.map((opt) => (
                <div key={opt._id} className="poll-option">
                  <input
                    type="radio"
                    id={`${poll._id}_${opt._id}`}
                    name={`poll_${poll._id}`}
                    onChange={() => handleOptionChange(poll._id, opt._id)}
                    checked={selectedOptions[poll._id] === opt._id}
                    disabled={votedPolls.includes(poll._id) && selectedOptions[poll._id] !== opt._id}
                  />
                  <label htmlFor={`${poll._id}_${opt._id}`}>{opt.option}</label>
                </div>
              ))}     

             {votedPolls.includes(poll._id) ?
              <button
                type="button"
                className="voted-btn"
                onClick={() => handleVote(poll._id)}
                // disabled={votedPolls.includes(poll._id)}
              >
                Voted
              </button> :
              <button
                type="button"
                className="vote-btn"
                onClick={() => handleVote(poll._id)}
                // disabled={!selectedOptions[poll._id]}
                >Vote</button> }
            </div>
         }

{
  poll.status === 'closed' && (
    <div className="poll-closed-results">

      {(() => {
        const maxVotes = Math.max(...poll.options.map(opt => opt.count));

        if (maxVotes === 0) {
          return <p style={{ color: 'red', fontWeight: 'bold' }}>No Winners</p>;
        }

        return poll.options.map((opt) => {
          const percentage = poll.total_votes ? ((opt.count / poll.total_votes) * 100).toFixed(1) : 0;

          return (
            <div key={opt._id} className="poll-option">
              <div className="option-label">
                {opt.option}
               {opt.count === maxVotes && <span className="winner-badge">🏆 Winner</span>}

              </div>

              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: percentage > 0 ? `${percentage}%` : '1%',
backgroundColor: percentage < 1 ? 'red' : 'rgb(102, 177, 102)'}}

                >
                  <span className="progress-text">{percentage}%</span>
                </div>
              </div>
            </div>
          );
        });
      })()}

    </div>
  )
}
            <div className="poll-footer">
<button
  className={`lik ${poll.status === 'closed' ? 'disabled-btn' : ''}`}
  style={{ display: poll.status === 'closed' ? 'none' : 'block' }}

  onClick={() => {
    if (poll.status === 'open') likePoll(poll._id);
  }}
  disabled={poll.status === 'closed'}
>
  {isLiked ? <FaHeart className="heart filled" /> : <CiHeart className="heart empty" />}
</button>

<p className="like-section">{poll.total_likes}{poll.total_likes > 1 ? ' likes' : ' like'}</p>

<Button
  className="share-btn"
  onClick={() => {
    if (poll.status === 'open') setComment(poll._id);
  }}
  disabled={poll.status === 'closed'}

style={{ display: poll.status === 'closed' ? 'none' : 'block' }}

>
  <FaRegComment />
</Button>

<span className="share-section" style={{ display: poll.status === 'closed' ? 'none' : 'block' }}
><IoMdShare /></span>

            </div>

            {comment === poll._id && (
              <div className="comment-card" >
                <button className="close-comment" onClick={() => setComment("")}>X</button>

                <div className="comment-input-box">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText[poll._id] || ""}
                    onChange={(e) => setCommentText(prev => ({ ...prev, [poll._id]: e.target.value }))}
                  />
<FiSend  onClick={() => addComment(poll._id)}/>
                     {/* <button  ><FiSend /></button> */}
                  {/* <button type="button" className="send-btn" onClick={() => addComment(poll._id)}><FiSend /></button> */}
                </div>

                <div className="comment-display">{renderComments(poll.comments, poll._id)}</div>
              </div>
            )}
          </div>
        );
      })}
    </div> 
    <ToastContainer position="top-center" autoClose={2000} />
    </>
   
  );
}

export default PollList;
