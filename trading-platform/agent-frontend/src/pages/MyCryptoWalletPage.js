import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Table, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { agentService } from '../services/agentService';
import toast from 'react-hot-toast';

const MyCryptoWalletPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        walletAddress: '',
        network: 'TRC20',
        alias: ''
    });

    const fetchWallets = useCallback(async () => {
        try {
            const data = await agentService.getMyWallets();
            if (data.success) {
                setWallets(data.cryptoWallets);
            }
        } catch (error) {
            toast.error(t('error_history_fetch', 'Failed to fetch crypto wallets'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchWallets();
    }, [fetchWallets]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            const response = await agentService.addMyCryptoWallet(formData);
            if (response.success) {
                toast.success(t('msg_save_success', 'Crypto wallet added successfully'));
                setShowModal(false);
                setFormData({ walletAddress: '', network: 'TRC20', alias: '' });
                fetchWallets();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add crypto wallet');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('confirm_delete', 'Are you sure you want to delete this wallet?'))) return;
        try {
            const response = await agentService.deleteMyCryptoWallet(id);
            if (response.success) {
                toast.success(t('msg_delete_success', 'Crypto wallet deleted'));
                fetchWallets();
            }
        } catch (error) {
            toast.error(t('error_delete', 'Failed to delete wallet'));
        }
    };

    return (
        <div className="majestic-page-wrapper p-4">
            <div className="d-flex align-items-center mb-4">
                <Button variant="outline-light p-0 border-0 me-3" onClick={() => navigate('/my-wallet')}>
                    <i className="bi bi-arrow-left fs-4"></i>
                </Button>
                <h4 className="mb-0 text-white">{t('my_crypto_wallets')}</h4>
                <Button variant="warning" className="ms-auto" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i>{t('add_wallet')}
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
            ) : wallets.length === 0 ? (
                <Alert variant="secondary" className="bg-secondary bg-opacity-10 border-secondary text-secondary">
                    {t('no_crypto_wallets_linked', 'No crypto wallets linked yet.')}
                </Alert>
            ) : (
                <div className="majestic-card p-0 overflow-hidden shadow-sm">
                    <Table hover className="border-0 mb-0 align-middle">
                        <thead>
                            <tr>
                                <th>{t('network')}</th>
                                <th>{t('wallet_address')}</th>
                                <th>{t('alias')}</th>
                                <th className="text-end">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wallets.map(wallet => (
                                <tr key={wallet.id}>
                                    <td><span className="badge bg-warning text-dark">{wallet.network}</span></td>
                                    <td className="font-monospace text-break">{wallet.walletAddress}</td>
                                    <td>{wallet.alias}</td>
                                    <td className="text-end">
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(wallet.id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Add Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="majestic-card border-0">
                <Modal.Header closeButton className="border-bottom border-secondary border-opacity-10 py-3">
                    <Modal.Title className="fw-bold text-white">{t('add_crypto_wallet')}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        <Form.Group className="mb-3">
                            <Form.Label>{t('network')}</Form.Label>
                            <Form.Select
                                name="network"
                                value={formData.network}
                                onChange={handleInputChange}
                            >
                                <option value="TRC20">TRC20</option>
                                <option value="ERC20">ERC20</option>
                                <option value="BTC">BTC</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('wallet_address')}</Form.Label>
                            <Form.Control
                                name="walletAddress"
                                value={formData.walletAddress}
                                onChange={handleInputChange}
                                required
                                placeholder={t('enter_wallet_address')}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('alias_optional')}</Form.Label>
                            <Form.Control
                                name="alias"
                                value={formData.alias}
                                onChange={handleInputChange}
                                placeholder={t('alias_placeholder')}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-top border-secondary border-opacity-10">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
                        <Button variant="warning" type="submit" disabled={submitLoading}>
                            {submitLoading ? t('adding') : t('add_wallet')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default MyCryptoWalletPage;
