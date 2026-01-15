import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const UserOverviewModal = ({ show, onHide, user }) => {
    const { t } = useTranslation();
    if (!user) return null;

    const info = [
        { label: t('user_id'), value: user.id, full: true },
        { label: t('username'), value: user.username },
        { label: t('real_name'), value: t('unverified') },
        { label: t('mobile_number'), value: user.mobileNumber || 'N/A' },
        { label: t('email'), value: user.email || 'N/A' },
        { label: t('status'), value: user.isActive ? t('active') : t('forbidden'), color: user.isActive ? '#67C23A' : '#F56C6C' },
        { label: t('invitation_code'), value: user.referCode || 'N/A' },
        { label: t('registration_time'), value: new Date(user.createdAt).toLocaleString() },
        { label: t('last_login'), value: '2024-10-12 10:00:00' },
        { label: t('login_ip'), value: t('unknown') }
    ];

    return (
        <Modal show={show} onHide={onHide} size="lg" centered contentClassName="majestic-card border-0">
            <Modal.Header closeButton closeVariant="white" className="border-secondary">
                <Modal.Title>{t('user_basic_info')}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Row className="g-3">
                    {info.map((item, idx) => (
                        <Col md={item.full ? 12 : 6} key={idx}>
                            <div className="p-3 border border-secondary border-opacity-25 rounded bg-darker h-100">
                                <div className="text-secondary small mb-1">{item.label}</div>
                                <div className="fw-medium text-break" style={{ color: item.color || '#fff' }}>
                                    {item.value}
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Modal.Body>
            <Modal.Footer className="border-secondary">
                <Button variant="secondary" onClick={onHide}>{t('close')}</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserOverviewModal;
