import React, { useState, useEffect, useCallback } from 'react';
import { Table, Badge, Pagination, Form, Row, Col, Spinner } from 'react-bootstrap';
import { adminService } from '../../services/adminService';
import { useTranslation } from 'react-i18next';

const AuditLogs = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
    const [filters, setFilters] = useState({ action: '', targetId: '' });

    const fetchLogs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const data = await adminService.getAuditLogs({
                page,
                limit: pagination.limit,
                ...filters
            });
            if (data.success) {
                setLogs(data.logs);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Fetch logs error:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.limit]);

    useEffect(() => {
        fetchLogs(1);
    }, [fetchLogs]);

    const getActionBadge = (action) => {
        const variants = {
            'login': 'info',
            'agent_created': 'success',
            'agent_updated': 'warning',
            'agent_deleted': 'danger',
            'user_created': 'success',
            'user_updated': 'warning',
            'user_deleted': 'danger',
            'balance_adjusted': 'primary',
            'withdrawal_approved': 'success',
            'withdrawal_rejected': 'danger'
        };
        return <Badge bg={variants[action] || 'secondary'}>{t(`audit_action_${action}`)}</Badge>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="majestic-page-wrapper">
            <h5 className="mb-4 border-start border-4 border-primary ps-2 text-white">{t('menu_audit_logs')}</h5>

            <div className="majestic-card filter-bar mb-4">
                <Row className="g-3">
                    <Col md={4}>
                        <Form.Control
                            type="text"
                            placeholder={t('filter_by_action')}
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                        />
                    </Col>
                </Row>
            </div>

            <div className="majestic-card p-0 majestic-table-container position-relative" style={{ minHeight: '200px' }}>
                {loading && (
                    <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 10 }}>
                        <Spinner animation="border" variant="primary" />
                    </div>
                )}
                <Table hover className={`border-0 mb-0 ${loading ? 'opacity-50' : ''}`}>
                    <thead>
                        <tr>
                            <th>{t('audit_time')}</th>
                            <th>{t('audit_operator')}</th>
                            <th>{t('audit_action')}</th>
                            <th>{t('audit_target')}</th>
                            <th>{t('audit_details')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length > 0 ? logs.map(log => (
                            <tr key={log.id}>
                                <td className="small text-nowrap">{formatDate(log.createdAt)}</td>
                                <td>
                                    <div className="d-flex flex-column">
                                        <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>{log.performedBy?.username || 'System'}</span>
                                        <span className="text-secondary smaller">{log.performedBy?.role}</span>
                                    </div>
                                </td>
                                <td>{getActionBadge(log.action)}</td>
                                <td style={{ color: 'var(--text-primary)' }}>
                                    {log.targetUser?.username || log.targetAgent?.username || '-'}
                                </td>
                                <td className="small text-secondary">
                                    {log.newData ? JSON.stringify(log.newData).substring(0, 50) + '...' : '-'}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="text-center p-4 text-secondary">{t('no_data')}</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {pagination.pages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                        <Pagination.First onClick={() => fetchLogs(1)} disabled={pagination.page === 1} />
                        <Pagination.Prev onClick={() => fetchLogs(pagination.page - 1)} disabled={pagination.page === 1} />
                        {[...Array(pagination.pages)].map((_, idx) => (
                            <Pagination.Item
                                key={idx + 1}
                                active={idx + 1 === pagination.page}
                                onClick={() => fetchLogs(idx + 1)}
                            >
                                {idx + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => fetchLogs(pagination.page + 1)} disabled={pagination.page === pagination.pages} />
                        <Pagination.Last onClick={() => fetchLogs(pagination.pages)} disabled={pagination.page === pagination.pages} />
                    </Pagination>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
