import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { agentService } from '../../services/agentService';
import { adminService } from '../../services/adminService';
import { isAdmin } from '../../services/auth';

const UserSupportModal = ({ show, onHide, user, onSuccess }) => {
    const { t } = useTranslation();
    const { settings } = useTheme();
    const [message, setMessage] = useState(user?.supportMessage || '');
    const [loading, setLoading] = useState(false);
    const [globalMessage, setGlobalMessage] = useState('');

    useEffect(() => {
        if (show && isAdmin()) {
            fetchGlobalMessage();
        }
        // Reset message when user changes
        setMessage(user?.supportMessage || '');
    }, [show, user]);

    const fetchGlobalMessage = async () => {
        try {
            const response = await adminService.getGlobalSettings();
            if (response.success) {
                setGlobalMessage(response.settings?.globalSupportMessage || '');
            }
        } catch (error) {
            console.warn('Could not fetch global settings:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await agentService.updateUser(user.id, {
                supportMessage: message
            });

            if (response.success) {
                toast.success(t('support_message_saved', 'Support message saved successfully!'));
                if (onSuccess) onSuccess();
                onHide();
            }
        } catch (error) {
            toast.error(error.message || t('support_message_failed', 'Failed to save message'));
        } finally {
            setLoading(false);
        }
    };

    const handleClearCustomMessage = async () => {
        setLoading(true);
        try {
            const response = await agentService.updateUser(user.id, {
                supportMessage: ''
            });

            if (response.success) {
                setMessage('');
                toast.success(t('custom_message_cleared', 'Custom message cleared - user will see global message'));
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            toast.error(error.message || t('clear_message_failed', 'Failed to clear message'));
        } finally {
            setLoading(false);
        }
    };



    const textareaStyles = {
        backgroundColor: settings.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        color: settings.darkMode ? '#e0e0e0' : '#333',
        borderRadius: '16px',
        padding: '20px',
        fontSize: '14px',
        lineHeight: '1.6',
        resize: 'none',
        transition: 'all 0.3s ease',
        minHeight: '150px'
    };

    const hasCustomMessage = user?.supportMessage && user.supportMessage.trim() !== '';

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            contentClassName="majestic-card border-0 shadow-lg"
            backdrop="static"
        >
            <div className="majestic-modal-content p-0">
                <div
                    className="position-relative d-flex flex-column align-items-center justify-content-center pt-5 pb-4"
                    style={{
                        background: 'linear-gradient(180deg, rgba(26, 31, 44, 0.8) 0%, rgba(13, 17, 23, 0.95) 100%)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-success bg-opacity-20 p-2 rounded-3">
                            <i className="bi bi-chat-left-dots-fill text-success" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                        <h4 className="text-white mb-0 fw-bold" style={{ letterSpacing: '0.8px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{t('support_console', 'Support Console')}</h4>
                    </div>

                    <button
                        onClick={onHide}
                        className="btn-close btn-close-white opacity-50 hover-opacity-100 position-absolute"
                        aria-label="Close"
                        style={{ top: '20px', right: '20px' }}
                    ></button>
                </div>

                <Modal.Body className="p-4">
                    <div className="mb-4 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <div className="text-secondary small me-2">{t('messaging_user', 'Messaging user:')}</div>
                            <div className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-bold">
                                {user?.username}
                            </div>
                        </div>
                        {hasCustomMessage && (
                            <span className="badge bg-warning bg-opacity-10 text-warning px-2 py-1 small">
                                <i className="bi bi-star-fill me-1"></i>
                                {t('custom_override', 'Custom')}
                            </span>
                        )}
                    </div>

                    {/* Global Message Reference - Only for Admin */}
                    {isAdmin() && globalMessage && (
                        <div className="mb-4 p-3 rounded-3" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center gap-2 text-primary small">
                                    <i className="bi bi-globe-americas"></i>
                                    <span className="fw-bold">{t('current_global_message', 'Current Global Message')}</span>
                                </div>
                                {!hasCustomMessage && (
                                    <span className="badge bg-primary bg-opacity-20 text-primary small">
                                        {t('active_for_user', 'Active for this user')}
                                    </span>
                                )}
                            </div>
                            <p className="text-secondary small mb-0" style={{ opacity: 0.8, maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                "{globalMessage.substring(0, 100)}{globalMessage.length > 100 ? '...' : ''}"
                            </p>
                        </div>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-secondary small fw-bold mb-2">
                                {t('custom_message_for_user', 'Custom Message for This User')}
                                <span className="text-muted fw-normal ms-2">({t('overrides_global', 'overrides global')})</span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder={t('type_message_here', 'Write your official support message here... Leave empty to use global message.')}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                style={textareaStyles}
                                className="shadow-none support-textarea"
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center gap-3">
                            {/* Clear Custom Button - Only show if has custom message */}
                            {hasCustomMessage && (
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={handleClearCustomMessage}
                                    disabled={loading}
                                    className="d-flex align-items-center gap-1"
                                    style={{ fontSize: '12px' }}
                                >
                                    <i className="bi bi-arrow-counterclockwise"></i>
                                    {t('use_global', 'Use Global')}
                                </Button>
                            )}
                            <div className="d-flex align-items-center gap-3 ms-auto">
                                <Button
                                    variant="link"
                                    className="text-secondary text-decoration-none small fw-medium"
                                    onClick={onHide}
                                    style={{ fontSize: '13px' }}
                                >
                                    {t('cancel')}
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 rounded-pill fw-bold shadow-lg d-flex align-items-center"
                                    style={{
                                        background: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)',
                                        border: 'none',
                                        boxShadow: '0 4px 15px rgba(0, 184, 148, 0.4)',
                                        fontSize: '14px'
                                    }}
                                >
                                    {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
                                    {t('save_message', 'Update Message')}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Modal.Body>
            </div>
        </Modal>
    );
};

export default UserSupportModal;
