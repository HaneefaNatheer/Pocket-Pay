import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { studentService } from '../../services/studentService';
import { BsCamera, BsPencil, BsUpload, BsDownload, BsFileEarmarkText } from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const { data: profile, loading, refetch } = useFetch('/students/profile');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const fileInputRef = useRef(null);
  const cvInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    university: '',
    degree: '',
    yearOfStudy: '',
    bio: '',
    address: '',
    salaryMin: '',
    salaryMax: '',
    preferredLocation: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [cvDragging, setCvDragging] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        university: profile.university || '',
        degree: profile.degree || '',
        yearOfStudy: profile.yearOfStudy || '',
        bio: profile.bio || '',
        address: profile.address || '',
        salaryMin: profile.salaryMin || '',
        salaryMax: profile.salaryMax || '',
        preferredLocation: profile.preferredLocation || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await studentService.updateProfile(formData);
      toast.success('Profile updated successfully!');
      setEditMode(false);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePictureClick = () => fileInputRef.current?.click();

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('picture', file);
    setUploadingPicture(true);
    try {
      await studentService.uploadPicture(fd);
      toast.success('Profile picture updated!');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload picture.');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleCVUpload = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('cv', file);
    setUploadingCV(true);
    try {
      await studentService.uploadCV(fd);
      toast.success('CV uploaded successfully!');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload CV.');
    } finally {
      setUploadingCV(false);
    }
  };

  const handleCVFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      handleCVUpload(file);
    }
  };

  const handleCVDrop = (e) => {
    e.preventDefault();
    setCvDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setCvFile(file);
      handleCVUpload(file);
    }
  };

  const handleCVDragOver = (e) => {
    e.preventDefault();
    setCvDragging(true);
  };

  const handleCVDragLeave = () => setCvDragging(false);

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
                <h4 className="fw-bold mb-0">My Profile</h4>
                <button
                  className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => setEditMode(!editMode)}
                >
                  <BsPencil className="me-1" />
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="text-center mb-4">
                <div
                  className="position-relative d-inline-block"
                  style={{ cursor: 'pointer' }}
                  onClick={handlePictureClick}
                >
                  <img
                    src={profile?.picture || 'https://via.placeholder.com/120'}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: 120, height: 120, objectFit: 'cover' }}
                  />
                  <div
                    className="position-absolute bottom-0 end-0 rounded-circle bg-primary d-flex align-items-center justify-content-center"
                    style={{ width: 36, height: 36, color: '#fff' }}
                  >
                    <BsCamera />
                  </div>
                  {uploadingPicture && (
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
                  onChange={handlePictureUpload}
                />
                <p className="text-muted small mt-2 mb-0">Click to change profile picture</p>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profile?.email || ''}
                    disabled
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
                  <label className="form-label small fw-semibold">University</label>
                  <input
                    type="text"
                    className="form-control"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Degree</label>
                  <input
                    type="text"
                    className="form-control"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Year of Study</label>
                  <select
                    className="form-select"
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    disabled={!editMode}
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Bio</label>
                  <textarea
                    className="form-control"
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
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
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Minimum Salary ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    disabled={!editMode}
                    min="0"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Maximum Salary ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    disabled={!editMode}
                    min="0"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Preferred Location</label>
                  <input
                    type="text"
                    className="form-control"
                    name="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={handleChange}
                    disabled={!editMode}
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
              <h5 className="fw-semibold mb-0">CV / Resume</h5>
            </div>
            <div className="card-body">
              {profile?.cv ? (
                <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                  <div className="d-flex align-items-center">
                    <BsFileEarmarkText size={24} className="text-primary me-3" />
                    <div>
                      <p className="mb-0 fw-semibold">{profile.cv.split('/').pop()}</p>
                      <small className="text-muted">Uploaded</small>
                    </div>
                  </div>
                  <a
                    href={profile.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    <BsDownload className="me-1" /> Download
                  </a>
                </div>
              ) : (
                <div
                  className={`border border-2 border-dashed rounded p-5 text-center ${cvDragging ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                  onDrop={handleCVDrop}
                  onDragOver={handleCVDragOver}
                  onDragLeave={handleCVDragLeave}
                  style={{ cursor: 'pointer' }}
                  onClick={() => cvInputRef.current?.click()}
                >
                  <BsUpload size={32} className="text-muted mb-2" />
                  <p className="mb-1">Drag & drop your CV here, or <span className="text-primary">browse</span></p>
                  <small className="text-muted">Supports PDF, DOC, DOCX (Max 5MB)</small>
                </div>
              )}
              <input
                ref={cvInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="d-none"
                onChange={handleCVFileSelect}
              />
              {uploadingCV && (
                <div className="text-center mt-3">
                  <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                  Uploading CV...
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
