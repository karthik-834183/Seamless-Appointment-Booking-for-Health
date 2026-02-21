import { Col, Form, Input, Row, TimePicker, message } from 'antd';
import { Container } from 'react-bootstrap';
import React, { useState } from 'react';
import axios from 'axios';

function ApplyDoctor({ userId, onBookingComplete }) {
  const [doctor, setDoctor] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    experience: '',
    fees: '',
    timings: [],
  });

  // Handle time picker value change
  const handleTimingChange = (_, timeString) => {
    setDoctor({ ...doctor, timings: timeString }); // Example: ["09:00", "17:00"]
  };

  // Handle all input field changes
  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  // Submit the form
  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/user/apply-doctor', // ✅ Correct backend route
        { doctor, userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (res.data.success) {
        message.success(res.data.message);
        if (onBookingComplete) onBookingComplete();
      } else {
        message.error(res.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting doctor form:', error.response?.data || error.message);
      message.error('Something went wrong');
    }
  };

  return (
    <Container>
      <h2 className="text-center p-3">Apply for Doctor</h2>
      <Form onFinish={handleSubmit} className="m-3">
        <h4>Personal Details:</h4>
        <Row gutter={20}>
          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Full Name" required>
              <Input
                name="fullName"
                value={doctor.fullName}
                onChange={handleChange}
                placeholder="Enter name"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Phone" required>
              <Input
                name="phone"
                type="number"
                value={doctor.phone}
                onChange={handleChange}
                placeholder="Your phone"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Email" required>
              <Input
                name="email"
                type="email"
                value={doctor.email}
                onChange={handleChange}
                placeholder="Your email"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Address" required>
              <Input
                name="address"
                value={doctor.address}
                onChange={handleChange}
                placeholder="Your address"
              />
            </Form.Item>
          </Col>
        </Row>

        <h4>Professional Details:</h4>
        <Row gutter={20}>
          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Specialization" required>
              <Input
                name="specialization"
                value={doctor.specialization}
                onChange={handleChange}
                placeholder="Your specialization"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Experience" required>
              <Input
                name="experience"
                type="number"
                value={doctor.experience}
                onChange={handleChange}
                placeholder="Your experience (in years)"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Fees" required>
              <Input
                name="fees"
                type="number"
                value={doctor.fees}
                onChange={handleChange}
                placeholder="Consultation fees"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Timings" required>
              <TimePicker.RangePicker
                format="HH:mm"
                onChange={handleTimingChange}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" type="submit">
            Submit
          </button>
        </div>
      </Form>
    </Container>
  );
}

export default ApplyDoctor;
