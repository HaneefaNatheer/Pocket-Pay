import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import {
  BsArrowLeft,
  BsPencilSquare,
  BsShieldLock,
  BsEnvelope,
  BsPhone,
  BsPersonBadge,
  BsCalendarCheck,
  BsClockHistory,
  BsPersonCheck,
  BsShieldCheck,
  BsKey,
  BsPatchCheck,
  BsCamera,
} from 'react-icons/bs';

const InfoRow = ({ icon, label, value }) => (
  <div className="d-flex align-items-center py-2 px-3">
    <div
      className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
      style={{ width: 36, height: 36, backgroundColor: '#0d6efd14', color: '#0d6efd' }}
    >
      {icon}
    </div>
    <div className="overflow-hidden">
      <div className="small text-muted text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>{label}</div>
      <div className="fw-semibold text-truncate">{value}</div>
    </div>
  </div>
);

const AdminProfile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', current_password: '', new_password: '', confirm_password: '' });
  const fileRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await adminService.getProfile();
        setProfile(res.data?.data || null);
      } catch (err) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const data = profile?.user || user || {};
  const admin = profile?.admin || {};
  const roleLevel = admin.role_level || data.role_level || 'moderator';
  const isActive = data.is_active !== false;

  const initials = (data.name || 'A')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const openEdit = () => {
    setForm({ name: data.name || '', phone: data.phone || '', current_password: '', new_password: '', confirm_password: '' });
    setShowEdit(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required.');
      return;
    }
    if (form.new_password) {
      if (form.new_password.length < 6) {
        toast.error('New password must be at least 6 characters.');
        return;
      }
      if (form.new_password !== form.confirm_password) {
        toast.error('New password and confirmation do not match.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
      };
      if (form.new_password) {
        payload.current_password = form.current_password;
        payload.new_password = form.new_password;
      }

      const res = await adminService.updateProfile(payload);
      setProfile(res.data?.data || profile);
      setUser({ ...user, ...res.data.data.user });
      setShowEdit(false);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    const fd = new FormData();
    fd.append('profile_image', file);
    setUploadingPic(true);
    try {
      const res = await adminService.uploadProfilePicture(fd);
      setProfile(res.data?.data || null);
      setUser(res.data?.data?.user || user);
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload picture');
    } finally {
      setUploadingPic(false);
      e.target.value = '';
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <Link to="/admin/dashboard" className="btn btn-sm btn-outline-secondary rounded-3">
          <BsArrowLeft className="me-1" /> Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <>
          <div
            className="rounded-4 position-relative overflow-hidden text-white shadow-sm mb-4"
            style={{ background: 'linear-gradient(120deg, #0d6efd, #6610f2)', minHeight: 170 }}
          >
            <div className="p-4" style={{ background: 'radial-gradient(circle at 85% 20%, rgba(255,255,255,0.18), transparent 55%)' }}>
              <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center border border-2 border-white flex-shrink-0 position-relative"
                  style={{ width: 84, height: 84, fontSize: '1.9rem', fontWeight: 700, color: '#fff', backgroundColor: 'rgba(255,255,255,0.2)', cursor: 'pointer', overflow: 'hidden' }}
                  onClick={() => fileRef.current?.click()}
                  title="Upload profile picture"
                >
                  {data.profile_picture ? (
                    <img
                      src={`http://localhost:5000/${data.profile_picture}`}
                      alt={data.name}
                      className="rounded-circle w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    initials
                  )}
                  {uploadingPic ? (
                    <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <div className="spinner-border spinner-border-sm text-light" />
                    </div>
                  ) : (
                    <div className="position-absolute bottom-0 end-0 d-flex align-items-center justify-content-center rounded-circle" style={{ width: 26, height: 26, background: 'rgba(0,0,0,0.55)' }}>
                      <BsCamera size={12} color="#fff" />
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handlePicUpload} />
                <div className="flex-grow-1">
                  <h4 className="fw-bold mb-1">{data.name}</h4>
                  <p className="mb-2 text-white-50 small">{data.email}</p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-white text-primary px-3 py-2 rounded-pill">Administrator</span>
                    <span className={roleLevel === 'super_admin' ? 'badge bg-danger px-3 py-2 rounded-pill' : 'badge bg-secondary px-3 py-2 rounded-pill'}>
                      {roleLevel === 'super_admin' ? 'Super Admin' : 'Moderator'}
                    </span>
                    <span className={`badge ${isActive ? 'bg-success' : 'bg-danger'} px-3 py-2 rounded-pill`}>
                      {isActive ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                </div>
                <div className="ms-sm-auto">
                  <Button variant="light" className="rounded-3 fw-semibold" onClick={openEdit}>
                    <BsPencilSquare className="me-2" />Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom d-flex align-items-center">
                  <BsPersonBadge className="me-2 text-primary" />
                  <h6 className="mb-0 fw-semibold">Account Details</h6>
                </div>
                <div className="card-body p-0 py-2">
                  <InfoRow icon={<BsPersonCheck size={16} />} label="Username" value={data.name || 'N/A'} />
                  <div className="mx-3 border-top" />
                  <InfoRow icon={<BsEnvelope size={16} />} label="Email" value={data.email || 'N/A'} />
                  <div className="mx-3 border-top" />
                  <InfoRow icon={<BsPhone size={16} />} label="Phone" value={data.phone || 'N/A'} />
                  <div className="mx-3 border-top" />
                  <InfoRow icon={<BsShieldLock size={16} />} label="Role" value={data.role || 'admin'} />
                  <div className="mx-3 border-top" />
                  <InfoRow icon={<BsShieldCheck size={16} />} label="Role Level" value={roleLevel === 'super_admin' ? 'Super Admin' : 'Moderator'} />
                  <div className="mx-3 border-top" />
                  <InfoRow icon={<BsClockHistory size={16} />} label="Last Login" value={data.last_login ? new Date(data.last_login).toLocaleString() : 'Never'} />
                  <div className="mx-3 border-top" />
                  <InfoRow icon={<BsCalendarCheck size={16} />} label="Account Created" value={data.createdAt ? new Date(data.createdAt).toLocaleString() : 'N/A'} />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-bottom d-flex align-items-center">
                  <BsPatchCheck className="me-2 text-success" />
                  <h6 className="mb-0 fw-semibold">Access &amp; Security</h6>
                </div>
                <div className="card-body">
                  <p className="text-muted small mb-3">
                    You have full access to the admin panel. Use the Edit Profile button to update your
                    name, phone number, or password.
                  </p>
                  <ul className="list-unstyled mb-4 small">
                    <li className="mb-2"><BsShieldCheck className="text-success me-2" />Manage students, employers, jobs &amp; reviews</li>
                    <li className="mb-2"><BsShieldCheck className="text-success me-2" />Review and resolve platform reports</li>
                    <li className="mb-2"><BsShieldCheck className="text-success me-2" />Block or unblock user accounts</li>
                    <li className="mb-2"><BsShieldCheck className="text-success me-2" />Export CSV reports &amp; view system logs</li>
                  </ul>
                  <Button variant="outline-primary" className="rounded-3 w-100" onClick={openEdit}>
                    <BsKey className="me-2" />Change Name, Phone or Password
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5 fw-bold">Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="editName">
              <Form.Label className="fw-semibold small">Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="rounded-3"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editPhone">
              <Form.Label className="fw-semibold small">Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number (optional)"
                className="rounded-3"
              />
            </Form.Group>

            <div className="border-top pt-3 mb-3">
              <small className="text-muted fw-semibold">Change password (optional)</small>
            </div>
            <Form.Group className="mb-3" controlId="editCurrentPwd">
              <Form.Label className="fw-semibold small">Current Password</Form.Label>
              <Form.Control
                type="password"
                name="current_password"
                value={form.current_password}
                onChange={handleChange}
                placeholder="Enter current password"
                className="rounded-3"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editNewPwd">
              <Form.Label className="fw-semibold small">New Password</Form.Label>
              <Form.Control
                type="password"
                name="new_password"
                value={form.new_password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="rounded-3"
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="editConfirmPwd">
              <Form.Label className="fw-semibold small">Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter new password"
                className="rounded-3"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" className="rounded-3" onClick={() => setShowEdit(false)}>
            Cancel
          </Button>
          <Button variant="primary" className="rounded-3 fw-semibold" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminProfile;
