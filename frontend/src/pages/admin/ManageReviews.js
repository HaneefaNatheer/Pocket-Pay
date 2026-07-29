import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import {
  BsEye,
  BsEyeSlash,
  BsTrash,
  BsStar,
  BsStarFill,
  BsStarHalf,
  BsChatLeftText,
  BsPeople,
  BsBuilding,
  BsCalendar,
} from 'react-icons/bs';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ITEMS_PER_PAGE = 10;

const StarRating = ({ rating }) => {
  const stars = [];
  const maxStars = 5;
  const numericRating = Number(rating) || 0;

  for (let i = 1; i <= maxStars; i++) {
    if (i <= Math.floor(numericRating)) {
      stars.push(<FaStar key={i} className="text-warning" />);
    } else if (i - 0.5 <= numericRating) {
      stars.push(<FaStarHalf key={i} className="text-warning" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-warning" />);
    }
  }

  return (
    <div className="d-flex align-items-center gap-1">
      {stars}
      <small className="text-muted ms-1">({numericRating.toFixed(1)})</small>
    </div>
  );
};

const ManageReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [page, visibilityFilter]);

  useEffect(() => {
    setPage(1);
  }, [visibilityFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE };
      if (visibilityFilter !== 'all') params.visible = visibilityFilter === 'visible';
      const res = await adminService.getReviews(params);
      const data = res.data?.data || res.data || {};
      const reviewList = Array.isArray(data) ? data : data.reviews || data.results || [];
      setReviews(reviewList);
      setTotalPages(data.totalPages || data.pages || Math.ceil((data.total || 0) / ITEMS_PER_PAGE) || 1);
    } catch (err) {
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (review) => {
    setTogglingId(review._id);
    try {
      await adminService.toggleReview(review._id);
      const isVisible = review.visible !== false;
      toast.success(`Review ${isVisible ? 'hidden' : 'made visible'}.`);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === review._id ? { ...r, visible: !isVisible } : r
        )
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to toggle visibility.');
    } finally {
      setTogglingId(null);
    }
  };

  const openDeleteConfirm = (review) => {
    setDeleteTarget(review);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminService.toggleReview(deleteTarget._id);
      toast.success('Review deleted successfully.');
      setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete review.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const truncate = (str, len = 60) => {
    if (!str) return 'N/A';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="container py-4">
        <div className="placeholder-glow mb-4">
          <div className="placeholder col-4 mb-2" style={{ height: 32 }}></div>
          <div className="placeholder col-7" style={{ height: 18 }}></div>
        </div>
        <div className="row g-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="col-12">
              <div className="card border-0 shadow-sm placeholder-glow" style={{ height: 64 }}>
                <div className="card-body d-flex align-items-center">
                  <div className="placeholder flex-grow-1" style={{ height: 16 }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Manage Reviews</h4>
          <small className="text-muted">{reviews.length} total reviews</small>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        {['all', 'visible', 'hidden'].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${visibilityFilter === tab ? 'active' : ''}`}
              onClick={() => setVisibilityFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {reviews.length > 0 ? (
        <>
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student</th>
                    <th>Employer</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th className="text-center">Visible</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => {
                    const isVisible = review.visible !== false;
                    return (
                      <tr
                        key={review._id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedReview(review);
                          setShowReviewModal(true);
                        }}
                      >
                        <td>
                          <div className="d-flex align-items-center">
                            <BsPeople className="text-muted me-2" />
                            <span className="fw-semibold small">
                              {review.studentName || review.student?.name || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="small">
                          <BsBuilding className="text-muted me-1" />
                          {review.employerName || review.employer?.companyName || 'N/A'}
                        </td>
                        <td>
                          <StarRating rating={review.rating} />
                        </td>
                        <td className="small text-muted">
                          {truncate(review.comment || review.text)}
                        </td>
                        <td className="text-center">
                          <button
                            className={`btn btn-sm ${isVisible ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                            title={isVisible ? 'Hide review' : 'Show review'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVisibility(review);
                            }}
                            disabled={togglingId === review._id}
                          >
                            {togglingId === review._id ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : isVisible ? (
                              <BsEye />
                            ) : (
                              <BsEyeSlash />
                            )}
                          </button>
                        </td>
                        <td className="text-muted small">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="text-end" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete Review"
                            onClick={() => openDeleteConfirm(review)}
                          >
                            <BsTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <div className="text-center py-5">
          <BsChatLeftText size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No reviews found</h5>
          <p className="text-muted">
            {visibilityFilter !== 'all' ? 'No reviews with this visibility.' : 'No reviews submitted yet.'}
          </p>
        </div>
      )}

      {/* View Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Review Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReview ? (
            <div className="row g-3">
              <div className="col-12 text-center mb-2">
                <StarRating rating={selectedReview.rating} />
              </div>
              <div className="col-12 col-md-6">
                <div className="card border h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Reviewer</h6>
                    <p className="mb-2 small"><BsPeople className="me-2 text-muted" />{selectedReview.studentName || selectedReview.student?.name || 'N/A'}</p>
                    <p className="mb-0 small"><BsCalendar className="me-2 text-muted" />
                      {selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="card border h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Employer</h6>
                    <p className="mb-0 small"><BsBuilding className="me-2 text-muted" />{selectedReview.employerName || selectedReview.employer?.companyName || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Comment</h6>
                    <p className="small text-muted mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedReview.comment || selectedReview.text || 'No comment provided.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted">No review data.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        variant="danger"
        loading={deleteLoading}
        confirmText="Delete"
      />
    </div>
  );
};

export default ManageReviews;
