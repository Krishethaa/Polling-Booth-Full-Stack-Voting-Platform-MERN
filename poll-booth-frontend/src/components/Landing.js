import React from 'react';
import './Landing.css';
import poll from '../images/polling-booth(logo).jpg'; // fix the import path if needed
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Landing() {
  
  const navigate = useNavigate();

  return (
    <Container fluid className="landing-container">
      <Row className="landing-content">
        <Col md={6} className="left-side">
          <img src={poll} alt="Poll Logo" className="poll-logo" />
        </Col>

        <Col md={6} className="right-side d-flex flex-column justify-content-center align-items-center">
          <h2 className="title">POLLING BOOTH</h2>
          <p className="subtitle">Join today.</p>

          {/* Changed button to Login */}
          <Button variant="info" className="custom-btn" onClick={() => navigate('/Login')}>
            Login
          </Button>

          <Button variant="outline-light" className="custom-btn" onClick={() => navigate('/Signup')}>
            Create account
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Landing;
