import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { studentService } from '../../services/studentService';
import { BsPlus, BsTrash, BsPencil, BsCalendarWeek } from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [];
for (let h = 6; h <= 22; h++) {
  TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:00`);
}

const StudentTimetable = () => {
  const { data: timetable, loading, refetch } = useFetch('/students/timetable');
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    day: '',
    startTime: '09:00',
    endTime: '10:00',
    subject: '',
    isBusy: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (timetable) {
      setEntries(Array.isArray(timetable) ? timetable : timetable.entries || []);
    }
  }, [timetable]);

  const validate = () => {
    const newErrors = {};
    if (!form.day) newErrors.day = 'Day is required';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (form.startTime >= form.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    const overlap = entries.some(
      (e) =>
        e.day === form.day &&
        e._id !== editEntry?._id &&
        form.startTime < e.endTime &&
        form.endTime > e.startTime
    );
    if (overlap) newErrors.overlap = 'This time slot overlaps with an existing entry.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editEntry) {
        await studentService.updateTimetableEntry(editEntry._id, form);
        toast.success('Entry updated!');
      } else {
        await studentService.addTimetableEntry(form);
        toast.success('Entry added!');
      }
      setShowForm(false);
      setEditEntry(null);
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entryId) => {
    try {
      await studentService.deleteTimetableEntry(entryId);
      toast.info('Entry deleted.');
      refetch();
    } catch (err) {
      toast.error('Failed to delete entry.');
    }
  };

  const handleEdit = (entry) => {
    setForm({
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subject: entry.subject,
      isBusy: entry.isBusy,
    });
    setEditEntry(entry);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ day: '', startTime: '09:00', endTime: '10:00', subject: '', isBusy: true });
    setErrors({});
  };

  const openAddForm = () => {
    resetForm();
    setEditEntry(null);
    setShowForm(true);
  };

  const getEntriesForSlot = (day, time) => {
    return entries.filter((e) => e.day === day && e.startTime <= time && e.endTime > time);
  };

  if (loading) {
    return (
      <div className="container py-4">
        <h3 className="fw-bold mb-4">Timetable</h3>
        <div className="placeholder-glow">
          <div className="placeholder col-12" style={{ height: 400 }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          <BsCalendarWeek className="me-2" />Timetable
        </h3>
        <button className="btn btn-primary" onClick={openAddForm}>
          <BsPlus className="me-1" /> Add Entry
        </button>
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom">
            <h6 className="mb-0 fw-semibold">{editEntry ? 'Edit Entry' : 'Add New Entry'}</h6>
          </div>
          <div className="card-body">
            {errors.overlap && <div className="alert alert-danger">{errors.overlap}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-3">
                  <label className="form-label small fw-semibold">Day</label>
                  <select
                    className={`form-select ${errors.day ? 'is-invalid' : ''}`}
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value })}
                  >
                    <option value="">Select Day</option>
                    {DAYS.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  {errors.day && <div className="invalid-feedback">{errors.day}</div>}
                </div>
                <div className="col-12 col-md-2">
                  <label className="form-label small fw-semibold">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-2">
                  <label className="form-label small fw-semibold">End Time</label>
                  <input
                    type="time"
                    className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  />
                  {errors.endTime && <div className="invalid-feedback">{errors.endTime}</div>}
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label small fw-semibold">Subject</label>
                  <input
                    type="text"
                    className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                    placeholder="e.g., Math Lecture"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                  {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                </div>
                <div className="col-12 col-md-2 d-flex align-items-end">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isBusy"
                      checked={form.isBusy}
                      onChange={(e) => setForm({ ...form, isBusy: e.target.checked })}
                    />
                    <label className="form-check-label small" htmlFor="isBusy">
                      {form.isBusy ? 'Busy' : 'Available'}
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    editEntry ? 'Update Entry' : 'Add Entry'
                  )}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-bordered mb-0" style={{ minWidth: 800 }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: 80 }}>Time</th>
                {DAYS.map((day) => (
                  <th key={day} className="text-center">{day.slice(0, 3)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time}>
                  <td className="small fw-semibold text-muted">{time}</td>
                  {DAYS.map((day) => {
                    const slotEntries = getEntriesForSlot(day, time);
                    const entry = slotEntries[0];
                    return (
                      <td
                        key={`${day}-${time}`}
                        className={`text-center position-relative ${
                          entry
                            ? entry.isBusy
                              ? 'bg-danger bg-opacity-10'
                              : 'bg-success bg-opacity-10'
                            : ''
                        }`}
                        style={{ minWidth: 100, height: 40 }}
                      >
                        {entry && (
                          <div className="d-flex flex-column align-items-center justify-content-center h-100">
                            <span className="small fw-semibold">{entry.subject}</span>
                            <div className="d-flex gap-1 mt-1">
                              <button
                                className="btn btn-link btn-sm p-0 text-primary"
                                onClick={() => handleEdit(entry)}
                              >
                                <BsPencil size={12} />
                              </button>
                              <button
                                className="btn btn-link btn-sm p-0 text-danger"
                                onClick={() => handleDelete(entry._id)}
                              >
                                <BsTrash size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="d-flex gap-3 mt-3">
        <div className="d-flex align-items-center">
          <div className="rounded me-2" style={{ width: 16, height: 16, backgroundColor: 'rgba(220, 53, 69, 0.1)' }}></div>
          <small className="text-muted">Busy</small>
        </div>
        <div className="d-flex align-items-center">
          <div className="rounded me-2" style={{ width: 16, height: 16, backgroundColor: 'rgba(25, 135, 84, 0.1)' }}></div>
          <small className="text-muted">Available</small>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;
