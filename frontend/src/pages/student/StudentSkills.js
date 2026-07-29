import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { studentService } from '../../services/studentService';
import { BsPlus, BsX, BsLightning, BsPieChart } from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const proficiencyColors = {
  beginner: 'bg-secondary',
  intermediate: 'bg-info',
  advanced: 'bg-primary',
  expert: 'bg-success',
};

const proficiencyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

const skillCategories = {
  'Programming': ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift'],
  'Web Development': ['HTML/CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Express', 'Next.js', 'SASS'],
  'Data Science': ['SQL', 'R', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Tableau', 'Power BI', 'Machine Learning', 'Deep Learning'],
  'Cloud & DevOps': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD', 'Terraform', 'Linux'],
  'Design': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX', 'Wireframing', 'Prototyping', 'Sketch'],
  'Soft Skills': ['Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Time Management', 'Project Management'],
};

const StudentSkills = () => {
  const { data: profile, loading, refetch } = useFetch('/students/profile');
  const [skills, setSkills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', proficiency: 'intermediate' });
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [matchPercentage, setMatchPercentage] = useState(0);

  useEffect(() => {
    if (profile?.skills) {
      setSkills(profile.skills);
    }
  }, [profile]);

  useEffect(() => {
    if (skills.length > 0 && profile?.preferredSkills) {
      const matched = skills.filter((s) => profile.preferredSkills.includes(s.name)).length;
      setMatchPercentage(Math.round((matched / profile.preferredSkills.length) * 100));
    } else {
      setMatchPercentage(0);
    }
  }, [skills, profile]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setForm({ ...form, name: val });
    if (val.length > 0) {
      const allSkills = Object.values(skillCategories).flat();
      const filtered = allSkills.filter(
        (s) => s.toLowerCase().includes(val.toLowerCase()) && !skills.some((sk) => sk.name === s)
      );
      setSuggestions(filtered.slice(0, 6));
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (skill) => {
    setForm({ ...form, name: skill });
    setSearchTerm(skill);
    setSuggestions([]);
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warning('Please enter a skill name.');
      return;
    }
    if (skills.some((s) => s.name.toLowerCase() === form.name.toLowerCase())) {
      toast.warning('Skill already added.');
      return;
    }
    setSaving(true);
    try {
      await studentService.addSkill(form);
      toast.success('Skill added!');
      setForm({ name: '', proficiency: 'intermediate' });
      setSearchTerm('');
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add skill.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (skillName) => {
    try {
      await studentService.removeSkill(skillName);
      toast.info('Skill removed.');
      refetch();
    } catch (err) {
      toast.error('Failed to remove skill.');
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <h3 className="fw-bold mb-4">My Skills</h3>
        <div className="placeholder-glow">
          <div className="row g-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="col-12 col-sm-6 col-md-4">
                <div className="placeholder rounded" style={{ height: 80 }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">My Skills</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <BsPlus className="me-1" /> Add Skill
        </button>
      </div>

      {skills.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <BsPieChart size={24} className="text-primary me-3" />
              <div>
                <h6 className="mb-0 fw-semibold">Skill Match</h6>
                <div className="progress mt-1" style={{ height: 8, width: 200 }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: `${matchPercentage}%` }}
                  ></div>
                </div>
                <small className="text-muted">{matchPercentage}% match with preferred skills</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom">
            <h6 className="mb-0 fw-semibold">Add New Skill</h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddSkill}>
              <div className="row g-3">
                <div className="col-12 col-md-6 position-relative">
                  <label className="form-label small fw-semibold">Skill Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type to search skills..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    autoComplete="off"
                  />
                  {suggestions.length > 0 && (
                    <div className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="list-group-item list-group-item-action"
                          onClick={() => selectSuggestion(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Proficiency</label>
                  <select
                    className="form-select"
                    value={form.proficiency}
                    onChange={(e) => setForm({ ...form, proficiency: e.target.value })}
                  >
                    {proficiencyLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-2 d-flex align-items-end">
                  <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                    {saving ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      'Add'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {skills.length > 0 ? (
        <div className="row g-3">
          {skills.map((skill, idx) => (
            <div key={idx} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1 fw-semibold">{skill.name}</h6>
                    <span className={`badge ${proficiencyColors[skill.proficiency] || 'bg-secondary'}`}>
                      {skill.proficiency || 'intermediate'}
                    </span>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemoveSkill(skill.name)}
                  >
                    <BsX />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <BsLightning size={48} className="text-muted mb-3" />
          <h5 className="text-muted">Add your skills to get better job matches</h5>
          <p className="text-muted">Skills help employers find you and improve your job recommendations.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <BsPlus className="me-1" /> Add Your First Skill
          </button>
        </div>
      )}

      <div className="mt-5">
        <h5 className="fw-semibold mb-3">Browse by Category</h5>
        <div className="row g-3">
          {Object.entries(skillCategories).map(([category, catSkills]) => (
            <div key={category} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-bottom">
                  <h6 className="mb-0 fw-semibold">{category}</h6>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-1">
                    {catSkills.map((s) => {
                      const isAdded = skills.some((sk) => sk.name === s);
                      return (
                        <span
                          key={s}
                          className={`badge ${isAdded ? 'bg-success' : 'bg-light text-dark'}`}
                          style={{ cursor: isAdded ? 'default' : 'pointer' }}
                          onClick={() => {
                            if (!isAdded) {
                              setForm({ ...form, name: s });
                              setSearchTerm(s);
                              setShowForm(true);
                            }
                          }}
                        >
                          {isAdded && <BsLightning className="me-1" />}{s}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentSkills;
