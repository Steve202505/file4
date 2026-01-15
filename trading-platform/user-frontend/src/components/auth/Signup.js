import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { authService } from '../../services/api';
import { setAuthData } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserLanguageSwitcher from '../common/UserLanguageSwitcher';
import '../../pages/MajesticCommon.css';
import './Signup.css';

const Signup = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const signupSchema = yup.object().shape({
    username: yup
      .string()
      .min(3, t('username_min'))
      .max(30, t('username_max'))
      .required(t('username_required')),
    email: yup
      .string()
      .email(t('email_invalid'))
      .required(t('email_required')),
    mobileNumber: yup
      .string()
      .matches(/^[0-9]{10,15}$/, t('mobile_invalid'))
      .required(t('mobile_required')),
    password: yup
      .string()
      .min(6, t('password_min'))
      .required(t('password_required')),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password'), null], t('password_match'))
      .required(t('val_confirm_password_required')),
    referCode: yup
      .string()
      .required(t('referral_required'))
      .transform((value) => (value === '' ? undefined : value?.toUpperCase()))
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(signupSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await authService.signup({
        username: data.username,
        email: data.email,
        mobileNumber: data.mobileNumber,
        password: data.password,
        confirmPassword: data.confirmPassword,
        referCode: data.referCode || undefined
      });

      if (response.data.success) {
        const { token, user } = response.data;
        setAuthData(token, user);
        toast.success(t('signup_success'));
        reset();
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message ? t(error.response.data.message) : t('signup_failed');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="majestic-page-wrapper d-flex align-items-center justify-content-center p-2 p-md-4">
      <div className="language-switcher-wrapper" style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 1000 }}>
        <UserLanguageSwitcher />
      </div>

      <div className="majestic-card w-100 animate-slide-up my-auto" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-3 mb-md-4">
          <div className="p-2 p-md-3 rounded-circle d-inline-block mb-2 shadow-lg animate-fade-in" style={{ border: '1px solid rgba(252, 213, 53, 0.2)', animationDelay: '0.2s', background: 'rgba(252, 213, 53, 0.1)' }}>
            <img src="/assets/images/logo.png" alt="Logo" className="logo-img" />
          </div>
          <h2 className="majestic-text-shimmer fw-bold mb-1 tracking-tight">{t('create_account', 'Join Goldxgo')}</h2>
          <p className="text-secondary extra-small opacity-75 mb-0">{t('signup_desc', 'Start your trading journey with elite tools')}</p>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="row g-2 g-md-3">
            <div className="col-6">
              <div className="majestic-form-group mb-0">
                <div className="majestic-label-row mb-1">
                  <div className="majestic-label-dot"></div>
                  <label className="majestic-label-text extra-small">{t('username')}</label>
                </div>
                <div className={`majestic-input-wrapper ${errors.username ? 'border-danger' : ''}`}>
                  <i className="bi bi-person-circle majestic-input-icon small"></i>
                  <Form.Control
                    type="text"
                    placeholder={t('username')}
                    {...register('username')}
                    className="majestic-input-field"
                  />
                </div>
                {errors.username && <div className="text-danger mt-1 animate-fade-in" style={{ fontSize: '9px' }}>{errors.username.message}</div>}
              </div>
            </div>

            <div className="col-6">
              <div className="majestic-form-group mb-0">
                <div className="majestic-label-row mb-1">
                  <div className="majestic-label-dot"></div>
                  <label className="majestic-label-text extra-small">{t('email_address')}</label>
                </div>
                <div className={`majestic-input-wrapper ${errors.email ? 'border-danger' : ''}`}>
                  <i className="bi bi-envelope-at-fill majestic-input-icon small"></i>
                  <Form.Control
                    type="email"
                    placeholder={t('email')}
                    {...register('email')}
                    className="majestic-input-field"
                  />
                </div>
                {errors.email && <div className="text-danger mt-1 animate-fade-in" style={{ fontSize: '9px' }}>{errors.email.message}</div>}
              </div>
            </div>

            <div className="col-12">
              <div className="majestic-form-group mb-0">
                <div className="majestic-label-row mb-1">
                  <div className="majestic-label-dot"></div>
                  <label className="majestic-label-text extra-small">{t('mobile_number')}</label>
                </div>
                <div className={`majestic-input-wrapper ${errors.mobileNumber ? 'border-danger' : ''}`}>
                  <i className="bi bi-phone-fill majestic-input-icon small"></i>
                  <Form.Control
                    type="tel"
                    placeholder={t('mobile_number')}
                    {...register('mobileNumber')}
                    className="majestic-input-field"
                  />
                </div>
                {errors.mobileNumber && <div className="text-danger mt-1 animate-fade-in" style={{ fontSize: '9px' }}>{errors.mobileNumber.message}</div>}
              </div>
            </div>

            <div className="col-6">
              <div className="majestic-form-group mb-0">
                <div className="majestic-label-row mb-1">
                  <div className="majestic-label-dot"></div>
                  <label className="majestic-label-text extra-small">{t('password')}</label>
                </div>
                <div className={`majestic-input-wrapper ${errors.password ? 'border-danger' : ''}`}>
                  <i className="bi bi-shield-lock-fill majestic-input-icon small"></i>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('password')}
                    {...register('password')}
                    className="majestic-input-field px-0"
                  />
                  <button type="button" className="btn btn-link text-secondary p-0 shadow-none" onClick={() => setShowPassword(!showPassword)}>
                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} small`}></i>
                  </button>
                </div>
                {errors.password && <div className="text-danger mt-1 animate-fade-in" style={{ fontSize: '9px' }}>{errors.password.message}</div>}
              </div>
            </div>

            <div className="col-6">
              <div className="majestic-form-group mb-0">
                <div className="majestic-label-row mb-1">
                  <div className="majestic-label-dot"></div>
                  <label className="majestic-label-text extra-small">{t('confirm')}</label>
                </div>
                <div className={`majestic-input-wrapper ${errors.confirmPassword ? 'border-danger' : ''}`}>
                  <i className="bi bi-shield-check-fill majestic-input-icon small"></i>
                  <Form.Control
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('confirm')}
                    {...register('confirmPassword')}
                    className="majestic-input-field px-0"
                  />
                  <button type="button" className="btn btn-link text-secondary p-0 shadow-none" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} small`}></i>
                  </button>
                </div>
                {errors.confirmPassword && <div className="text-danger mt-1 animate-fade-in" style={{ fontSize: '9px' }}>{errors.confirmPassword.message}</div>}
              </div>
            </div>

            <div className="col-12">
              <div className="majestic-form-group mb-0">
                <div className="majestic-label-row mb-1">
                  <div className="majestic-label-dot"></div>
                  <label className="majestic-label-text extra-small">{t('referral_code')}</label>
                </div>
                <div className={`majestic-input-wrapper ${errors.referCode ? 'border-danger' : ''}`}>
                  <i className="bi bi-ticket-perforated-fill majestic-input-icon small"></i>
                  <Form.Control
                    type="text"
                    placeholder={t('referral_code')}
                    {...register('referCode')}
                    className="majestic-input-field text-uppercase"
                    style={{ letterSpacing: '1px' }}
                  />
                </div>
                {errors.referCode ? (
                  <div className="text-danger mt-1 animate-fade-in" style={{ fontSize: '9px' }}>{errors.referCode.message}</div>
                ) : (
                  <div className="text-warning opacity-50 ps-1 d-flex align-items-center" style={{ fontSize: '9px', marginTop: '4px' }}>
                    <i className="bi bi-info-circle mini-icon me-1"></i>
                    {t('referral_required_msg', 'A valid referral code is required')}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            className="majestic-btn-primary w-100 py-2 py-md-3 fw-bold mt-3 mb-2 shadow-lg pulse-effect"
            type="submit"
            disabled={loading}
            style={{ fontSize: '14px' }}
          >
            {loading ? (
              <div className="d-flex align-items-center justify-content-center">
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {t('processing')}...
              </div>
            ) : t('signup')}
          </Button>

          <div className="text-center">
            <p className="text-secondary" style={{ fontSize: '12px' }}>
              {t('already_have_account', 'Already have an account?')} {' '}
              <span className="text-warning fw-bold cursor-pointer hover-opacity-100 transition-all ms-1" onClick={() => navigate('/login')}>
                {t('login')}
              </span>
            </p>
          </div>
        </Form>
      </div>

      <style jsx>{`
        .tracking-tight { letter-spacing: -0.5px; }
        .mini-icon { font-size: 8px; }
        .hover-opacity-100:hover { opacity: 1 !important; }
        .pulse-effect:not(:disabled) { animation: pulse-glow 3s infinite; }
        .logo-img { width: 36px; height: 36px; object-fit: contain; }
        @media (min-width: 768px) {
          .logo-img { width: 48px; height: 48px; }
        }
        @media (max-width: 576px) {
           h2 { font-size: 1.25rem; }
        }
      `}</style>
    </div>
  );
};

export default Signup;