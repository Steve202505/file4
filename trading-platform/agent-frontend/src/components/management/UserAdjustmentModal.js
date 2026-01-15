import React, { useState } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { agentService } from '../../services/agentService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const UserAdjustmentModal = ({ show, onHide, user, onSuccess }) => {
    const { t } = useTranslation();
    const { settings } = useTheme();
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('add');
    const [description, setDescription] = useState('');

    if (!user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || amount <= 0) {
            toast.error(t('msg_amount_invalid'));
            return;
        }

        setLoading(true);
        try {
            const response = await agentService.adjustBalance(user.id, {
                amount: parseFloat(amount),
                type,
                description
            });

            if (response.success) {
                toast.success(t('msg_balance_adj_success', { type: type === 'add' ? t('added') : t('deducted') }));
                setAmount('');
                setDescription('');
                if (onSuccess) onSuccess();
                onHide();
            }
        } catch (error) {
            toast.error(error.response?.data?.message ? t(error.response.data.message) : t('error_adjust_balance', 'Failed to adjust balance'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            contentClassName="majestic-card border-0 shadow-lg"
            data-bs-theme={settings.darkMode ? 'dark' : 'light'}
        >
            <div className="majestic-modal-content">
                <Modal.Header closeButton className="border-bottom border-light p-3">
                    <Modal.Title className="fs-6 fw-bold text-white">{t('balance_adjustment', 'Balance Adjustment')}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="mb-4 p-3 rounded d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-darker)', border: '1px solid var(--border-light)' }}>
                        <span className="text-secondary small">{t('current_balance')}</span>
                        <span className="fw-bold fs-5 majestic-text-gold">${user.accountBalance?.toLocaleString()}</span>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small text-secondary">{t('adjustment_type', 'Adjustment Type')}</Form.Label>
                            <div className="d-flex gap-4">
                                <Form.Check
                                    type="radio"
                                    label={t('add_balance', 'Add Balance')}
                                    name="adjType"
                                    checked={type === 'add'}
                                    onChange={() => setType('add')}
                                    style={{ color: 'var(--success-green)' }}
                                    className="small"
                                />
                                <Form.Check
                                    type="radio"
                                    label={t('deduct_balance', 'Deduct Balance')}
                                    name="adjType"
                                    checked={type === 'subtract'}
                                    onChange={() => setType('subtract')}
                                    style={{ color: 'var(--danger-red)' }}
                                    className="small"
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-secondary">{t('amount')}</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-dark border-color text-secondary">$</InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    className="bg-input border-color text-primary-text"
                                />
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="small text-secondary">{t('reason', 'Reason')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder={t('enter_reason', 'Enter reason...')}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-input border-color text-primary-text"
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-light">
                            <Button variant="secondary" size="sm" onClick={onHide} className="px-4">
                                {t('cancel')}
                            </Button>
                            <Button variant={type === 'add' ? 'success' : 'danger'} size="sm" type="submit" disabled={loading} className="px-5">
                                {loading ? t('processing', 'Processing...') : t('confirm')}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </div>
        </Modal>
    );
};

export default UserAdjustmentModal;
