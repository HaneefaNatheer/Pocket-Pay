import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import {
  BsSearch,
  BsEye,
  BsShieldLock,
  BsShieldCheck,
  BsFileEarmarkText,
  BsDownload,
  BsPeople,
  BsChevronLeft,
  BsChevronRight,
  BsX,
  BsEnvelope,
  BsPhone,
  BsGeoAlt,
  BsCalendar,
  BsBuilding,
  BsPerson,
  BsBookmarkHeart,
  BsBriefcase,
} from 'react-icons/bs';
import { toast } from 'react-toastify';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ITEMS_PER_PAGE = 10;

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

const statusBadge = (blocked) => {
  return blocked ? 'badge bg-danger' : 'badge bg-success';
};

const ManageStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileStudent, setProfileStudent] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await adminService.getStudents();
      setStudents(res.data?.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    let result = [...students];
    if (statusFilter === 'active') result = result.filter((s) => !s.blocked);
    else if (statusFilter === 'blocked') result = result.filter((s) => s.blocked);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.university?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [students, search, statusFilter]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedStudents.map((s) => s._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBlockToggle = async (student) => {
    setActionLoading(student._id);
    try {
      if (student.blocked) {
        await adminService.unblockUser(student._id);
        toast.success(`${student.name} has been unblocked.`);
      } else {
        await adminService.blockUser(student._id);
        toast.success(`${student.name} has been blocked.`);
      }
      setStudents((prev) =>
        prev.map((s) => (s._id === student._id ? { ...s, blocked: !s.blocked } : s))
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewProfile = async (student) => {
    setShowProfileModal(true);
    setLoadingProfile(true);
    try {
      const res = await adminService.getStudents({ id: student._id });
      const data = res.data?.data || res.data || student;
      setProfileStudent(data);
    } catch {
      setProfileStudent(student);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleExport = () => {
    toast.info('Export feature coming soon.');
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="placeholder-glow mb-4">
          <div className="placeholder col-4 mb-2" style={{ height: 32 }}></div>
          <div className="placeholder col-7" style={{ height: 18 }}></div>
        </div>
        <div className="row g-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="col-12">
              <div className="card border-0 shadow-sm placeholder-glow" style={{ height: 64 }}>
                <div className="card-body d-flex align-items-center">
                  <div className="placeholder col-2 rounded-circle" style={{ height: 40, width: 40 }}></div>
                  <div className="ms-3 flex-grow-1">
                    <div className="placeholder col-3 mb-2" style={{ height: 16 }}></div>
                    <div className="placeholder col-5" style={{ height: 14 }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Manage Students</h4>
          <small className="text-muted">{students.length} total students</small>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={handleExport}>
          <BsDownload className="me-1" /> Export
        </button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text bg-white border-end-0">
            <BsSearch />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search by name, email, university..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
        {selectedIds.length > 0 && (
          <span className="badge bg-primary d-flex align-items-center">
            {selectedIds.length} selected
          </span>
        )}
      </div>

      {paginatedStudents.length > 0 ? (
        <>
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedIds.length === paginatedStudents.length && paginatedStudents.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Student</th>
                    <th>Email</th>
                    <th>University</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student) => (
                    <tr key={student._id}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedIds.includes(student._id)}
                          onChange={() => toggleSelect(student._id)}
                        />
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {student.profileImage || student.avatar ? (
                            <img
                              src={student.profileImage || student.avatar}
                              alt={student.name}
                              className="rounded-circle me-2"
                              style={{ width: 36, height: 36, objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold text-white small"
                              style={{ width: 36, height: 36, backgroundColor: '#0d6efd', fontSize: 13 }}
                            >
                              {getInitials(student.name)}
                            </div>
                          )}
                          <span className="fw-semibold">{student.name}</span>
                        </div>
                      </td>
                      <td className="text-muted small">{student.email}</td>
                      <td>{student.university || 'N/A'}</td>
                      <td>
                        <span className={statusBadge(student.blocked)}>
                          {student.blocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            title="View Profile"
                            onClick={() => handleViewProfile(student)}
                          >
                            <BsEye />
                          </button>
                          <button
                            className={`btn ${student.blocked ? 'btn-outline-success' : 'btn-outline-danger'}`}
                            title={student.blocked ? 'Unblock' : 'Block'}
                            onClick={() => handleBlockToggle(student)}
                            disabled={actionLoading === student._id}
                          >
                            {actionLoading === student._id ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : student.blocked ? (
                              <BsShieldCheck />
                            ) : (
                              <BsShieldLock />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center mb-0">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>
                    <BsChevronLeft />
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>
                    <BsChevronRight />
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-5">
          <BsPeople size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No students found</h5>
          <p className="text-muted">
            {search ? 'Try adjusting your search.' : 'No students registered yet.'}
          </p>
        </div>
      )}

      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Student Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingProfile ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : profileStudent ? (
            <div className="row g-4">
              <div className="col-12 text-center">
                {profileStudent.profileImage || profileStudent.avatar ? (
                  <img
                    src={profileStudent.profileImage || profileStudent.avatar}
                    alt={profileStudent.name}
                    className="rounded-circle mb-3"
                    style={{ width: 80, height: 80, objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 fw-bold text-white"
                    style={{ width: 80, height: 80, backgroundColor: '#0d6efd', fontSize: 28 }}
                  >
                    {getInitials(profileStudent.name)}
                  </div>
                )}
                <h5 className="fw-bold mb-0">{profileStudent.name}</h5>
                <span className={statusBadge(profileStudent.blocked)}>
                  {profileStudent.blocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              <div className="col-12 col-md-6">
                <div className="card border h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Personal Info</h6>
                    <p className="mb-2"><BsEnvelope className="me-2 text-muted" />{profileStudent.email}</p>
                    <p className="mb-2"><BsPhone className="me-2 text-muted" />{profileStudent.phone || 'N/A'}</p>
                    <p className="mb-2"><BsGeoAlt className="me-2 text-muted" />{profileStudent.address || 'N/A'}</p>
                    <p className="mb-2"><BsCalendar className="me-2 text-muted" />
                      Joined {profileStudent.createdAt ? new Date(profileStudent.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="mb-0"><BsBuilding className="me-2 text-muted" />{profileStudent.university || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="card border h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Skills</h6>
                    {profileStudent.skills?.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1">
                        {profileStudent.skills.map((skill, idx) => (
                          <span key={idx} className="badge bg-light text-dark">
                            {typeof skill === 'string' ? skill : skill.name || skill.skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted mb-0">No skills listed.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Timetable Summary</h6>
                    {profileStudent.timetable?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Day</th>
                              <th>Start</th>
                              <th>End</th>
                              <th>Activity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileStudent.timetable.map((entry, idx) => (
                              <tr key={idx}>
                                <td>{entry.day || 'N/A'}</td>
                                <td>{entry.startTime || entry.start || 'N/A'}</td>
                                <td>{entry.endTime || entry.end || 'N/A'}</td>
                                <td>{entry.activity || entry.title || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted mb-0">No timetable set.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted">No profile data.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageStudents;
