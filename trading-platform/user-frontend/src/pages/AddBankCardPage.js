import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import UserLanguageSwitcher from '../components/common/UserLanguageSwitcher';
import './MajesticCommon.css';
import MajesticSelect from '../components/common/MajesticSelect';

const AddBankCardPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        bankName: '',
        bankAccountName: '',
        accountNumber: '',
        username: ''
    });

    const bankOptions = [
        { value: 'Easy Paisa', label: t('bank_easy_paisa', 'Easy Paisa'), name: 'bankName' },
        { value: 'JazzCash', label: t('bank_jazz_cash', 'JazzCash'), name: 'bankName' },
        { value: 'UPaisa', label: t('bank_upaisa', 'UPaisa'), name: 'bankName' },
        { value: 'Meezan Bank', label: t('bank_meezan', 'Meezan Bank'), name: 'bankName' },
        { value: 'HBL', label: t('bank_hbl', 'HBL'), name: 'bankName' },
        { value: 'UBL', label: t('bank_ubl', 'UBL'), name: 'bankName' },
        { value: 'Bank Transfer', label: t('bank_transfer', 'Bank Transfer'), name: 'bankName' }
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = await userService.addBankCard(formData);
            if (data.success) {
                toast.success(t('bank_card_added', 'Bank card added successfully'));
                navigate('/wallet/bank-card');
            }
        } catch (error) {
            console.error('Failed to add bank card:', error);
            toast.error(error.message || t('error_adding_bank_card', 'Error adding bank card'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="majestic-page-wrapper">
            <div className="majestic-header d-flex align-items-center px-3 py-3 justify-content-between">
                <div style={{ width: '40px' }}>
                    <i
                        className="bi bi-chevron-left text-white fs-4 cursor-pointer"
                        onClick={() => navigate('/wallet/bank-card')}
                    ></i>
                </div>
                <h1 className="majestic-header-title flex-grow-1 text-center">
                    {t('add_bank_card', 'Add Bank Card')}
                </h1>
                <div style={{ width: '40px' }} className="d-flex justify-content-end">
                    <UserLanguageSwitcher />
                </div>
            </div>

            <div className="majestic-container animate-slide-up">
                <div className="p-4 rounded-4 mb-4" style={{ background: 'rgba(252, 213, 53, 0.05)', border: '1px solid rgba(252, 213, 53, 0.1)' }}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-2 rounded-3" style={{ background: 'rgba(252, 213, 53, 0.1)' }}>
                            <i className="bi bi-shield-lock-fill text-warning fs-4"></i>
                        </div>
                        <div>
                            <div className="text-white fw-bold">{t('secure_binding', 'Secure Binding')}</div>
                            <div className="text-secondary small">{t('secure_binding_desc', 'Your card details are encrypted and safe.')}</div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="majestic-form-group">
                        <div className="majestic-label-row">
                            <span className="majestic-label-dot"></span>
                            <span className="majestic-label-text">{t('select_bank', 'Select Bank')}</span>
                        </div>
                        <MajesticSelect
                            options={bankOptions}
                            value={formData.bankName}
                            onChange={handleChange}
                            placeholder={t('select_the_bank', 'Select the Bank')}
                            icon="bi-bank2"
                        />
                    </div>

                    <div className="majestic-form-group">
                        <div className="majestic-label-row">
                            <span className="majestic-label-dot"></span>
                            <span className="majestic-label-text">{t('bank_account_name', 'Bank Account Name')}</span>
                        </div>
                        <div className="majestic-input-wrapper">
                            <input
                                type="text"
                                name="bankAccountName"
                                className="form-control majestic-input-field"
                                placeholder={t('enter_bank_account_name', 'Enter Bank Account Name')}
                                value={formData.bankAccountName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="majestic-form-group">
                        <div className="majestic-label-row">
                            <span className="majestic-label-dot"></span>
                            <span className="majestic-label-text">{t('account_number', 'Account Number')}</span>
                        </div>
                        <div className="majestic-input-wrapper">
                            <input
                                type="text"
                                name="accountNumber"
                                className="form-control majestic-input-field"
                                placeholder={t('enter_account_number', 'Enter Account Number')}
                                value={formData.accountNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="majestic-form-group mb-4">
                        <div className="majestic-label-row">
                            <span className="majestic-label-dot"></span>
                            <span className="majestic-label-text">{t('username', 'Username')}</span>
                        </div>
                        <div className="majestic-input-wrapper">
                            <input
                                type="text"
                                name="username"
                                className="form-control majestic-input-field"
                                placeholder={t('val_username_required', 'Enter Username')}
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn majestic-btn-primary w-100 py-3 mt-2"
                    >
                        {submitting ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>{t('submitting', 'Processing...')}</>
                        ) : (
                            <><i className="bi bi-check-circle-fill me-2"></i>{t('bank_continue', 'Continue')}</>
                        )}
                    </button>
                </form>

                <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="text-secondary extra-small d-flex gap-2">
                        <i className="bi bi-info-circle text-warning"></i>
                        <span style={{ fontSize: '11px', lineHeight: '1.4' }}>
                            {t('binding_notice', 'Please ensure all details match your official records to avoid transaction delays.')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBankCardPage;
