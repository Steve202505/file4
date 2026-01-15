import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agentService } from '../../services/agentService';
import { isAdmin } from '../../services/auth';
import { useTranslation } from 'react-i18next';
import UserEditModal from './UserEditModal';
import UserAdjustmentModal from './UserAdjustmentModal';
import UserSupportModal from './UserSupportModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import toast from 'react-hot-toast';
import './UserDetails.css';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchUser = useCallback(async () => {
        try {
            const response = await agentService.getUser(id);
            if (response.success) {
                setUser(response.user);
            }
        } catch (error) {
            toast.error(t('error_fetch_user_details') || 'Failed to fetch user details');
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleDelete = async () => {
        try {
            const response = await agentService.deleteUser(id);
            if (response.success) {
                toast.success(t('user_deleted_success') || 'User deleted successfully');
                setShowDeleteModal(false);
                navigate('/user-management');
            }
        } catch (error) {
            toast.error(t('error_delete_user') || 'Failed to delete user');
        }
    };

    if (loading) return <div className="user-details-container text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
    if (!user) return <div className="user-details-container text-center py-5">{t('no_data')}</div>;

    return (
        <div className="user-details-container">
            {/* Header */}
            <div className="details-header">
                <button className="return-btn" onClick={() => navigate('/user-management')}>
                    <i className="bi bi-arrow-left me-1"></i> {t('return')}
                </button>
                <span className="header-title">{t('user_details')}</span>
            </div>

            {/* Basic Information Section */}
            <div className="section-header">
                <span>{t('user_basic_info') || 'Basic Information'}</span>
            </div>

            <div className="basic-info-card">
                {/* Avatar & Balance Strip */}
                <div className="avatar-section">
                    <div className="avatar-placeholder"></div>
                    <div>
                        <div className="balance-info">
                            <span className="balance-item">{t('balance')}: {user.accountBalance?.toFixed(2)}</span>
                            <span className="balance-item">{t('frozen_balance')}: 0.00</span>
                            <span className="balance-item">{t('commission_balance')}: 0.00</span>
                        </div>
                        <div className="action-buttons-group">
                            <button className="action-btn edit-btn" onClick={() => setShowEditModal(true)}>
                                <i className="bi bi-pencil-square me-1"></i> {t('edit')}
                            </button>
                            {isAdmin() && (
                                <>
                                    <button className="action-btn delete-btn" onClick={() => setShowDeleteModal(true)}>
                                        <i className="bi bi-trash me-1"></i> {t('delete')}
                                    </button>
                                    <button className="action-btn balance-btn" onClick={() => setShowBalanceModal(true)}>
                                        <i className="bi bi-wallet2 me-1"></i> {t('balance_control')}
                                    </button>
                                    <button className="action-btn support-btn" onClick={() => setShowSupportModal(true)}>
                                        <i className="bi bi-headset me-1"></i> {t('support')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed Fields */}
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">{t('user_id')}:</span>
                        <span className="info-value">{user.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">{t('account')}:</span>
                        <span className="info-value">{user.username}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">{t('password')}:</span>
                        <span className="info-value">********</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">{t('vip_level')}:</span>
                        <span className="info-value">{user.vipLevel || 0}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">{t('credit_score')}:</span>
                        <span className="info-value">{user.creditScore ?? 0}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">{t('wallet_address')}:</span>
                        <span className="info-value">{user.walletAddress || ''}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">{t('simulate_user')}:</span>
                        <span className="info-value">{user.isSimulated ? t('yes') : t('no')}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">{t('state')}:</span>
                        <span className="info-value state-tag">{user.isActive ? t('normal') : t('forbidden')}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">{t('registration_time')}:</span>
                        <span className="info-value">{new Date(user.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">{t('last_login_time')}:</span>
                        <span className="info-value">{t('unknown')}</span>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <UserEditModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    user={user}
                    onSuccess={fetchUser}
                />
            )}

            {showBalanceModal && (
                <UserAdjustmentModal
                    show={showBalanceModal}
                    onHide={() => setShowBalanceModal(false)}
                    user={user}
                    onSuccess={fetchUser}
                />
            )}

            {showSupportModal && (
                <UserSupportModal
                    show={showSupportModal}
                    onHide={() => setShowSupportModal(false)}
                    user={user}
                    onSuccess={fetchUser}
                />
            )}

            {showDeleteModal && (
                <DeleteConfirmationModal
                    show={showDeleteModal}
                    onHide={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                    username={user.username}
                />
            )}
        </div>
    );
};

export default UserDetails;
