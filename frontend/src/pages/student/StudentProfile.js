import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCamera, FaSave, FaTimes, FaUser, FaPhone, FaUniversity, FaGraduationCap, FaMapMarkerAlt, FaDollarSign, FaMapPin, FaBookOpen, FaIdCard, FaArrowLeft, FaCheckCircle, FaRegCircle, FaPen, FaFilePdf, FaUpload, FaEye } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SECTION_ICONS = {
  personal: FaUser,
  education: FaGraduationCap,
  address: FaMapMarkerAlt,
  salary: FaDollarSign,
  cv: FaFilePdf,
};

const Field = ({ icon: Icon, label, name, value, onChange, disabled, type = 'text', children }) => (
  <div className="col-md-6">
    <label className="form-label small fw-semibold text-muted mb-1">{label}</label>
    <div className="input-group">
      <span className="input-group-text"><Icon size={13} /></span>
      {children || <input type={type} className="form-control" name={name} value={value} onChange={onChange} disabled={disabled} />}
    </div>
  </div>
);

const StudentProfile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const fileRef = useRef(null);
  const cvRef = useRef(null);
  const [picTimestamp, setPicTimestamp] = useState(Date.now());
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState({
    name: '', phone: '', university: '', degree: '', year_of_study: '',
    bio: '', address: '', permanent_address: '', current_address: '', nic: '',
    preferred_salary_min: '', preferred_salary_max: '', preferred_location: '',
  });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/students/profile');
      const data = res.data?.data || res.data;
      if (!data || !data.id) throw new Error('Invalid profile data');
      setProfile(data);
      const u = data.user || {};
      setForm({
        name: u.name || '', phone: u.phone || '', university: data.university || '',
        degree: data.degree || '', year_of_study: data.year_of_study?.toString() || '',
        bio: data.bio || '', address: data.address || '',
        permanent_address: data.permanent_address || '', current_address: data.current_address || '',
        nic: data.nic || '', preferred_salary_min: data.preferred_salary_min || '',
        preferred_salary_max: data.preferred_salary_max || '', preferred_location: data.preferred_location || '',
      });
      setLoadError('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load profile';
      setLoadError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/students/profile', {
        name: form.name, phone: form.phone, university: form.university, degree: form.degree,
        year_of_study: form.year_of_study, bio: form.bio, address: form.address,
        permanent_address: form.permanent_address, current_address: form.current_address,
        nic: form.nic, preferred_salary_min: form.preferred_salary_min || null,
        preferred_salary_max: form.preferred_salary_max || null, preferred_location: form.preferred_location,
      });
      toast.success('Profile updated!');
      setEditMode(false);
      await loadProfile();
      const me = await api.get('/auth/me');
      setUser(me.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    const fd = new FormData();
    fd.append('profile_image', file);
    setUploadingPic(true);
    try {
      await api.post('/students/upload-picture', fd);
      setPicTimestamp(Date.now());
      toast.success('Profile picture updated!');
      await loadProfile();
      const me = await api.get('/auth/me');
      setUser(me.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload picture');
    } finally { setUploadingPic(false); }
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are accepted.'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('CV must be less than 10MB.'); return; }
    const fd = new FormData();
    fd.append('cv', file);
    setUploadingCv(true);
    try {
      await api.post('/students/upload-cv', fd);
      toast.success('CV uploaded successfully!');
      await loadProfile();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload CV.');
    } finally { setUploadingCv(false); }
    e.target.value = '';
  };

  const handleCancel = () => { setEditMode(false); loadProfile(); };

  const getPicUrl = () => {
    if (profile?.user?.profile_picture) return `http://localhost:5000/${profile.user.profile_picture}?t=${picTimestamp}`;
    return null;
  };

  const completionPercent = profile ? Math.round(
    ['name', 'phone', 'university', 'degree', 'bio', 'nic', 'cv_file']
      .filter(f => {
        if (f === 'cv_file') return !!profile?.cv_file;
        if (f === 'name') return !!profile?.user?.name;
        return !!profile[f];
      }).length / 7 * 100
  ) : 0;

  const picUrl = getPicUrl();

  if (loading) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="text-muted mt-3">Loading your profile...</p>
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
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body">
                <div className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                  <FaTimes size={24} className="text-danger" />
                </div>
                <p className="text-muted mb-3">{loadError}</p>
                <button className="btn btn-primary px-4 rounded-pill" onClick={() => { setLoading(true); setLoadError(''); loadProfile(); }}>Retry</button>
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
        <div className="col-lg-7">

          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 className="fw-bold mb-1" style={{ fontSize: '1.35rem' }}>My Profile</h4>
              <p className="text-muted small mb-0">Manage your personal information</p>
            </div>
            <button
              className={`btn ${editMode ? 'btn-outline-secondary' : 'btn-primary'} rounded-pill px-3 fw-semibold`}
              onClick={() => setEditMode(!editMode)}
              style={{ fontSize: '0.85rem' }}
            >
              {editMode ? <><FaTimes className="me-1" /> Cancel</> : <><FaPen className="me-1" /> Edit Profile</>}
            </button>
          </div>

          {/* Profile Completion */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ height: 4, background: '#e9ecef' }}>
              <div style={{ height: '100%', width: `${completionPercent}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', transition: 'width 0.6s ease' }} />
            </div>
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-4">
                <div className="position-relative flex-shrink-0">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
                    style={{ width: 88, height: 88, cursor: 'pointer', border: '3px solid #7c3aed20' }}
                    onClick={() => fileRef.current?.click()}
                  >
                    {picUrl ? (
                      <img src={picUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center w-100 h-100" style={{ background: '#f3f0ff' }}>
                        <FaUser size={32} className="text-muted" />
                      </div>
                    )}
                    {uploadingPic && (
                      <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded-circle">
                        <div className="spinner-border spinner-border-sm text-light" />
                      </div>
                    )}
                  </div>
                  <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center border border-2 border-white" style={{ width: 30, height: 30 }}>
                    <FaCamera size={12} color="#fff" />
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handlePicUpload} />
                </div>
                <div className="flex-grow-1 min-w-0">
                  <h5 className="fw-bold mb-1">{profile?.user?.name || 'Student'}</h5>
                  <p className="text-muted small mb-2">{profile?.university || 'University not set'}</p>
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ flex: 1, height: 6, background: '#e9ecef', borderRadius: 3, maxWidth: 160 }}>
                      <div style={{ height: '100%', width: `${completionPercent}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </div>
                    <span className="small fw-semibold" style={{ color: '#7c3aed' }}>{completionPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <div className="card-body p-4">

              {/* Section: Personal */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, background: '#7c3aed15' }}>
                    <FaUser size={12} style={{ color: '#7c3aed' }} />
                  </div>
                  Personal Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted mb-1">Full Name</label>
                    <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} disabled={!editMode} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted mb-1">Phone</label>
                    <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleChange} disabled={!editMode} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-muted mb-1">Bio</label>
                    <textarea className="form-control" name="bio" rows={2} value={form.bio} onChange={handleChange} disabled={!editMode} placeholder="Tell employers about yourself..." />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted mb-1">NIC</label>
                    <input type="text" className="form-control" name="nic" value={form.nic} onChange={handleChange} disabled={!editMode} />
                  </div>
                </div>
              </div>

              <hr style={{ opacity: 0.5 }} />

              {/* Section: Education */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, background: '#10b98115' }}>
                    <FaGraduationCap size={12} style={{ color: '#10b981' }} />
                  </div>
                  Education
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted mb-1">University</label>
                    <input type="text" className="form-control" name="university" value={form.university} onChange={handleChange} disabled={!editMode} placeholder="e.g. University of Colombo" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted mb-1">Degree</label>
                    <input type="text" className="form-control" name="degree" value={form.degree} onChange={handleChange} disabled={!editMode} placeholder="e.g. BSc in Computer Science" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted mb-1">Year of Study</label>
                    <select className="form-select" name="year_of_study" value={form.year_of_study} onChange={handleChange} disabled={!editMode}>
                      <option value="">Select Year</option>
                      {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y}th Year</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <hr style={{ opacity: 0.5 }} />

              {/* Section: Address */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, background: '#f59e0b15' }}>
                    <FaMapMarkerAlt size={12} style={{ color: '#f59e0b' }} />
                  </div>
                  Address
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted mb-1">Permanent Address</label>
                    <input type="text" className="form-control" name="permanent_address" value={form.permanent_address} onChange={handleChange} disabled={!editMode} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted mb-1">Current Address</label>
                    <input type="text" className="form-control" name="current_address" value={form.current_address} onChange={handleChange} disabled={!editMode} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-muted mb-1">Preferred Location</label>
                    <input type="text" className="form-control" name="preferred_location" value={form.preferred_location} onChange={handleChange} disabled={!editMode} placeholder="e.g. Colombo, Kandy, Gampaha" />
                  </div>
                </div>
              </div>

              <hr style={{ opacity: 0.5 }} />

              {/* Section: Salary */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, background: '#0ea5e915' }}>
                    <FaDollarSign size={12} style={{ color: '#0ea5e9' }} />
                  </div>
                  Salary Expectation
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted mb-1">Min Salary (LKR)</label>
                    <input type="number" className="form-control" name="preferred_salary_min" value={form.preferred_salary_min} onChange={handleChange} disabled={!editMode} min="0" placeholder="0" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted mb-1">Max Salary (LKR)</label>
                    <input type="number" className="form-control" name="preferred_salary_max" value={form.preferred_salary_max} onChange={handleChange} disabled={!editMode} min="0" placeholder="0" />
                  </div>
                </div>
              </div>

              {/* Save / Cancel buttons */}
              {editMode && (
                <div className="d-flex gap-2 mt-4 pt-3 border-top justify-content-end">
                  <button className="btn btn-outline-secondary rounded-pill px-4" onClick={handleCancel}>Cancel</button>
                  <button className="btn btn-primary rounded-pill px-4" onClick={handleSave} disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-1" /> Saving...</> : <><FaSave className="me-1" /> Save Changes</>}
                  </button>
                </div>
              )}

              {/* CV Section */}
              <div className={`${editMode ? 'mt-4 pt-3 border-top' : 'mt-4'}`}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, background: '#ef444415' }}>
                    <FaFilePdf size={12} style={{ color: '#ef4444' }} />
                  </div>
                  <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>CV / Resume</h6>
                  <span className="badge bg-danger bg-opacity-10 text-danger small fw-normal">Required</span>
                </div>

                <div className={`rounded-3 p-4 ${profile?.cv_file ? 'bg-success bg-opacity-10 border border-success border-opacity-25' : 'bg-light border border-dashed'}`} style={{ textAlign: 'center' }}>
                  {profile?.cv_file ? (
                    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-success d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44 }}>
                          <FaFilePdf size={20} color="#fff" />
                        </div>
                        <div className="text-start">
                          <p className="fw-semibold mb-0 small">{profile.cv_file.split('/').pop()}</p>
                          <p className="text-success small mb-0"><FaCheckCircle className="me-1" />Uploaded</p>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <a href={`http://localhost:5000/${profile.cv_file}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill">
                          <FaEye className="me-1" /> View
                        </a>
                        <label className="btn btn-sm btn-outline-secondary rounded-pill mb-0" style={{ cursor: 'pointer' }}>
                          <FaUpload className="me-1" /> Replace
                          <input ref={cvRef} type="file" accept=".pdf" className="d-none" onChange={handleCvUpload} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 56, height: 56 }}>
                        <FaUpload size={22} className="text-muted" />
                      </div>
                      <p className="fw-semibold mb-1">Upload your CV</p>
                      <p className="text-muted small mb-3">PDF format, max 10MB</p>
                      <label className="btn btn-primary rounded-pill btn-sm px-4 mb-0" style={{ cursor: 'pointer' }}>
                        {uploadingCv ? <><span className="spinner-border spinner-border-sm me-1" /> Uploading...</> : <><FaUpload className="me-1" /> Choose File</>}
                        <input ref={cvRef} type="file" accept=".pdf" className="d-none" onChange={handleCvUpload} />
                      </label>
                      {uploadingCv && <div className="progress mt-3" style={{ height: 4 }}><div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: '100%' }}></div></div>}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
