import React, { useState } from 'react';
import './AddPolls.css';
import axios from 'axios';

const AddPoll = ({ createdBy }) => {
  const API = process.env.REACT_APP_API_URL;
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([{ option: '' }, { option: '' }]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('');
  const maxOptions = 4;
  const token= localStorage.getItem('userToken');


  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].option = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    if (options.length < maxOptions) {
      setOptions([...options, { option: '' }]);
    }
  };

  const handleDeleteOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (options.length < 2 || options.some(opt => opt.option.trim() === '')) {
      alert('At least two non-empty options are required.');
      return;
    }

    // if (!question || !category || !createdBy) {
    //   alert('Question, category and createdBy are required.');
    //   return;
    // }

    let expirationTime = null;
    if (date && time) {
      expirationTime = new Date(`${date}T${time}`);
    }

    const pollData = {
      question,
      options,
      title,
      desc,
      expirationTime,
      category,
      createdBy
    };
    console.log("Sending poll:", pollData);


    try {
       console.log(pollData)
      const response = await axios.post(`${API}/poll/create`, pollData,{
        headers:{
           'Authorization':`Bearer ${token}`
        }
      });
      alert('Poll created successfully!');
      setQuestion('');
      setOptions([{ option: '' }, { option: '' }]);
      setTitle('');
      setDesc('');
      setDate('');
      setTime('');
      setCategory('');
    } catch (err) {
      console.log(pollData)
      alert('Error creating poll: ' + err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="poll-container">
      <form className="poll-form" onSubmit={handleSubmit}>
        <h3>Create Your Polls here!</h3>
        <textarea
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />

        <div className="options-tips-wrapper">
          <div className="options-box">
            {options.map((opt, index) => (
              <div key={index} className="option-group">
                <span className="option-icon">≡</span>
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={opt.option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="delete-option"
                    onClick={() => handleDeleteOption(index)}
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}

            {options.length < 4 && (
              <button type="button" className="add-option" onClick={handleAddOption}>
                Add Option
              </button>
            )}
          </div>


        </div>

        <div className="datetime-group">
          <div>
            <label>Voting Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label>End Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          <option value="Technology">Technology</option>
          <option value="Songs">Songs</option>
          <option value="Health">Health</option>
          <option value="Education">Education</option>
          <option value="Sports">Sports</option>
          <option value="Politics">Politics</option>
          <option value="Current">Current</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Others">Others</option>
        </select>

        <div className="button-group">
          <button type="button" className="cancel-btn" onClick={() => window.location.reload()}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">Post</button>
        </div>
      </form>
    </div>
  );
};

export default AddPoll;
