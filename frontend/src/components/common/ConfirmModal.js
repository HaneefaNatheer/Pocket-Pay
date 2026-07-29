import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

const ConfirmModal = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  variant = 'primary',
  loading = false,
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <Modal show={show} onHide={!loading ? onHide : undefined} centered backdrop="static">
      <Modal.Header closeButton={!loading} className="border-0 pb-0">
        <Modal.Title className="fw-bold">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">{message}</Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button
          variant="outline-secondary"
          onClick={onHide}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            confirmText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
