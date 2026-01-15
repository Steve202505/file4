import React, { useState } from 'react';
import { Row, Col, Form, Button, Table, Pagination } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// Add select styling
const selectStyles = `
  .majestic-select {
    background-color: #2b2b2b !important;
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    height: 42px !important;
    padding: 0.5rem 1rem !important;
    font-size: 0.9rem !important;
    border-radius: 8px !important;
    appearance: none !important;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important;
    background-repeat: no-repeat !important;
    background-position: right 1rem center !important;
    background-size: 16px 12px !important;
  }
  .majestic-select:focus {
    border-color: #ffd700 !important;
    box-shadow: 0 0 0 0.25rem rgba(255, 215, 0, 0.1) !important;
    outline: none !important;
  }
  .majestic-select option {
    background-color: #1a1a1a !important;
    color: #ffffff !important;
    padding: 10px !important;
  }
`;

const UserBalanceDetails = () => {
    const { t } = useTranslation();
    // Mock Data
    const [records] = useState([
        { id: 'TRX-100293', userId: '82193', type: t('recharge'), amount: +1000, before: 0, after: 1000, time: '2024-10-12 09:00:00', remark: 'USDT Deposit' },
        { id: 'TRX-100294', userId: '82193', type: t('trade_deduct'), amount: -500, before: 1000, after: 500, time: '2024-10-12 10:30:00', remark: 'Open Position AAPL' },
    ]);

    return (
        <div className="majestic-page-wrapper">
            <style>{selectStyles}</style>
            {/* Filter Bar */}
            <div className="majestic-card filter-bar mb-3">
                <Row className="g-3 align-items-center w-100">
                    <Col xs={12} md="auto">
                        <div className="d-flex align-items-center">
                            <span className="form-label mb-0 text-secondary small me-2" style={{ minWidth: '80px' }}>{t('bill_no')}</span>
                            <Form.Control type="text" placeholder={t('transaction_id')} className="w-100" style={{ minWidth: '180px' }} />
                        </div>
                    </Col>
                    <Col xs={12} md="auto">
                        <div className="d-flex align-items-center">
                            <span className="form-label mb-0 text-secondary small me-2" style={{ minWidth: '80px' }}>{t('user_id')}</span>
                            <Form.Control type="text" placeholder={t('user_id')} className="w-100" style={{ minWidth: '150px' }} />
                        </div>
                    </Col>
                    <Col xs={12} md="auto">
                        <div className="d-flex align-items-center">
                            <span className="form-label mb-0 text-secondary small me-2" style={{ minWidth: '80px' }}>{t('type')}</span>
                            <Form.Select
                                className="w-100 majestic-select"
                                style={{ minWidth: '150px' }}
                                data-bs-theme="dark"
                            >
                                <option value="all">{t('all_types')}</option>
                                <option value="recharge">{t('recharge')}</option>
                                <option value="withdrawal">{t('withdrawal')}</option>
                                <option value="trade">{t('trade')}</option>
                                <option value="activity">{t('activity')}</option>
                            </Form.Select>
                        </div>
                    </Col>
                    <Col xs={12} md="auto" className="ms-auto text-end">
                        <div className="d-flex gap-2 justify-content-end">
                            <Button variant="primary" size="sm" className="px-3">{t('query')}</Button>
                            <Button variant="secondary" size="sm" className="px-3">{t('reset')}</Button>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Data Grid */}
            <div className="majestic-card p-0 majestic-table-container shadow-sm">
                <Table hover className="border-0 mb-0">
                    <thead>
                        <tr>
                            <th>{t('serial_number')}</th>
                            <th>{t('user_id')}</th>
                            <th>{t('type_of_bill')}</th>
                            <th>{t('amount')}</th>
                            <th>{t('balance_before')}</th>
                            <th>{t('balance_after')}</th>
                            <th>{t('time')}</th>
                            <th>{t('remark')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((rec, idx) => (
                            <tr key={idx}>
                                <td style={{ color: 'var(--text-primary)' }}>{rec.id}</td>
                                <td>{rec.userId}</td>
                                <td>
                                    <span style={{ color: rec.amount > 0 ? 'var(--success-green)' : 'var(--text-primary)' }}>{rec.type}</span>
                                </td>
                                <td className={rec.amount > 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 'bold' }}>
                                    {rec.amount > 0 ? '+' : ''}{rec.amount.toFixed(2)}
                                </td>
                                <td>{rec.before.toFixed(2)}</td>
                                <td>{rec.after.toFixed(2)}</td>
                                <td>{rec.time}</td>
                                <td className="text-secondary small">{rec.remark}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-end mt-3">
                <Pagination size="sm">
                    <Pagination.Item active>{1}</Pagination.Item>
                </Pagination>
            </div>
        </div>
    );
};

export default UserBalanceDetails;
