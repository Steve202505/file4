import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Table, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { agentService } from '../services/agentService';
import toast from 'react-hot-toast';

const MyBankCardPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        bankName: '',
        accountName: '',
        accountNumber: '',
        username: ''
    });

    const fetchWallets = useCallback(async () => {
        try {
            const data = await agentService.getMyWallets();
            if (data.success) {
                setCards(data.bankCards);
            }
        } catch (error) {
            toast.error(t('error_history_fetch', 'Failed to fetch bank cards'));
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
            const response = await agentService.addMyBankCard(formData);
            if (response.success) {
                toast.success(t('msg_save_success', 'Bank card added successfully'));
                setShowModal(false);
                setFormData({ bankName: '', accountName: '', accountNumber: '', username: '' });
                fetchWallets();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add bank card');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('confirm_delete', 'Are you sure you want to delete this card?'))) return;
        try {
            const response = await agentService.deleteMyBankCard(id);
            if (response.success) {
                toast.success(t('msg_delete_success', 'Bank card deleted'));
                fetchWallets();
            }
        } catch (error) {
            toast.error(t('error_delete', 'Failed to delete card'));
        }
    };

    return (
        <div className="majestic-page-wrapper p-4">
            <div className="d-flex align-items-center mb-4">
                <Button variant="outline-light p-0 border-0 me-3" onClick={() => navigate('/my-wallet')}>
                    <i className="bi bi-arrow-left fs-4"></i>
                </Button>
                <h4 className="mb-0 text-white">{t('my_bank_cards')}</h4>
                <Button variant="primary" className="ms-auto" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i>{t('add_card')}
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
            ) : cards.length === 0 ? (
                <Alert variant="secondary" className="bg-secondary bg-opacity-10 border-secondary text-secondary">
                    {t('no_bank_cards_linked', 'No bank cards linked yet.')}
                </Alert>
            ) : (
                <div className="majestic-card p-0 overflow-hidden shadow-sm">
                    <Table hover className="border-0 mb-0 align-middle">
                        <thead>
                            <tr>
                                <th>{t('bank_name')}</th>
                                <th>{t('account_name')}</th>
                                <th>{t('account_number')}</th>
                                <th>{t('branch_user')}</th>
                                <th className="text-end">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cards.map(card => (
                                <tr key={card.id}>
                                    <td>{card.bankName}</td>
                                    <td>{card.accountName}</td>
                                    <td className="font-monospace">{card.accountNumber}</td>
                                    <td>{card.username}</td>
                                    <td className="text-end">
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(card.id)}
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
                    <Modal.Title className="text-white fw-bold">{t('add_bank_card')}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        <Form.Group className="mb-3">
                            <Form.Label>{t('bank_name')}</Form.Label>
                            <Form.Control
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleInputChange}
                                required
                                placeholder={t('placeholder_bank')}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('account_name')}</Form.Label>
                            <Form.Control
                                name="accountName"
                                value={formData.accountName}
                                onChange={handleInputChange}
                                required
                                placeholder={t('name_on_card')}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('account_number')}</Form.Label>
                            <Form.Control
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleInputChange}
                                required
                                placeholder={t('account_number')}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('branch_details')}</Form.Label>
                            <Form.Control
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                placeholder={t('branch_placeholder')}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-top border-secondary border-opacity-10">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
                        <Button variant="primary" type="submit" disabled={submitLoading}>
                            {submitLoading ? t('adding') : t('add_card')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default MyBankCardPage;
