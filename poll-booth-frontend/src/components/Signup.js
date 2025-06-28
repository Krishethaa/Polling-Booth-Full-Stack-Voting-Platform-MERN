import React, { useState } from 'react';
import {
  Container, Form, Row, Col, Button, Card, InputGroup
} from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

function Signup() {
  const API = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  // Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    

    try {
          const currentYear = new Date().getFullYear();
          const age = currentYear - parseInt(year);



      const response = await axios.post(`${API}/user/create`, {
        user_name: firstName + ' ' + lastName,
        age,
        gender,
        email,
        phone_number : phone,
        password
      });

      if (response.data.success) {
        alert('Signup Successful!');
        navigate('/Login');
      } else {
        alert('Signup Failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup');
    }
  };

  return (
    <div className="signup-bg">
      <Container className="d-flex justify-content-center align-items-center signup-container">
        <Card className="p-4 shadow signup-card">
          <h4 className="text-center mb-3">Create your account</h4>
          <Form onSubmit={handleSignup}>
            <Row>
              <Col>
                <Form.Control
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Control
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mt-3 d-flex">
              <Button variant="secondary" disabled>+91</Button>
              <Form.Control
                placeholder="Phone number"
                className="ms-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Form.Group>

            <Row className="mt-3">
              <p>Date of birth</p><br />
              <Col>
                <Form.Select value={day} onChange={(e) => setDay(e.target.value)}>
                  <option value="">Day</option>
                  {days.map(day => <option key={day} value={day}>{day}</option>)}
                </Form.Select>
              </Col>
              <Col>
                <Form.Select value={month} onChange={(e) => setMonth(e.target.value)}>
                  <option value="">Month</option>
                  {months.map((month, idx) => (
                    <option key={idx} value={idx + 1}>{month}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Select value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="">Year</option>
                  {years.map(year => <option key={year} value={year}>{year}</option>)}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label>Gender</Form.Label><br />
              <Form.Check inline label="Male" name="gender" type="radio" onChange={() => setGender('Male')} />
              <Form.Check inline label="Female" name="gender" type="radio" onChange={() => setGender('Female')} />
              <Form.Check inline label="Custom" name="gender" type="radio" onChange={() => setGender('Custom')} />
            </Form.Group>

            <Form.Group className="mt-3">
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter 6 digits password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeSlash /> : <Eye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mt-3">
              <InputGroup>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm 6 digits password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeSlash /> : <Eye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <div className="d-grid mt-4">
              <Button variant="info" type="submit">Sign Up</Button>
            </div>

            <div className="text-center mt-2">or</div>

            <div className="d-grid mt-2">
              <Button variant="info" onClick={() => navigate('/Login')}>Login</Button>
            </div>
          </Form>
        </Card>
      </Container>
    </div>
  );
}

export default Signup;
