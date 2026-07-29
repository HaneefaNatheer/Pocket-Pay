import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCamera, FaSave, FaTimes, FaUser, FaPhone, FaUniversity, FaGraduationCap, FaMapMarkerAlt, FaDollarSign, FaMapPin, FaBookOpen, FaIdCard } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const StudentProfile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const fileRef = useRef(null);
  const [picTimestamp, setPicTimestamp] = useState(Date.now());
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    university: '',
    degree: '',
    year_of_study: '',
    bio: '',
    address: '',
    permanent_address: '',
    current_address: '',
    nic: '',
    preferred_salary_min: '',
    preferred_salary_max: '',
    preferred_location: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/students/profile');
      console.log('[Profile] API response:', res.data);
      const data = res.data?.data || res.data;
      if (!data || !data.id) {
        throw new Error('Invalid profile data received');
      }
      setProfile(data);
      const u = data.user || {};
      console.log('[Profile] Setting form with:', { ...data, user: u });
      setForm({
        name: u.name || '',
        phone: u.phone || '',
        university: data.university || '',
        degree: data.degree || '',
        year_of_study: data.year_of_study?.toString() || '',
        bio: data.bio || '',
        address: data.address || '',
        permanent_address: data.permanent_address || '',
        current_address: data.current_address || '',
        nic: data.nic || '',
        preferred_salary_min: data.preferred_salary_min || '',
        preferred_salary_max: data.preferred_salary_max || '',
        preferred_location: data.preferred_location || '',
      });
      setLoadError('');
    } catch (err) {
      console.error('[Profile] Load error:', err?.response?.data || err.message);
      const msg = err?.response?.data?.message || err.message || 'Failed to load profile';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        university: form.university,
        degree: form.degree,
        year_of_study: form.year_of_study,
        bio: form.bio,
        address: form.address,
        permanent_address: form.permanent_address,
        current_address: form.current_address,
        nic: form.nic,
        preferred_salary_min: form.preferred_salary_min || null,
        preferred_salary_max: form.preferred_salary_max || null,
        preferred_location: form.preferred_location,
      };
      await api.put('/students/profile', payload);
      toast.success('Profile updated!');
      setEditMode(false);
      await loadProfile();
      const me = await api.get('/auth/me');
      setUser(me.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
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
      console.log('[ProfilePic] Uploading...');
      const res = await api.post('/students/upload-picture', fd);
      console.log('[ProfilePic] Upload success:', res.data);
      setPicTimestamp(Date.now());
      toast.success('Profile picture updated!');
      await loadProfile();
      const me = await api.get('/auth/me');
      setUser(me.data.data);
    } catch (err) {
      console.error('[ProfilePic] Upload error:', err?.response?.data || err.message);
      const msg = err?.response?.data?.message || err.message || 'Failed to upload picture';
      toast.error(msg);
    } finally {
      setUploadingPic(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    loadProfile();
  };

  const getPicUrl = () => {
    if (profile?.user?.profile_picture) return `http://localhost:5000/${profile.user.profile_picture}?t=${picTimestamp}`;
    return null;
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="text-muted mt-2 mb-0">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <p className="text-danger mb-3">{loadError}</p>
                <button className="btn btn-primary px-4" onClick={() => { setLoading(true); setLoadError(''); loadProfile(); }}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">My Profile</h4>
                <button
                  className={`btn ${editMode ? 'btn-outline-secondary' : 'btn-primary'} rounded-3 px-3`}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? <><FaTimes className="me-1" /> Cancel</> : <>Edit Profile</>}
                </button>
              </div>

              <div className="text-center mb-4">
                <div
                  className="position-relative d-inline-block"
                  style={{ cursor: 'pointer' }}
                  onClick={() => fileRef.current?.click()}
                >
                  {getPicUrl() ? (
                    <img
                      src={getPicUrl()}
                      alt="Profile"
                      className="rounded-circle border"
                      style={{ width: 120, height: 120, objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto border" style={{ width: 120, height: 120 }}>
                      <FaUser size={40} className="text-muted" />
                    </div>
                  )}
                  <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                    <FaCamera size={14} color="#fff" />
                  </div>
                  {uploadingPic && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded-circle">
                      <div className="spinner-border spinner-border-sm text-light" />
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handlePicUpload} />
                <p className="text-muted small mt-2 mb-0">Click photo to change</p>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaUser size={14} /></span>
                    <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} disabled={!editMode} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Phone</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaPhone size={14} /></span>
                    <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleChange} disabled={!editMode} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">University</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaUniversity size={14} /></span>
                    <input type="text" className="form-control" name="university" value={form.university} onChange={handleChange} disabled={!editMode} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Degree</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaGraduationCap size={14} /></span>
                    <input type="text" className="form-control" name="degree" value={form.degree} onChange={handleChange} disabled={!editMode} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Year of Study</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaBookOpen size={14} /></span>
                    <select className="form-select" name="year_of_study" value={form.year_of_study} onChange={handleChange} disabled={!editMode}>
                      <option value="">Select Year</option>
                      {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>{y}th Year</option>)}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">NIC</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaIdCard size={14} /></span>
                    <input type="text" className="form-control" name="nic" value={form.nic} onChange={handleChange} disabled={!editMode} />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted mb-1">Bio</label>
                  <textarea className="form-control" name="bio" rows={3} value={form.bio} onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Permanent Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaMapMarkerAlt size={14} /></span>
                    <input type="text" className="form-control" name="permanent_address" value={form.permanent_address} onChange={handleChange} disabled={!editMode} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Current Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaMapMarkerAlt size={14} /></span>
                    <input type="text" className="form-control" name="current_address" value={form.current_address} onChange={handleChange} disabled={!editMode} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Min Salary (LKR)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaDollarSign size={14} /></span>
                    <input type="number" className="form-control" name="preferred_salary_min" value={form.preferred_salary_min} onChange={handleChange} disabled={!editMode} min="0" />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Max Salary (LKR)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaDollarSign size={14} /></span>
                    <input type="number" className="form-control" name="preferred_salary_max" value={form.preferred_salary_max} onChange={handleChange} disabled={!editMode} min="0" />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted mb-1">Preferred Location</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaMapPin size={14} /></span>
                    <input type="text" className="form-control" name="preferred_location" value={form.preferred_location} onChange={handleChange} disabled={!editMode} />
                  </div>
                </div>
              </div>

              {editMode && (
                <div className="d-flex gap-2 mt-4 pt-3 border-top justify-content-end">
                  <button className="btn btn-outline-secondary px-4" onClick={handleCancel}>Cancel</button>
                  <button className="btn btn-primary px-4" onClick={handleSave} disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-1" /> Saving...</> : <><FaSave className="me-1" /> Save Changes</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
