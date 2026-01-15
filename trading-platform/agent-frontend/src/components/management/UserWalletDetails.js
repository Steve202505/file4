import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Button,
    Form,
    Row,
    Col,
    Pagination,
    Modal,
    Card,
    Badge
} from 'react-bootstrap';
import { agentService } from '../../services/agentService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const UserWalletDetails = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [userWallets, setUserWallets] = useState({ bankCards: [], cryptoWallets: [] });
    const [walletLoading, setWalletLoading] = useState(false);

    const [filters, setFilters] = useState({
        userId: '',
        mobileNumber: ''
    });

    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await agentService.getUsers({
                page,
                limit: 10,
                ...filters
            });
            if (response.success) {
                setUsers(response.users);
                setTotalPages(response.pagination.pages);
                setCurrentPage(response.pagination.page);
            }
        } catch (error) {
            toast.error(t('error_fetch_users'));
        } finally {
            setLoading(false);
        }
    }, [filters, t]);

    useEffect(() => {
        fetchUsers(1);
    }, [fetchUsers]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ userId: '', mobileNumber: '' });
    };

    const handlePageChange = (page) => {
        fetchUsers(page);
    };

    const openWalletDetails = async (user) => {
        setSelectedUser(user);
        setShowWalletModal(true);
        setWalletLoading(true);
        try {
            const response = await agentService.getUserWallets(user.id);
            if (response.success) {
                setUserWallets({
                    bankCards: response.bankCards,
                    cryptoWallets: response.cryptoWallets
                });
            }
        } catch (error) {
            toast.error(t('error_fetch_wallet_details', 'Failed to fetch wallet details'));
        } finally {
            setWalletLoading(false);
        }
    };

    return (
        <div className="majestic-page-wrapper">

            {/* Header */}
            <h4 className="mb-4 text-white">{t('menu_user_wallet_details')}</h4>

            {/* Filter Section */}
            <div className="majestic-card filter-bar mb-4">
                <Row className="g-3 w-100">
                    <Col xs={12} md="auto">
                        <div className="d-flex align-items-center">
                            <Form.Control
                                type="text"
                                name="userId"
                                placeholder={t('user_id')}
                                value={filters.userId}
                                onChange={handleFilterChange}
                                style={{ minWidth: '150px' }}
                            />
                        </div>
                    </Col>
                    <Col xs={12} md="auto">
                        <div className="d-flex align-items-center">
                            <Form.Control
                                type="text"
                                name="mobileNumber"
                                placeholder={t('mobile_number')}
                                value={filters.mobileNumber}
                                onChange={handleFilterChange}
                                style={{ minWidth: '150px' }}
                            />
                        </div>
                    </Col>
                    <Col xs={12} md="auto" className="ms-auto">
                        <div className="d-flex gap-2">
                            <Button variant="primary" size="sm" className="px-3" onClick={() => fetchUsers(1)}>{t('query')}</Button>
                            <Button variant="secondary" size="sm" className="px-3" onClick={clearFilters}>{t('reset')}</Button>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Data Table */}
            <div className="majestic-card p-0 majestic-table-container shadow-sm">
                <Table hover className="border-0 mb-0">
                    <thead>
                        <tr>
                            <th>{t('user_id')}</th>
                            <th>{t('username')}</th>
                            <th>{t('user_nickname')}</th>
                            <th>{t('mobile_number')}</th>
                            <th>{t('credit_score')}</th>
                            <th>{t('registration_time')}</th>
                            <th className="text-end">{t('operate')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-5">{t('no_data')}</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id.slice(-8).toUpperCase()}</td>
                                    <td style={{ color: 'var(--text-primary)' }}>{user.username}</td>
                                    <td>{user.email.split('@')[0]}</td>
                                    <td>{user.mobileNumber}</td>
                                    <td>{user.creditScore}</td>
                                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                                    <td className="text-end">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => openWalletDetails(user)}
                                        >
                                            {t('view_more')}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-end mt-3">
                <Pagination size="sm">
                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => handlePageChange(i + 1)}>
                            {i + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
            </div>

            {/* Wallet Details Modal */}
            <Modal show={showWalletModal} onHide={() => setShowWalletModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-dark text-white border-secondary">
                    <Modal.Title>{t('menu_user_wallet_details')}: {selectedUser?.username}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">
                    {walletLoading ? (
                        <div className="text-center py-5">{t('loading_data')}</div>
                    ) : (
                        <div className="d-flex flex-column gap-4">
                            {/* Bank Cards */}
                            <Card className="bg-secondary bg-opacity-10 border-secondary">
                                <Card.Header className="border-secondary d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0 text-white"><i className="bi bi-credit-card me-2"></i>{t('bank_accounts')}</h6>
                                    <Badge bg="primary">{userWallets.bankCards.length}</Badge>
                                </Card.Header>
                                <Card.Body>
                                    {userWallets.bankCards.length === 0 ? (
                                        <div className="text-center text-secondary small">{t('no_bank_cards')}</div>
                                    ) : (
                                        <div className="majestic-table-container">
                                            <Table size="sm" variant="dark" className="mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>{t('bank_name')}</th>
                                                        <th>{t('account_name')}</th>
                                                        <th>{t('account_number')}</th>
                                                        <th>{t('status')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userWallets.bankCards.map((card, idx) => (
                                                        <tr key={idx}>
                                                            <td>{card.bankName}</td>
                                                            <td>{card.accountName}</td>
                                                            <td>{card.accountNumber}</td>
                                                            <td>
                                                                <Badge bg={card.status === 'active' ? 'success' : 'danger'}>
                                                                    {card.status}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Crypto Wallets */}
                            <Card className="bg-secondary bg-opacity-10 border-secondary">
                                <Card.Header className="border-secondary d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0 text-white"><i className="bi bi-currency-bitcoin me-2"></i>{t('crypto_wallets_title')}</h6>
                                    <Badge bg="warning" text="dark">{userWallets.cryptoWallets.length}</Badge>
                                </Card.Header>
                                <Card.Body>
                                    {userWallets.cryptoWallets.length === 0 ? (
                                        <div className="text-center text-secondary small">{t('no_crypto_wallets')}</div>
                                    ) : (
                                        <div className="majestic-table-container">
                                            <Table size="sm" variant="dark" className="mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>{t('network')}</th>
                                                        <th>{t('wallet_address')}</th>
                                                        <th>{t('alias')}</th>
                                                        <th>{t('status')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userWallets.cryptoWallets.map((wallet, idx) => (
                                                        <tr key={idx}>
                                                            <td>{wallet.network}</td>
                                                            <td className="text-break" style={{ maxWidth: '200px' }}>{wallet.walletAddress}</td>
                                                            <td>{wallet.alias}</td>
                                                            <td>
                                                                <Badge bg={wallet.status === 'active' ? 'success' : 'danger'}>
                                                                    {wallet.status}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-dark border-secondary">
                    <Button variant="secondary" onClick={() => setShowWalletModal(false)}>{t('close')}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserWalletDetails;
