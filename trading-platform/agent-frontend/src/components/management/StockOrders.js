import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, Row, Col, Pagination, Badge } from 'react-bootstrap';
import { agentService } from '../../services/agentService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const StockOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        orderNo: '',
        userId: '',
        symbol: '',
        status: 'all'
    });

    const fetchOrders = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await agentService.getTrades({
                page,
                limit: 20,
                ...filters
            });
            if (response.success) {
                setOrders(response.trades);
                setTotalPages(response.pagination.pages);
                setCurrentPage(response.pagination.page);
            }
        } catch (error) {
            toast.error(t('error_fetching_trades'));
        } finally {
            setLoading(false);
        }
    }, [filters, t]);

    useEffect(() => {
        fetchOrders(1);
    }, [fetchOrders]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handlePageChange = (page) => {
        fetchOrders(page);
    };

    const resetFilters = () => {
        setFilters({
            orderNo: '',
            userId: '',
            symbol: '',
            status: 'all'
        });
    };

    return (
        <div className="majestic-page-wrapper">
            {/* Filter Bar */}
            <div className="majestic-card filter-bar mb-4">
                <Row className="g-3 align-items-center w-100">
                    <Col xs={12} md="auto">
                        <div className="d-flex align-items-center">
                            <span className="form-label mb-0 text-secondary small me-2" style={{ minWidth: '80px' }}>{t('user_id')}</span>
                            <Form.Control
                                type="text"
                                name="userId"
                                placeholder={t('enter_user_id')}
                                value={filters.userId}
                                onChange={handleFilterChange}
                                className="w-100"
                                style={{ minWidth: '200px' }}
                            />
                        </div>
                    </Col>
                    <Col xs={12} md="auto" className="ms-auto text-end">
                        <div className="d-flex gap-2 justify-content-end">
                            <Button variant="primary" size="sm" className="px-3" onClick={() => fetchOrders(1)} disabled={loading}>
                                {loading ? t('loading') : t('query')}
                            </Button>
                            <Button variant="secondary" size="sm" className="px-3" onClick={resetFilters}>{t('reset')}</Button>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Data Grid */}
            <div className="majestic-card p-0 majestic-table-container">
                <Table hover className="border-0 mb-0 text-nowrap">
                    <thead>
                        <tr>
                            <th>{t('id', 'ID')}</th>
                            <th>{t('account')}</th>
                            <th>{t('order_number')}</th>
                            <th>{t('buying_and_selling')}</th>
                            <th>{t('trade_type')}</th>
                            <th>{t('stock_code')}</th>
                            <th>{t('purchase_amount')}</th>
                            <th>{t('purchase_price')}</th>
                            <th>{t('price_at_closing')}</th>
                            <th>{t('periods')}</th>
                            <th>{t('contract_profit')}</th>
                            <th>{t('leverage_ratio')}</th>
                            <th>{t('user_categories')}</th>
                            <th>{t('purchase_timestamp')}</th>
                            <th>{t('closing_timestamp')}</th>
                            <th>{t('profit_and_loss')}</th>
                            <th>{t('designated_pnl')}</th>
                            <th>{t('win_or_loss')}</th>
                            <th>{t('state')}</th>
                            <th className="text-end">{t('operate')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, idx) => {
                            const isWin = order.status === 'won';
                            const control = order.User?.winLossControl;
                            let strategyLabel = t('with_the_market');
                            if (control?.isActive) {
                                if (control.controlLevel === 'high' || control.controlLevel === 'medium') strategyLabel = t('win_strategy');
                                else if (control.controlLevel === 'low') strategyLabel = t('deficit_strategy');
                            }

                            return (
                                <tr key={order.id} className="border-bottom">
                                    <td>{idx + 1 + (currentPage - 1) * 10}</td>
                                    <td style={{ color: 'var(--text-primary)' }}>{order.User?.username || 'N/A'}</td>
                                    <td>{order.orderNo || order.id.toUpperCase()}</td>
                                    <td className="px-2" style={{ whiteSpace: 'nowrap' }}>
                                        <span className={order.type === 'buy' ? 'text-success' : 'text-danger'}>
                                            {order.type === 'buy' ? t('buying') : t('selling')}
                                        </span>
                                    </td>
                                    <td className="px-2 text-secondary" style={{ whiteSpace: 'nowrap' }}>{t('with_the_market')}</td>
                                    <td className="px-2 fw-bold" style={{ whiteSpace: 'nowrap' }}>{order.pair}</td>
                                    <td className="px-2" style={{ whiteSpace: 'nowrap' }}>{order.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="px-2" style={{ whiteSpace: 'nowrap' }}>{order.entryPrice?.toFixed(2)}</td>
                                    <td className="px-2" style={{ whiteSpace: 'nowrap' }}>{order.exitPrice?.toFixed(2) || '-'}</td>
                                    <td className="px-2" style={{ whiteSpace: 'nowrap' }}>{order.duration}</td>
                                    <td className="px-2" style={{ whiteSpace: 'nowrap' }}>{order.profitRate || 90}%</td>
                                    <td className="px-2" style={{ whiteSpace: 'nowrap' }}>{order.leverage || 1}</td>
                                    <td className="px-2 text-secondary" style={{ whiteSpace: 'nowrap' }}>
                                        {order.User?.isSimulated ? t('simulated_account') : t('normal_account')}
                                    </td>
                                    <td className="px-2 text-secondary" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{Math.floor(new Date(order.createdAt).getTime() / 1000)}</td>
                                    <td className="px-2 text-secondary" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{order.resolveAt ? Math.floor(new Date(order.resolveAt).getTime() / 1000) : '-'}</td>
                                    <td className={`px-2 fw-bold ${order.pnl >= 0 ? 'text-success' : 'text-danger'}`} style={{ whiteSpace: 'nowrap' }}>
                                        {order.pnl?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-2 text-secondary" style={{ whiteSpace: 'nowrap' }}>
                                        {strategyLabel}
                                    </td>
                                    <td className="px-2" style={{ whiteSpace: 'nowrap' }}>
                                        {order.status === 'pending' ? '-' : (
                                            <span className={isWin ? 'text-success' : 'text-danger'}>
                                                {isWin ? t('profit') : t('loss')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-2" style={{ whiteSpace: 'nowrap' }}>
                                        {order.status === 'pending' ? (
                                            <Badge bg="warning" text="dark" className="rounded-pill fw-normal">{t('pending')}</Badge>
                                        ) : (
                                            <span className="text-secondary">{t('finish')}</span>
                                        )}
                                    </td>
                                    <td className="px-2 text-end" style={{ whiteSpace: 'nowrap' }}>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="p-0 text-decoration-none fw-600"
                                            style={{ color: 'var(--primary-blue)' }}
                                        >
                                            {t('details')}
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                        {orders.length === 0 && !loading && (
                            <tr>
                                <td colSpan="19" className="text-center py-5 text-secondary">
                                    {t('no_data')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3 px-2">
                <div className="text-secondary small">
                    {t('showing_results_for')} {orders.length} {t('items')}
                </div>
                <Pagination size="sm" className="mb-0">
                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                            <Pagination.Item key={pageNum} active={pageNum === currentPage} onClick={() => handlePageChange(pageNum)}>
                                {pageNum}
                            </Pagination.Item>
                        );
                    })}
                    {totalPages > 5 && <Pagination.Ellipsis disabled />}
                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} />
                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || totalPages === 0} />
                </Pagination>
            </div>
        </div>
    );
};

export default StockOrders;
