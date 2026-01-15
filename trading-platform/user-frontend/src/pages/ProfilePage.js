import React, { useState, useEffect } from 'react';
import { Form, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import UserLanguageSwitcher from '../components/common/UserLanguageSwitcher';
import './MajesticCommon.css';

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    mobileNumber: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      if (data.success) {
        setUser(data.user);
        setFormData({
          email: data.user.email || '',
          mobileNumber: data.user.mobileNumber || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error(t('failed_load_user_data', 'Failed to load user data'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.error(t('profile_update_restricted', 'Profile update requires agent approval. Please contact support.'));
  };

  if (loading) {
    return (
      <div className="majestic-page-wrapper d-flex align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="majestic-page-wrapper d-flex align-items-center justify-content-center px-4 text-center">
        <div className="majestic-card p-5">
          <i className="bi bi-exclamation-triangle-fill text-warning fs-1 mb-3"></i>
          <h5 className="text-white">{t('user_data_unavailable', 'User data unavailable. Please login again.')}</h5>
          <Button variant="warning" className="mt-3 px-4" onClick={() => navigate('/login')}>{t('login')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="majestic-page-wrapper" style={{ paddingBottom: '90px' }}>
      {/* Majestic Header */}
      <div className="majestic-header d-flex align-items-center px-3 py-3 justify-content-between">
        <div style={{ width: '40px' }}>
          <i className="bi bi-chevron-left text-white fs-4 cursor-pointer" onClick={() => navigate(-1)}></i>
        </div>
        <h1 className="majestic-header-title flex-grow-1 text-center">
          {t('profile_settings', 'Profile Settings')}
        </h1>
        <div style={{ width: '40px' }} className="d-flex justify-content-end">
          <UserLanguageSwitcher />
        </div>
      </div>

      <div className="majestic-container animate-slide-up">
        {/* Profile Overview Card */}
        <div className="majestic-card text-center mb-4 p-4 overflow-hidden position-relative shadow-lg" style={{ background: 'rgba(252, 213, 53, 0.05)', border: '1px solid rgba(252, 213, 53, 0.1)' }}>
          <div className="avatar-majestic mx-auto mb-3 shadow-lg">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h4 className="text-white fw-bold mb-1">{user.username}</h4>
          <p className="text-secondary small mb-3">{user.email}</p>
          <div className="d-flex justify-content-center gap-2">
            <Badge bg="success" className="text-success border px-3 py-2 rounded-pill" style={{ background: 'rgba(40, 167, 69, 0.1)', borderColor: 'rgba(40, 167, 69, 0.25)' }}>
              <i className="bi bi-patch-check-fill me-1"></i> {t('verified', 'Verified')}
            </Badge>
            <Badge bg="warning" className="text-warning border px-3 py-2 rounded-pill" style={{ background: 'rgba(252, 213, 53, 0.1)', borderColor: 'rgba(252, 213, 53, 0.25)' }}>
              <i className="bi bi-stars me-1"></i> VIP
            </Badge>
          </div>
        </div>

        {/* Account Details */}
        <div className="majestic-card p-0 overflow-hidden mb-4">
          <div className="p-3 border-bottom border-white border-opacity-10" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <h6 className="m-0 fw-bold text-uppercase small text-secondary" style={{ letterSpacing: '1px' }}>{t('account_info', 'Account Info')}</h6>
          </div>
          <div className="p-3 d-flex flex-column gap-3">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-secondary small">{t('account_id', 'Account ID')}</span>
              <span className="text-white fw-bold family-monospace">{user.id?.slice(-8).toUpperCase()}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-secondary small">{t('available_balance', 'Available Balance')}</span>
              <span className="text-success fw-bold">{user.accountBalance?.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-secondary small">{t('referral_code', 'Referral Code')}</span>
              <span className="text-warning fw-bold">{user.referCode}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="majestic-card p-4 mb-4">
          <h6 className="fw-bold text-uppercase small text-secondary mb-4" style={{ letterSpacing: '1px' }}>{t('edit_profile', 'Edit Profile')}</h6>
          <Form onSubmit={handleSubmit}>
            <div className="majestic-form-group">
              <label className="majestic-label-text small mb-2">{t('username')}</label>
              <div className="majestic-input-wrapper opacity-50">
                <Form.Control
                  type="text"
                  value={user.username}
                  disabled
                  className="majestic-input-field"
                />
              </div>
            </div>

            <div className="majestic-form-group">
              <label className="majestic-label-text small mb-2">{t('email_address')}</label>
              <div className="majestic-input-wrapper opacity-50">
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="majestic-input-field"
                />
              </div>
            </div>

            <div className="majestic-form-group mb-4">
              <label className="majestic-label-text small mb-2">{t('mobile_number')}</label>
              <div className="majestic-input-wrapper opacity-50">
                <Form.Control
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  disabled
                  className="majestic-input-field"
                />
              </div>
            </div>

            <Button
              className="majestic-btn-primary w-100 py-3"
              type="submit"
            >
              {t('update_profile', 'Update Profile')}
            </Button>
            <div className="text-center mt-3">
              <small className="text-danger opacity-75" style={{ fontSize: '11px' }}>
                <i className="bi bi-info-circle me-1"></i> {t('profile_update_note', 'Note: Profile updates require verification from our support team.')}
              </small>
            </div>
          </Form>
        </div>

        {/* Security Section */}
        <div className="majestic-card p-4 mb-5">
          <h6 className="fw-bold text-uppercase small text-secondary mb-4" style={{ letterSpacing: '1px' }}>{t('account_security', 'Account Security')}</h6>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 rounded-3 text-warning" style={{ background: 'rgba(252, 213, 53, 0.1)' }}>
                <i className="bi bi-shield-lock-fill fs-5"></i>
              </div>
              <div>
                <div className="text-white fw-bold small">{t('change_password', 'Change Password')}</div>
                <div className="text-secondary extra-small" style={{ fontSize: '10px' }}>{t('password_change_warning', 'Security updates active')}</div>
              </div>
            </div>
            <Button variant="outline-warning" size="sm" className="rounded-pill px-3" onClick={() => navigate('/profile/settings')}>
              {t('edit', 'Edit')}
            </Button>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 rounded-3 text-danger" style={{ background: 'rgba(220, 53, 69, 0.1)' }}>
                <i className="bi bi-shield-shaded fs-5"></i>
              </div>
              <div>
                <div className="text-white fw-bold small">{t('2fa_authentication', 'Two-Factor Authentication')}</div>
                <div className="text-danger extra-small fw-bold" style={{ fontSize: '10px' }}>{t('2fa_disabled', 'DISABLED')}</div>
              </div>
            </div>
            <Button variant="outline-secondary" size="sm" className="rounded-pill px-3 opacity-50" disabled>
              {t('enable', 'Enable')}
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
                .avatar-majestic {
                    width: 70px;
                    height: 70px;
                    border-radius: 18px;
                    background: linear-gradient(135deg, #fcd535 0%, #f7b500 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: #000;
                    font-weight: 800;
                    border: 2px solid rgba(255,255,255,0.1);
                }
                .family-monospace {
                    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                    letter-spacing: 0.5px;
                }
            `}</style>
    </div>
  );
};

export default ProfilePage;