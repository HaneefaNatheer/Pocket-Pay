import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCamera, FaSave, FaTimes, FaCheck, FaIndustry, FaGlobe, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBuilding, FaUserTie } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const industries = ['IT', 'Education', 'Marketing', 'Retail', 'Delivery', 'Healthcare', 'Finance', 'Other'];

const EmployerProfile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    company_name: '',
    contact_person: '',
    company_email: '',
    company_phone: '',
    company_website: '',
    company_address: '',
    industry: '',
    company_size: '',
    company_description: '',
    business_registration: '',
  });

  const fieldMeta = [
    { key: 'company_name', label: 'Company Name', icon: FaBuilding },
    { key: 'contact_person', label: 'Contact Person', icon: FaUserTie },
    { key: 'company_email', label: 'Business Email', icon: FaEnvelope, type: 'email' },
    { key: 'company_phone', label: 'Phone Number', icon: FaPhone, type: 'tel' },
    { key: 'company_website', label: 'Website', icon: FaGlobe, type: 'url' },
    { key: 'company_address', label: 'Company Address', icon: FaMapMarkerAlt },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/employers/profile');
      const data = res.data?.data || res.data;
      setProfile(data);
      setForm({
        company_name: data.company_name || '',
        contact_person: data.contact_person || '',
        company_email: data.company_email || user?.email || '',
        company_phone: data.company_phone || '',
        company_website: data.company_website || '',
        company_address: data.company_address || '',
        industry: data.industry || '',
        company_size: data.company_size || '',
        company_description: data.company_description || '',
        business_registration: data.business_registration || '',
      });
      setLoadError(false);
    } catch {
      setLoadError(true);
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
      const payload = { ...form };
      await api.put('/employers/profile', payload);
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

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    const fd = new FormData();
    fd.append('logo', file);
    setUploading(true);
    try {
      await api.post('/employers/upload-logo', fd);
      toast.success('Logo updated!');
      await loadProfile();
      const me = await api.get('/auth/me');
      setUser(me.data.data);
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const getLogoUrl = () => {
    if (profile?.company_logo) return `http://localhost:5000/${profile.company_logo}`;
    return null;
  };

  const handleCancel = () => {
    setEditMode(false);
    loadProfile();
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" />
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
                <h5 className="text-muted mb-3">Failed to load profile.</h5>
                <button className="btn btn-primary rounded-3 px-4" onClick={() => { setLoading(true); loadProfile(); }}>
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
                <h4 className="fw-bold mb-0">Company Profile</h4>
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
                  {getLogoUrl() ? (
                    <img
                      src={getLogoUrl()}
                      alt="Logo"
                      className="rounded-circle border"
                      style={{ width: 120, height: 120, objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto border"
                      style={{ width: 120, height: 120 }}
                    >
                      <FaBuilding size={40} className="text-muted" />
                    </div>
                  )}
                  <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                    <FaCamera size={14} color="#fff" />
                  </div>
                  {uploading && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded-circle">
                      <div className="spinner-border spinner-border-sm text-light" />
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleLogoUpload} />
                <p className="text-muted small mt-2 mb-0">Click logo to change</p>
              </div>

              <div className="row g-3">
                {fieldMeta.map(({ key, label, icon: Icon, type = 'text' }) => (
                  <div className="col-md-6" key={key}>
                    <label className="form-label small fw-semibold text-muted mb-1">{label}</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light"><Icon size={14} /></span>
                      <input
                        type={type}
                        className="form-control"
                        name={key}
                        value={form[key]}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                ))}

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Industry</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaIndustry size={14} /></span>
                    <select className="form-select" name="industry" value={form.industry} onChange={handleChange} disabled={!editMode}>
                      <option value="">Select Industry</option>
                      {industries.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Company Size</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaBuilding size={14} /></span>
                    <select className="form-select" name="company_size" value={form.company_size} onChange={handleChange} disabled={!editMode}>
                      <option value="">Select Size</option>
                      {['1-10', '11-50', '51-200', '201-500', '500+'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted mb-1">Company Description</label>
                  <textarea
                    className="form-control"
                    name="company_description"
                    rows={3}
                    value={form.company_description}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Business Registration No.</label>
                  <input
                    type="text"
                    className="form-control"
                    name="business_registration"
                    value={form.business_registration}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
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

export default EmployerProfile;
