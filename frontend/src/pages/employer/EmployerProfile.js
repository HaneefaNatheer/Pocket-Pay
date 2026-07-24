import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employerService } from '../../services/employerService';
import { BsCamera, BsPencil, BsUpload, BsShieldCheck, BsExclamationTriangle } from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const EmployerProfile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    industry: '',
    companySize: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await employerService.getProfile();
        const data = res.data?.data || res.data;
        setProfile(data);
        setFormData({
          companyName: data.companyName || data.name || '',
          description: data.description || '',
          website: data.website || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          industry: data.industry || '',
          companySize: data.companySize || '',
        });
      } catch (err) {
        toast.error('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await employerService.updateProfile(formData);
      toast.success('Profile updated successfully!');
      setEditMode(false);
      const res = await employerService.getProfile();
      const data = res.data?.data || res.data;
      setProfile(data);
      if (setUser) setUser((prev) => ({ ...prev, ...data }));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoClick = () => fileInputRef.current?.click();

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('logo', file);
    setUploadingLogo(true);
    try {
      await employerService.uploadLogo(fd);
      toast.success('Logo updated!');
      const res = await employerService.getProfile();
      const data = res.data?.data || res.data;
      setProfile(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('document', file);
    setUploadingDoc(true);
    try {
      await employerService.uploadVerificationDocument?.(fd) || await employerService.updateProfile(fd);
      toast.success('Verification document uploaded!');
      const res = await employerService.getProfile();
      setProfile(res.data?.data || res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const isVerified = profile?.isVerified || profile?.verified;

  if (loading) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5 placeholder-glow">
                <div className="rounded-circle bg-secondary mx-auto mb-3" style={{ width: 120, height: 120 }}></div>
                <div className="placeholder col-6 mx-auto mb-2" style={{ height: 24 }}></div>
                <div className="placeholder col-4 mx-auto" style={{ height: 16 }}></div>
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
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="fw-bold mb-0">Company Profile</h4>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {isVerified !== undefined && (
                    <span className={`badge rounded-pill ${isVerified ? 'bg-success' : 'bg-warning text-dark'}`}>
                      <BsShieldCheck className="me-1" />
                      {isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  )}
                  <button
                    className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => setEditMode(!editMode)}
                  >
                    <BsPencil className="me-1" />
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              <div className="text-center mb-4">
                <div
                  className="position-relative d-inline-block"
                  style={{ cursor: 'pointer' }}
                  onClick={handleLogoClick}
                >
                  <img
                    src={profile?.logo || profile?.picture || 'https://via.placeholder.com/120?text=Logo'}
                    alt="Company Logo"
                    className="rounded-circle"
                    style={{ width: 120, height: 120, objectFit: 'cover' }}
                  />
                  <div
                    className="position-absolute bottom-0 end-0 rounded-circle bg-primary d-flex align-items-center justify-content-center"
                    style={{ width: 36, height: 36, color: '#fff' }}
                  >
                    <BsCamera />
                  </div>
                  {uploadingLogo && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded-circle">
                      <div className="spinner-border spinner-border-sm text-light"></div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleLogoUpload}
                />
                <p className="text-muted small mt-2 mb-0">Click to change company logo</p>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Website</label>
                  <input
                    type="url"
                    className="form-control"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder="https://"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Industry</label>
                  <select
                    className="form-select"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    disabled={!editMode}
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Design">Design</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Sales">Sales</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Company Size</label>
                  <select
                    className="form-select"
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    disabled={!editMode}
                  >
                    <option value="">Select Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Company Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder="Tell students about your company..."
                  />
                </div>
              </div>

              {editMode && (
                <div className="mt-4">
                  <button
                    className="btn btn-primary px-4"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="fw-semibold mb-0">Verification Documents</h5>
            </div>
            <div className="card-body">
              {!isVerified && (
                <div className="alert alert-warning d-flex align-items-center mb-3">
                  <BsExclamationTriangle className="me-2 flex-shrink-0" />
                  <span>Upload verification documents to get your company verified.</span>
                </div>
              )}
              {profile?.verificationDocument ? (
                <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                  <div className="d-flex align-items-center">
                    <BsShieldCheck size={24} className="text-success me-3" />
                    <div>
                      <p className="mb-0 fw-semibold">Verification document uploaded</p>
                      <small className="text-muted">Under review</small>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => docInputRef.current?.click()}
                    disabled={uploadingDoc}
                  >
                    {uploadingDoc ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <BsUpload className="me-2" />
                        Upload Verification Document
                      </>
                    )}
                  </button>
                  <input
                    ref={docInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    className="d-none"
                    onChange={handleDocUpload}
                  />
                  <p className="text-muted small mt-2">Supports PDF, DOC, DOCX, JPG, PNG</p>
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
