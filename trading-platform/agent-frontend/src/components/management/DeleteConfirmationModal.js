import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const DeleteConfirmationModal = ({ show, onHide, onConfirm, username }) => {
    const { t } = useTranslation();

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            backdrop="static"
            className="delete-confirmation-modal custom-confirm-modal"
        >
            <div className="majestic-modal-content" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <Modal.Body className="text-center py-5 px-4">
                    <div className="confirm-icon-wrapper mb-4">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                            style={{
                                width: '80px',
                                height: '80px',
                                background: 'rgba(245, 108, 108, 0.1)',
                                border: '2px solid rgba(245, 108, 108, 0.2)',
                                boxShadow: '0 0 20px rgba(245, 108, 108, 0.1)'
                            }}>
                            <i className="bi bi-trash3-fill" style={{ fontSize: '32px', color: 'var(--danger-red)' }}></i>
                        </div>
                    </div>

                    <h4 className="fw-bold mb-3" style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                        {t('confirm_delete', 'Confirm Delete')}
                    </h4>

                    <p className="mb-0 text-secondary" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                        {t('confirm_delete_msg', { username }) || `Are you sure you want to delete user ${username}?`}
                    </p>
                </Modal.Body>

                <Modal.Footer className="border-0 px-4 pb-4 pt-0 justify-content-center">
                    <div className="d-flex w-100 gap-3">
                        <Button
                            variant="secondary"
                            onClick={onHide}
                            className="flex-grow-1 py-2 fw-bold"
                            style={{
                                backgroundColor: 'rgba(144, 147, 153, 0.1)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '10px',
                                color: 'var(--text-regular)',
                                fontSize: '14px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {t('cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={onConfirm}
                            className="flex-grow-1 py-2 fw-bold shadow-sm"
                            style={{
                                backgroundColor: 'var(--danger-red)',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '14px',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(245, 108, 108, 0.3)'
                            }}
                        >
                            {t('delete', 'Delete')}
                        </Button>
                    </div>
                </Modal.Footer>
            </div>
        </Modal>
    );
};

export default DeleteConfirmationModal;
