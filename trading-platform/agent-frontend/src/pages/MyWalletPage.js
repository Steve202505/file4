import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Table, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { agentService } from '../services/agentService';
import toast from 'react-hot-toast';

const MyWalletPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [wallets, setWallets] = useState({ bankCards: [], cryptoWallets: [] });

    const fetchWallets = useCallback(async () => {
        try {
            const response = await agentService.getMyWallets();
            if (response.success) {
                setWallets({
                    bankCards: response.bankCards,
                    cryptoWallets: response.cryptoWallets
                });
            }
        } catch (error) {
            console.error('Error fetching wallets:', error);
            toast.error(t('error_history_fetch', 'Failed to load wallet addresses'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchWallets();
    }, [fetchWallets]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(t('msg_copy_success'));
        });
    };

    return (
        <div className="majestic-page-wrapper p-4">


            <div className="d-flex align-items-center gap-3 mb-5 fade-in">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                    <i className="bi bi-wallet2 text-primary fs-3"></i>
                </div>
                <h3 className="section-title mb-0">{t('add_wallet')}</h3>
            </div>

            {/* Management Cards */}
            <Row className="g-4 mb-5">
                <Col md={6} className="fade-in" style={{ animationDelay: '0.1s' }}>
                    <Card className="majestic-card h-100 text-white border-0">
                        <Card.Body className="d-flex flex-column align-items-center justify-content-center py-5">
                            <div className="bg-primary bg-opacity-10 p-4 rounded-circle mb-4 icon-glow-blue">
                                <i className="bi bi-credit-card-2-front text-primary" style={{ fontSize: '3rem' }}></i>
                            </div>
                            <h4 className="fw-bold mb-2">{t('bank_card')}</h4>
                            <p className="text-secondary small mb-4">{t('manage_bank_cards_desc', 'Connect and manage your bank withdrawal methods')}</p>
                            <Button className="btn-premium" onClick={() => navigate('/my-wallet/bank-card')}>
                                <i className="bi bi-grid-fill me-2"></i>
                                {t('my_bank_cards')}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} className="fade-in" style={{ animationDelay: '0.2s' }}>
                    <Card className="majestic-card h-100 text-white border-0">
                        <Card.Body className="d-flex flex-column align-items-center justify-content-center py-5">
                            <div className="bg-warning bg-opacity-10 p-4 rounded-circle mb-4 icon-glow-warning">
                                <i className="bi bi-currency-bitcoin text-warning" style={{ fontSize: '3rem' }}></i>
                            </div>
                            <h4 className="fw-bold mb-2">{t('crypto_wallet')}</h4>
                            <p className="text-secondary small mb-4">{t('manage_crypto_wallets_desc', 'Securely handle your cryptocurrency addresses')}</p>
                            <Button className="btn-premium-warning" onClick={() => navigate('/my-wallet/crypto-wallet')}>
                                <i className="bi bi-cpu-fill me-2"></i>
                                {t('my_crypto_wallets')}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* All Payment Addresses Section */}
            <div className="payment-header fade-in" style={{ animationDelay: '0.3s' }}>
                <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                    <i className="bi bi-shield-check me-2 text-primary"></i>
                    {t('all_payment_addresses')}
                </h5>
            </div>

            {loading ? (
                <div className="text-center py-5 fade-in">{t('loading')}</div>
            ) : (
                <div className="d-flex flex-column gap-5 fade-in" style={{ animationDelay: '0.4s' }}>
                    {/* Bank Cards Table */}
                    <div id="bank-cards-section">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-bank2 text-primary fs-5"></i>
                            <h6 className="text-white mb-0 fw-bold">{t('bank_accounts')}</h6>
                            <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2">
                                {wallets.bankCards.length}
                            </Badge>
                        </div>
                        {wallets.bankCards.length === 0 ? (
                            <div className="glass-card p-4 text-center text-muted small">{t('no_bank_accounts')}</div>
                        ) : (
                            <UniversalTable
                                data={wallets.bankCards.map(c => ({
                                    ...c,
                                    title: c.bankName,
                                    sub: c.accountNumber,
                                    extra: c.accountName,
                                    ref: c.username,
                                    type: 'BANK'
                                }))}
                                copyToClipboard={copyToClipboard}
                            />
                        )}
                    </div>

                    {/* Crypto Wallets Table */}
                    <div id="crypto-wallets-section">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-lightning-charge-fill text-warning fs-5"></i>
                            <h6 className="text-white mb-0 fw-bold">{t('crypto_wallets_title')}</h6>
                            <Badge bg="warning" className="bg-opacity-10 text-warning border border-warning border-opacity-25 px-2">
                                {wallets.cryptoWallets.length}
                            </Badge>
                        </div>
                        {wallets.cryptoWallets.length === 0 ? (
                            <div className="glass-card p-4 text-center text-muted small">{t('no_crypto_wallets_added')}</div>
                        ) : (
                            <UniversalTable
                                data={wallets.cryptoWallets.map(w => ({
                                    ...w,
                                    title: w.network,
                                    sub: w.walletAddress,
                                    extra: w.alias || '-',
                                    ref: '-',
                                    type: 'CRYPTO'
                                }))}
                                copyToClipboard={copyToClipboard}
                            />
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

// Generic Table with Pagination
const UniversalTable = ({ data, copyToClipboard }) => {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const currentItems = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const isBank = data[0]?.type === 'BANK';

    return (
        <>
            <style>
                {`
                .premium-table-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }

                .premium-table thead th {
                    background: rgba(64, 158, 255, 0.05) !important;
                    color: #fff !important;
                    text-transform: uppercase;
                    font-size: 0.7rem;
                    letter-spacing: 1px;
                    padding: 15px 20px;
                    border-bottom: 2px solid rgba(64, 158, 255, 0.2) !important;
                }

                .premium-table tbody td {
                    background: transparent !important;
                    color: var(--text-regular) !important;
                    padding: 18px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                    transition: all 0.2s ease;
                }

                .premium-table tbody tr:hover td {
                    background: rgba(255, 255, 255, 0.03) !important;
                    color: #fff !important;
                }

                .copy-badge {
                    background: rgba(64, 158, 255, 0.1);
                    color: var(--primary-blue);
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .copy-badge:hover {
                    background: var(--primary-blue);
                    color: #fff;
                }

                .status-badge-active {
                    background: linear-gradient(135deg, rgba(103, 194, 58, 0.2) 0%, rgba(103, 194, 58, 0.1) 100%);
                    color: #67C23A;
                    border: 1px solid rgba(103, 194, 58, 0.3);
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-size: 11px;
                    text-transform: capitalize;
                }

                .pagination-glow .btn-light {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #909399;
                }

                .pagination-glow .btn-primary {
                    background: var(--primary-blue);
                    box-shadow: 0 0 15px rgba(64, 158, 255, 0.3);
                }
                `}
            </style>
            <div className="premium-table-card mb-4">
                <div className="table-responsive">
                    <Table hover className="premium-table mb-0 align-middle">
                        <thead>
                            <tr>
                                <th style={{ width: isBank ? '20%' : '25%' }}>{isBank ? t('bank_name') : t('network')}</th>
                                <th style={{ width: isBank ? '35%' : '45%' }}>{isBank ? t('account_number') : t('wallet_address')}</th>
                                <th style={{ width: '20%' }}>{isBank ? t('account_name') : t('alias')}</th>
                                {isBank && <th style={{ width: '15%' }}>{t('branch_ref')}</th>}
                                <th style={{ width: '10%' }}>{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="bg-primary bg-opacity-10 p-2 rounded-circle border border-primary border-opacity-10">
                                                <i className={`bi ${isBank ? 'bi-bank' : 'bi-currency-exchange'} text-primary small`}></i>
                                            </div>
                                            <span className="fw-bold text-white">{item.title}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="font-monospace text-secondary" style={{ fontSize: '0.9rem' }}>{item.sub}</span>
                                            <span className="copy-badge" onClick={() => copyToClipboard(item.sub)}>
                                                <i className="bi bi-files me-1"></i>
                                                COPY
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-secondary small">{item.extra}</div>
                                    </td>
                                    {isBank && <td><span className="text-secondary small">{item.ref}</span></td>}
                                    <td>
                                        <span className="status-badge-active">
                                            {item.status || 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center mb-4 pagination-glow">
                    <div className="d-flex align-items-center gap-2 p-2 glass-card rounded-pill">
                        <Button variant="light" size="sm" className="rounded-circle" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                            <i className="bi bi-chevron-left"></i>
                        </Button>
                        {[...Array(totalPages)].map((_, i) => (
                            <Button
                                key={i + 1}
                                variant={currentPage === i + 1 ? 'primary' : 'light'}
                                size="sm"
                                className="rounded-circle"
                                style={{ width: '32px', height: '32px', padding: 0 }}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </Button>
                        ))}
                        <Button variant="light" size="sm" className="rounded-circle" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                            <i className="bi bi-chevron-right"></i>
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyWalletPage;
