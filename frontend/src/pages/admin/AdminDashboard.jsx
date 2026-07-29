import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { Spinner, Card, Row, Col } from 'react-bootstrap';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboard();
        if (res.data.success) {
          setStats(res.data.data);
        } else {
          setError(res.data.message || 'Failed to load stats');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-4">{error}</div>;
  }

  const { totalStudents, totalEmployers, totalJobs, totalApplications, monthlyGrowth } = stats;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      <Row className="g-4">
        <Col md={3}>
          <Card className="text-center py-3 bg-light">
            <Card.Body>
              <Card.Title>Total Students</Card.Title>
              <h3>{totalStudents}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center py-3 bg-light">
            <Card.Body>
              <Card.Title>Total Employers</Card.Title>
              <h3>{totalEmployers}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center py-3 bg-light">
            <Card.Body>
              <Card.Title>Total Jobs</Card.Title>
              <h3>{totalJobs}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center py-3 bg-light">
            <Card.Body>
              <Card.Title>Total Applications</Card.Title>
              <h3>{totalApplications}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Monthly growth can be visualized later */}
    </div>
  );
};

export default AdminDashboard;
