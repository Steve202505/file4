import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { agentService } from '../../services/agentService';
import { isAdmin } from '../../services/auth';
import { toast } from 'react-hot-toast';

import { useTranslation } from 'react-i18next';

const WithdrawalManagement = () => {
    const { t } = useTranslation();
    const [withdrawals, setWithdrawals] = useState([]);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ status: 'approved', notes: '' });

    const isAgent = !isAdmin();

    const [filters, setFilters] = useState({
        orderNumber: '',
        username: '',
        userId: ''
    });

    const fetchWithdrawals = useCallback(async () => {
        try {
            const response = await agentService.getWithdrawals(filters);
            if (response.success) {
                let data = response.withdrawals;
                if (filters.username) data = data.filter(w => w.User?.username?.toLowerCase().includes(filters.username.toLowerCase()));
                setWithdrawals(data);
            }
        } catch (error) {
            toast.error(t('error_fetch_withdrawals'));
        }
    }, [filters, t]);

    useEffect(() => {
        fetchWithdrawals();
    }, [fetchWithdrawals]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ orderNumber: '', username: '', userId: '' });
    };

    const handleReview = (withdrawal) => {
        setSelectedWithdrawal(withdrawal);
        setReviewData({ status: 'approved', notes: '' });
        setShowReviewModal(true);
    };

    const submitReview = async () => {
        try {
            const response = await agentService.reviewWithdrawal(selectedWithdrawal.id, reviewData);
            if (response.success) {
                toast.success(t('withdrawal_reviewed_success', { status: reviewData.status }));
                setShowReviewModal(false);
                fetchWithdrawals();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || t('error_review_withdrawal'));
        }
    };

    const formatAccountDetails = (details, method) => {
        if (!details) return 'N/A';
        try {
            const parsed = typeof details === 'string' ? JSON.parse(details) : details;
            if (method === 'bank') {
                return `${parsed.bankName || ''} - ${parsed.accountNumber || ''}`;
            } else if (method === 'crypto') {
                return parsed.walletAddress || details;
            }
            return typeof details === 'string' ? details : JSON.stringify(details);
        } catch (e) {
            return details;
        }
    };

    const formatNetwork = (details, method) => {
        if (method === 'bank') return t('bank_card', 'Bank Card');
        try {
            const parsed = typeof details === 'string' ? JSON.parse(details) : details;
            return parsed.network || method;
        } catch (e) {
            return method;
        }
    };

    const labelStyle = { color: 'var(--text-secondary)', marginRight: '10px', fontSize: '13px' };

    const inputStyle = { backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px', padding: '6px 12px', borderRadius: '4px' };

    return (
        <div className="majestic-page-wrapper">
            {/* Filter Section */}
            <div className="majestic-card filter-bar mb-3">
                <Row className="g-3 align-items-center w-100">
                    <Col xs={12} md="auto">
                        <div className="d-flex align-items-center">
                            <span style={{ ...labelStyle, minWidth: '80px' }}>{t('recharge_order_no')}</span>
                            <Form.Control
                                type="text"
                                name="orderNumber"
                                placeholder={t('please_enter')}
                                value={filters.orderNumber}
                                onChange={handleFilterChange}
                                className="w-100"
                                style={{ ...inputStyle, minWidth: '150px', width: 'auto' }}
                            />
                        </div>
                    </Col>
                    <Col xs={12} md="auto">
                        <div className="d-flex align-items-center">
                            <span style={{ ...labelStyle, minWidth: '80px' }}>{t('username')}</span>
                            <Form.Control
                                type="text"
                                name="username"
                                placeholder={t('enter_username')}
                                value={filters.username}
                                onChange={handleFilterChange}
                                className="w-100"
                                style={{ ...inputStyle, minWidth: '150px', width: 'auto' }}
                            />
                        </div>
                    </Col>
                    <Col xs={12} md="auto">
                        <div className="d-flex align-items-center">
                            <span style={{ ...labelStyle, minWidth: '80px' }}>{t('user_id')}</span>
                            <Form.Control
                                type="text"
                                name="userId"
                                placeholder={t('enter_user_id')}
                                value={filters.userId}
                                onChange={handleFilterChange}
                                className="w-100"
                                style={{ ...inputStyle, minWidth: '150px', width: 'auto' }}
                            />
                        </div>
                    </Col>
                    <Col xs={12} md="auto" className="ms-auto text-end">
                        <div className="d-flex gap-2 justify-content-end">
                            <Button variant="primary" size="sm" className="px-4" onClick={fetchWithdrawals}>{t('query')}</Button>
                            <Button variant="secondary" size="sm" className="px-4" onClick={clearFilters}>{t('reset')}</Button>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Data Table */}
            <div className="majestic-card p-0 majestic-table-container">
                <Table hover className="border-0 mb-0">
                    <thead>
                        <tr>
                            <th>{t('username')}</th>
                            <th>{t('user_id')}</th>
                            <th>{t('withdrawal_order_no')}</th>
                            <th>{t('withdrawal_amount')}</th>
                            <th>{t('wallet_address')}</th>
                            <th>{t('wallet_network')}</th>
                            <th>{t('withdrawal_status')}</th>
                            <th>{t('submission_time')}</th>
                            <th className="text-end">{t('operate')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {withdrawals.map((w) => {
                            const user = w.User || {};
                            const userName = user.username || t('unknown');
                            const userIdDisplay = (user.id || w.userId)?.slice(-8).toUpperCase() || 'N/A';

                            return (
                                <tr key={w.id}>
                                    <td style={{ color: 'var(--text-primary)' }}>{userName}</td>
                                    <td style={{ color: 'var(--text-primary)' }}>{userIdDisplay}</td>
                                    <td style={{ color: 'var(--text-primary)' }}>TX{w.id.toUpperCase()}</td>
                                    <td style={{ color: 'var(--text-primary)' }}>{w.amount?.toFixed(2)}</td>
                                    <td style={{ color: 'var(--text-primary)' }}>{formatAccountDetails(w.accountDetails, w.method)}</td>
                                    <td style={{ color: 'var(--text-primary)' }}>{formatNetwork(w.accountDetails, w.method)}</td>
                                    <td>
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            {w.status === 'pending' ? t('pending_review') :
                                                w.status === 'approved' ? t('withdrawal_successful') :
                                                    w.status === 'rejected' ? t('refusal_to_withdraw') :
                                                        w.status || t('unknown')}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-primary)' }}>{new Date(w.createdAt).toLocaleString()}</td>
                                    <td className="text-end">
                                        {w.status === 'pending' ? (
                                            isAgent ? (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="px-3 rounded-pill"
                                                    onClick={() => handleReview(w)}
                                                    style={{ fontSize: '12px' }}
                                                >
                                                    <i className="bi bi-shield-check me-1"></i>
                                                    {t('review')}
                                                </Button>
                                            ) : (
                                                <span className="badge rounded-pill bg-warning-muted text-warning" style={{ fontWeight: 'normal' }}>
                                                    {t('pending_review')}
                                                </span>
                                            )
                                        ) : (
                                            <span className={`badge rounded-pill ${w.status === 'rejected' ? 'bg-danger-muted text-danger' : 'bg-success-muted text-success'}`} style={{ fontWeight: 'normal' }}>
                                                {w.status === 'rejected' ? t('rejected') : t('completed')}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {withdrawals.length === 0 && (
                            <tr>
                                <td colSpan="9" className="text-center py-5 text-secondary border-0">{t('no_data')}</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Review Modal */}
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: '16px' }}>{t('audit_withdrawal')}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '30px' }}>
                    {selectedWithdrawal && (
                        <>
                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-secondary">{t('amount')}</span>
                                    <span className="h5 mb-0 fw-bold">${selectedWithdrawal.amount}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-secondary">{t('user')}</span>
                                    <span className="fw-bold">{selectedWithdrawal.User?.username}</span>
                                </div>
                            </div>

                            <Form.Group className="mb-4">
                                <Form.Label style={{ fontSize: '13px' }}>{t('audit_result')}</Form.Label>
                                <div className="d-flex gap-3">
                                    <Button
                                        variant={reviewData.status === 'approved' ? 'primary' : 'outline-secondary'}
                                        className="flex-grow-1"
                                        onClick={() => setReviewData({ ...reviewData, status: 'approved' })}
                                    >
                                        {t('pass')}
                                    </Button>
                                    <Button
                                        variant={reviewData.status === 'rejected' ? 'danger' : 'outline-secondary'}
                                        className="flex-grow-1"
                                        onClick={() => setReviewData({ ...reviewData, status: 'rejected' })}
                                    >
                                        {t('reject')}
                                    </Button>
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontSize: '13px' }}>{t('audit_remarks')}</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder={t('enter_remarks')}
                                    value={reviewData.notes}
                                    onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => setShowReviewModal(false)} className="px-4">{t('cancel')}</Button>
                    <Button variant="primary" size="sm" onClick={submitReview} className="px-4">{t('confirm')}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default WithdrawalManagement;
