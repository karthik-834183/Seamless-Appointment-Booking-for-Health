import React, { useEffect, useState } from 'react';
import { Badge, Row, Col, message } from 'antd';
import Notification from '../common/Notification';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicationIcon from '@mui/icons-material/Medication';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Container } from 'react-bootstrap';

import ApplyDoctor from './ApplyDoctor';
import UserAppointments from './UserAppointments';
import DoctorList from './DoctorList';

const UserHome = () => {
  const [doctors, setDoctors] = useState([]);
  const [userdata, setUserData] = useState({});
  const [activeMenuItem, setActiveMenuItem] = useState('');

  const getUser = () => {
    const user = JSON.parse(localStorage.getItem('userData'));
    if (user) {
      setUserData(user);
    }
  };

  const getUserData = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/user/getuserdata',
        {},
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        }
      );
      if (res.data.success) {
        setUserData(res.data.data);
        localStorage.setItem('userData', JSON.stringify(res.data.data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDoctorData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user/getalldoctorsu', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
    getUserData();
    getDoctorData();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/';
  };

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  // Callback after booking request success
  const handleBookingComplete = () => {
    setActiveMenuItem(''); // Go back to home
    message.success('Appointment request sent successfully!');
  };

  return (
    <div className='main'>
      <div className='layout'>
        <div className='sidebar'>
          <div className='logo'>
            <h2>MediCareBook</h2>
          </div>
          <div className='menu'>
            <div
              className={`menu-items ${activeMenuItem === 'userappointments' ? 'active' : ''}`}
              onClick={() => handleMenuItemClick('userappointments')}
            >
              <CalendarMonthIcon className='icon' />
              <Link>Appointments</Link>
            </div>
            {!userdata.isdoctor && (
              <div
                className={`menu-items ${activeMenuItem === 'applyDoctor' ? 'active' : ''}`}
                onClick={() => handleMenuItemClick('applyDoctor')}
              >
                <MedicationIcon className='icon' />
                <Link>Apply doctor</Link>
              </div>
            )}
            <div className='menu-items' onClick={logout}>
              <LogoutIcon className='icon' />
              <Link>Logout</Link>
            </div>
          </div>
        </div>

        <div className='content'>
          <div className='header'>
            <div className='header-content'>
              <Badge
                className={`notify ${activeMenuItem === 'notification' ? 'active' : ''}`}
                onClick={() => handleMenuItemClick('notification')}
                count={userdata?.notification?.length || 0}
              >
                <NotificationsIcon className='icon' />
              </Badge>
              {userdata.isdoctor && <h3>Dr.</h3>}
              <h3>{userdata.fullName}</h3>
            </div>
          </div>

          <div className='body' style={{ overflowY: 'auto', padding: '10px' }}>
            {activeMenuItem === 'applyDoctor' && (
              <ApplyDoctor userId={userdata._id} onBookingComplete={handleBookingComplete} />
            )}
            {activeMenuItem === 'notification' && <Notification />}
            {activeMenuItem === 'userappointments' && <UserAppointments />}
            {!activeMenuItem && (
              <Container>
                <h2 className='text-center p-2'>Home</h2>
                {!userdata.isdoctor && (
                  <Row gutter={[16, 16]}>
                    {doctors.map((doctor, i) => (
                      <Col key={i} xs={24} sm={12} md={12} lg={8} xl={6}>
                        <DoctorList
                          userDoctorId={doctor.userId}
                          doctor={doctor}
                          userdata={userdata}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </Container>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
