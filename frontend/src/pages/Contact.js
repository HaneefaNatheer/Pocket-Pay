import React, { useState, useEffect, useRef } from 'react';
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaCheckCircle,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaChevronDown,
  FaRocket,
  FaExclamationTriangle,
  FaArrowRight,
} from 'react-icons/fa';

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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal-on-scroll ${visible ? 'revealed' : ''}`}>
      {children}
    </div>
  );
}

const contactInfo = [
  {
    icon: FaEnvelope,
    title: 'Email Us',
    detail: 'support@pocket-pay.com',
    sub: 'We reply within 24 hours',
    color: '#7c3aed',
  },
  {
    icon: FaPhone,
    title: 'Call Us',
    detail: '+1 (555) 123-4567',
    sub: 'Mon - Fri, 9am - 6pm EST',
    color: '#10b981',
  },
  {
    icon: FaMapMarkerAlt,
    title: 'Visit Us',
    detail: '123 Education Lane',
    sub: 'San Francisco, CA 94102',
    color: '#ec4899',
  },
];

const officeHours = [
  { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM EST' },
  { day: 'Saturday', hours: '10:00 AM - 2:00 PM EST' },
  { day: 'Sunday', hours: 'Closed' },
];

const faqs = [
  {
    question: 'How do I create an account?',
    answer:
      'Click on the "Register" button and choose whether you are a student or employer. Fill in your details, verify your email, and you\'re ready to go!',
  },
  {
    question: 'Is Pocket-Pay free for students?',
    answer:
      'Yes! Pocket-Pay is completely free for students. You can create a profile, search jobs, and apply to positions at no cost.',
  },
  {
    question: 'How are employers verified?',
    answer:
      'Every employer goes through a thorough verification process that includes business license verification, background checks, and review of company information.',
  },
  {
    question: 'Can I apply to multiple jobs?',
    answer:
      'Absolutely! There is no limit to the number of jobs you can apply to. We encourage students to apply to multiple positions to increase their chances.',
  },
  {
    question: 'How do I update my profile?',
    answer:
      'Log in to your account, navigate to your profile page, and click "Edit Profile." You can update your skills, availability, resume, and other information.',
  },
  {
    question: 'What if I have an issue with an employer?',
    answer:
      'If you encounter any issues, please contact our support team immediately through the contact form or email. We take all concerns seriously and will investigate promptly.',
  },
];

const socialLinks = [
  { icon: FaLinkedin, name: 'LinkedIn', url: '#', color: '#0077b5' },
  { icon: FaTwitter, name: 'Twitter', url: '#', color: '#1da1f2' },
  { icon: FaInstagram, name: 'Instagram', url: '#', color: '#e4405f' },
  { icon: FaFacebook, name: 'Facebook', url: '#', color: '#1877f2' },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="contact-page">
      {/* Hero Banner */}
      <section className="contact-hero-section">
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
                <FaEnvelope className="me-2" />
                Get In Touch
              </span>
              <h1 className="hero-title mb-4">
                Contact <span className="text-gradient">Us</span>
              </h1>
              <p className="hero-subtitle mb-0">
                Have a question or need help? We&apos;re here for you. Reach out and we&apos;ll
                respond as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {contactInfo.map((info, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <RevealOnScroll delay={index * 0.15}>
                  <div className="contact-info-card text-center p-4 h-100">
                    <div
                      className="contact-info-icon mx-auto mb-3"
                      style={{ backgroundColor: `${info.color}15`, color: info.color }}
                    >
                      <info.icon size={28} />
                    </div>
                    <h5 className="mb-2">{info.title}</h5>
                    <p className="mb-1 fw-semibold">{info.detail}</p>
                    <small className="text-muted">{info.sub}</small>
                  </div>
                </RevealOnScroll>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-5">
        <div className="container">
          <div className="row g-5">
            {/* Contact Form */}
            <div className="col-lg-8">
              <RevealOnScroll delay={0.1}>
                <div className="contact-form-card p-4 p-md-5">
                  <h3 className="mb-2">Send Us a Message</h3>
                  <p className="text-muted mb-4">
                    Fill out the form below and we&apos;ll get back to you shortly.
                  </p>

                  {submitted && (
                    <div className="alert alert-success d-flex align-items-center mb-4">
                      <FaCheckCircle className="me-2" size={20} />
                      <div>
                        <strong>Message sent successfully!</strong> We&apos;ll get back to you within 24 hours.
                      </div>
                      <button
                        type="button"
                        className="btn-close ms-auto"
                        onClick={() => setSubmitted(false)}
                      />
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label fw-semibold">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                        />
                        {errors.name && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <FaExclamationTriangle className="me-1" />
                            {errors.name}
                          </div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label fw-semibold">
                          Email Address <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                        />
                        {errors.email && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <FaExclamationTriangle className="me-1" />
                            {errors.email}
                          </div>
                        )}
                      </div>
                      <div className="col-12">
                        <label htmlFor="subject" className="form-label fw-semibold">
                          Subject <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                          placeholder="How can we help?"
                          value={formData.subject}
                          onChange={handleChange}
                        />
                        {errors.subject && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <FaExclamationTriangle className="me-1" />
                            {errors.subject}
                          </div>
                        )}
                      </div>
                      <div className="col-12">
                        <label htmlFor="message" className="form-label fw-semibold">
                          Message <span className="text-danger">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows="6"
                          className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                          placeholder="Tell us more about your inquiry..."
                          value={formData.message}
                          onChange={handleChange}
                        />
                        {errors.message && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <FaExclamationTriangle className="me-1" />
                            {errors.message}
                          </div>
                        )}
                      </div>
                      <div className="col-12">
                        <button type="submit" className="btn btn-primary-gradient btn-lg px-5">
                          <FaPaperPlane className="me-2" />
                          Send Message
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </RevealOnScroll>
            </div>

            {/* Sidebar Info */}
            <div className="col-lg-4">
              {/* Office Hours */}
              <RevealOnScroll delay={0.2}>
                <div className="contact-sidebar-card p-4 mb-4">
                  <h5 className="mb-3">
                    <FaClock className="me-2 text-primary" />
                    Office Hours
                  </h5>
                  <div className="office-hours-list">
                    {officeHours.map((item, index) => (
                      <div
                        key={index}
                        className="d-flex justify-content-between py-2"
                        style={{
                          borderBottom:
                            index < officeHours.length - 1
                              ? '1px solid var(--gray-200)'
                              : 'none',
                        }}
                      >
                        <span className="fw-semibold">{item.day}</span>
                        <span className={item.hours === 'Closed' ? 'text-danger' : 'text-muted'}>
                          {item.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>

              {/* Map Placeholder */}
              <RevealOnScroll delay={0.3}>
                <div className="contact-sidebar-card p-4 mb-4">
                  <h5 className="mb-3">
                    <FaMapMarkerAlt className="me-2 text-primary" />
                    Our Location
                  </h5>
                  <div className="map-placeholder">
                    <div className="map-inner d-flex align-items-center justify-content-center">
                      <div className="text-center text-muted">
                        <FaMapMarkerAlt size={40} className="mb-2 opacity-50" />
                        <p className="mb-0 small">Interactive Map</p>
                        <p className="mb-0 small">123 Education Lane, SF</p>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Social Links */}
              <RevealOnScroll delay={0.4}>
                <div className="contact-sidebar-card p-4">
                  <h5 className="mb-3">Follow Us</h5>
                  <div className="d-flex gap-3">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        className="social-media-link"
                        style={{
                          backgroundColor: `${social.color}15`,
                          color: social.color,
                        }}
                        title={social.name}
                      >
                        <social.icon size={20} />
                      </a>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <RevealOnScroll delay={0}>
              <span className="section-badge">FAQ</span>
              <h2 className="section-title">Frequently Asked <span className="text-gradient">Questions</span></h2>
              <p className="section-subtitle">
                Find answers to common questions about Pocket-Pay.
              </p>
            </RevealOnScroll>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion" id="faqAccordion">
                {faqs.map((faq, index) => (
                  <RevealOnScroll key={index} delay={index * 0.08}>
                    <div className="accordion-item border-0 mb-3 rounded-3 overflow-hidden">
                      <h2 className="accordion-header">
                        <button
                          className={`accordion-button ${openFaq !== index ? 'collapsed' : ''} fw-semibold`}
                          type="button"
                          onClick={() => toggleFaq(index)}
                          aria-expanded={openFaq === index}
                        >
                          {faq.question}
                          <FaChevronDown
                            className="accordion-chevron ms-auto"
                            style={{
                              transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0)',
                              transition: 'transform 0.3s ease',
                            }}
                          />
                        </button>
                      </h2>
                      <div
                        className={`accordion-collapse collapse ${openFaq === index ? 'show' : ''}`}
                      >
                        <div className="accordion-body text-muted">{faq.answer}</div>
                      </div>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
