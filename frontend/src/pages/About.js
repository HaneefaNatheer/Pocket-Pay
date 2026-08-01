import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBullseye,
  FaEye,
  FaLightbulb,
  FaHeart,
  FaGlobe,
  FaRocket,
  FaHandshake,
  FaGraduationCap,
  FaBriefcase,
  FaBuilding,
  FaStar,
  FaQuoteLeft,
  FaLinkedin,
  FaTwitter,
  FaGithub,
} from "react-icons/fa";
import natheerImg from "../assets/images/natheer.png";
import elanImg from "../assets/images/Elan.off.jpeg";
import manojImg from "../assets/images/Manoj.off.png";
import neththiImg from "../assets/images/Naveen.off.png";

function RevealOnScroll({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay * 1000);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal-on-scroll ${visible ? "revealed" : ""}`}>
      {children}
    </div>
  );
}

function CountUp({ end, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 2000;
          const step = Math.ceil(end / (duration / 16));
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const teamMembers = [
  {
    name: "M.H.M. Natheer",
    role: "Developer &  Leader",
    bio: "Led the development team and contributed to both frontend and backend of the Pocket-Pay platform.",
    image: natheerImg,
    color: "#7c3aed",
    delay: 0,
  },
  {
    name: "N.A.N.D. Neththikumara",
    role: "Developer & Member",
    bio: "Worked on frontend UI, backend logic, and database integration.",
    image: neththiImg,
    color: "#ec4899",
    delay: 0.15,
  },
  {
    name: "S. Elankeethan",
    role: "Developer & Member",
    bio: "Involved in full-stack development including UI design and API implementation.",
    image: elanImg,
    color: "#f59e0b",
    delay: 0.3,
  },
  {
    name: "T. Manoj",
    role: "Developer & Member",
    bio: "Handled frontend components, backend services, and database management.",
    image: manojImg,
    color: "#10b981",
    delay: 0.45,
  },
];

const values = [
  {
    icon: FaHeart,
    title: "Integrity",
    description:
      "We operate with transparency and honesty in everything we do. Your trust is our foundation.",
    color: "#ec4899",
    bg: "#fdf2f8",
  },
  {
    icon: FaLightbulb,
    title: "Innovation",
    description:
      "We constantly evolve our platform using cutting-edge technology to serve you better.",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    icon: FaGlobe,
    title: "Inclusion",
    description:
      "We believe every student deserves equal access to quality part-time job opportunities.",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    icon: FaRocket,
    title: "Impact",
    description:
      "We measure success by the positive difference we make in students' lives and careers.",
    color: "#10b981",
    bg: "#ecfdf5",
  },
];

const milestones = [
  {
    year: "2024",
    title: "The Beginning",
    desc: "Pocket-Pay was born at a university hackathon with a simple mission.",
  },
  {
    year: "2024",
    title: "First 100 Students",
    desc: "Reached our first 100 student registrations within 3 months.",
  },
  {
    year: "2025",
    title: "Employer Network",
    desc: "Onboarded 50+ verified employers across multiple cities.",
  },
  {
    year: "2025",
    title: "1,000+ Connections",
    desc: "Facilitated over 1,000 successful student-employer matches.",
  },
];

export default function About() {
  const navigate = useNavigate();

  const [stats, setStats] = useState([
    {
      icon: FaGraduationCap,
      value: 1000,
      suffix: "+",
      label: "Students Registered",
      end: 1000,
    },
    {
      icon: FaBuilding,
      value: 200,
      suffix: "+",
      label: "Verified Employers",
      end: 200,
    },
    {
      icon: FaBriefcase,
      value: 500,
      suffix: "+",
      label: "Jobs Posted",
      end: 500,
    },
    {
      icon: FaStar,
      value: 48,
      suffix: "",
      label: "Average Rating",
      end: 48,
      display: "4.8/5",
    },
  ]);

  return (
    <div className="about-page">
      {/* Hero Banner */}
      <section className="about-hero-section">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        <div className="container position-relative">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <span className="hero-badge mb-4">
                <FaRocket className="me-2" />
                Our Story
              </span>
              <h1 className="hero-title mb-4">
                About <span className="text-gradient">Pocket-Pay</span>
              </h1>
              <p className="hero-subtitle mb-4">
                Empowering students to find meaningful work opportunities that
                align with their skills, schedules, and career aspirations.
              </p>
              <div className="hero-cta">
                <button
                  className="btn btn-primary-gradient btn-lg px-5"
                  onClick={() => navigate("/")}
                >
                  <FaGraduationCap className="me-2" />
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="mission-card p-4 p-lg-5 h-100">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="icon-circle icon-circle-primary">
                    <FaBullseye size={24} />
                  </div>
                  <h3 className="mb-0">Our Mission</h3>
                </div>
                <p className="text-muted mb-0 fs-5" style={{ lineHeight: 1.8 }}>
                  To bridge the gap between students seeking meaningful
                  part-time work and employers looking for talented, motivated
                  individuals. We strive to make the job search process
                  seamless, safe, and successful for every student.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="vision-card p-4 p-lg-5 h-100">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="icon-circle icon-circle-secondary">
                    <FaEye size={24} />
                  </div>
                  <h3 className="mb-0">Our Vision</h3>
                </div>
                <p className="text-muted mb-0 fs-5" style={{ lineHeight: 1.8 }}>
                  To become the most trusted and comprehensive platform
                  connecting students with part-time employment opportunities
                  worldwide, creating a community where every student can gain
                  real-world experience while studying.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story + Milestones */}
      <section className="our-story-section py-5">
        <div className="container">
          <div className="row align-items-center g-5 mb-5">
            <div className="col-lg-6">
              <span className="section-badge">How It Started</span>
              <h2 className="section-title">
                Our <span className="text-gradient">Story</span>
              </h2>
              <p className="text-muted fs-5" style={{ lineHeight: 1.8 }}>
                Pocket-Pay was born from a simple observation: students struggle
                to find part-time jobs that fit their unique schedules and skill
                sets, while employers struggle to find reliable student workers.
              </p>
              <p className="text-muted fs-5" style={{ lineHeight: 1.8 }}>
                Founded in 2024 by a group of former students who experienced
                these challenges firsthand, we set out to create a platform that
                would make the process effortless. What started as a small
                project at a university hackathon has grown into a thriving
                community of students and employers.
              </p>
              <div className="d-flex gap-4 mt-4">
                <div>
                  <div className="fw-bold fs-3 text-gradient">2024</div>
                  <div className="text-muted small">Founded</div>
                </div>
                <div>
                  <div className="fw-bold fs-3 text-gradient">500+</div>
                  <div className="text-muted small">Jobs Posted</div>
                </div>
                <div>
                  <div className="fw-bold fs-3 text-gradient">95%</div>
                  <div className="text-muted small">Satisfaction</div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="story-visual">
                <div className="story-card-1 p-4">
                  <FaHandshake
                    size={40}
                    className="mb-3"
                    style={{ color: "#7c3aed" }}
                  />
                  <h5>Community First</h5>
                  <p className="text-muted mb-0">
                    Building connections that matter beyond just jobs.
                  </p>
                </div>
                <div className="story-card-2 p-4">
                  <FaRocket
                    size={40}
                    className="mb-3"
                    style={{ color: "#ec4899" }}
                  />
                  <h5>Growth Focused</h5>
                  <p className="text-muted mb-0">
                    Helping students build careers while studying.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / Milestones */}
          <div className="milestones-section">
            <div className="text-center mb-5">
              <span className="section-badge">Our Journey</span>
              <h2 className="section-title">
                Key <span className="text-gradient">Milestones</span>
              </h2>
            </div>
            <div className="milestones-timeline">
              {milestones.map((m, i) => (
                <RevealOnScroll key={i} delay={i * 0.2}>
                  <div className="milestone-item">
                    <div className="milestone-marker">
                      <div className="milestone-dot"></div>
                    </div>
                    <div className="milestone-content">
                      <span className="milestone-year">{m.year}</span>
                      <h5 className="milestone-title">{m.title}</h5>
                      <p className="milestone-desc">{m.desc}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-badge">Our People</span>
            <h2 className="section-title">
              Meet the <span className="text-gradient">Team</span>
            </h2>
            <p className="section-subtitle">
              The passionate people behind Pocket-Pay.
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            {teamMembers.map((member, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="team-card text-center p-4 h-100">
                  <div className="team-avatar-wrapper mb-4">
                    {member.image ? (
                      <div className="team-avatar-img-wrap">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="team-avatar-img"
                        />
                      </div>
                    ) : (
                      <div
                        className="team-avatar"
                        style={{
                          background: `linear-gradient(135deg, ${member.color}, ${member.color}88)`,
                        }}
                      >
                        <span>{member.avatar}</span>
                      </div>
                    )}
                    <div
                      className="team-avatar-ring"
                      style={{ borderColor: member.color }}
                    ></div>
                  </div>
                  <h5 className="team-name mb-1">{member.name}</h5>
                  <span
                    className="team-role mb-3 d-inline-block px-3 py-1 rounded-pill"
                    style={{
                      background: `${member.color}15`,
                      color: member.color,
                    }}
                  >
                    {member.role}
                  </span>
                  <p className="team-bio text-muted mb-3">{member.bio}</p>
                  <div className="team-social">
                    <a
                      href="#"
                      className="social-link"
                      style={{ "--hover-bg": member.color }}
                    >
                      <FaLinkedin />
                    </a>
                    <a
                      href="#"
                      className="social-link"
                      style={{ "--hover-bg": member.color }}
                    >
                      <FaTwitter />
                    </a>
                    <a
                      href="#"
                      className="social-link"
                      style={{ "--hover-bg": member.color }}
                    >
                      <FaGithub />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-badge">What Drives Us</span>
            <h2 className="section-title">
              Our <span className="text-gradient">Values</span>
            </h2>
            <p className="section-subtitle">
              The core principles that guide everything we do.
            </p>
          </div>
          <div className="row g-4">
            {values.map((value, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="value-card text-center p-4 h-100">
                  <div
                    className="value-icon-wrapper mx-auto mb-4"
                    style={{ background: value.bg, color: value.color }}
                  >
                    <value.icon size={32} />
                  </div>
                  <h5 className="value-title mb-3">{value.title}</h5>
                  <p className="value-description text-muted mb-0">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="about-stats-section py-5">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {stats.map((stat, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="about-stat-card text-center p-4">
                  <stat.icon
                    size={40}
                    className="mb-3"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  />
                  <div className="stat-value-display">
                    {stat.display || (
                      <CountUp end={stat.end} suffix={stat.suffix} />
                    )}
                  </div>
                  <div className="stat-label-display">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-badge">Testimonials</span>
            <h2 className="section-title">
              What Users <span className="text-gradient">Say</span>
            </h2>
            <p className="section-subtitle">
              Real feedback from our community.
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-lg-4 col-md-6">
              <div className="testimonial-card p-4 h-100">
                <FaQuoteLeft
                  className="mb-3"
                  style={{ color: "#7c3aed", fontSize: "1.5rem", opacity: 0.3 }}
                />
                <p className="text-muted mb-4" style={{ lineHeight: 1.8 }}>
                  "Pocket-Pay helped me find a part-time job that fits perfectly
                  around my class schedule. Highly recommend!"
                </p>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="testimonial-avatar"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                    }}
                  >
                    S
                  </div>
                  <div>
                    <div className="fw-bold">Sarah M.</div>
                    <div className="small text-muted">
                      Computer Science Student
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="testimonial-card p-4 h-100">
                <FaQuoteLeft
                  className="mb-3"
                  style={{ color: "#7c3aed", fontSize: "1.5rem", opacity: 0.3 }}
                />
                <p className="text-muted mb-4" style={{ lineHeight: 1.8 }}>
                  "As an employer, we found amazing student talent through
                  Pocket-Pay. The verification process gives us confidence."
                </p>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="testimonial-avatar"
                    style={{
                      background: "linear-gradient(135deg, #10b981, #059669)",
                    }}
                  >
                    J
                  </div>
                  <div>
                    <div className="fw-bold">James R.</div>
                    <div className="small text-muted">Tech Startup Founder</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="testimonial-card p-4 h-100">
                <FaQuoteLeft
                  className="mb-3"
                  style={{ color: "#7c3aed", fontSize: "1.5rem", opacity: 0.3 }}
                />
                <p className="text-muted mb-4" style={{ lineHeight: 1.8 }}>
                  "The skill-matching feature is incredible! I found a job that
                  actually uses what I'm studying."
                </p>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="testimonial-avatar"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    }}
                  >
                    A
                  </div>
                  <div>
                    <div className="fw-bold">Aisha K.</div>
                    <div className="small text-muted">
                      Business Administration Student
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="container">
          <div className="cta-card p-5 text-center position-relative overflow-hidden">
            <div className="cta-shapes">
              <div className="cta-shape cta-shape-1"></div>
              <div className="cta-shape cta-shape-2"></div>
            </div>
            <div className="position-relative">
              <h2 className="cta-title mb-3">Ready to Get Started?</h2>
              <p className="cta-subtitle mb-4 fs-5">
                Join thousands of students and employers already on Pocket-Pay.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <button
                  className="btn btn-white btn-lg px-5"
                  onClick={() => navigate("/register/student")}
                >
                  <FaGraduationCap className="me-2" />
                  Join as Student
                </button>
                <button
                  className="btn btn-outline-light btn-lg px-5"
                  onClick={() => navigate("/register/employer")}
                >
                  <FaBuilding className="me-2" />
                  Join as Employer
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
