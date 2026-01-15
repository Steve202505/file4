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
import './Login.css';

const Login = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const loginSchema = yup.object().shape({
    emailOrUsername: yup
      .string()
      .required(t('username_required')),
    password: yup
      .string()
      .required(t('password_required'))
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await authService.login({
        emailOrUsername: data.emailOrUsername,
        password: data.password
      });

      if (response.data.success) {
        const { token, user } = response.data;
        setAuthData(token, user);
        toast.success(t('login_success'));
        reset();
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message ? t(error.response.data.message) : t('login_failed', 'Login failed. Please try again.');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="majestic-page-wrapper d-flex align-items-center justify-content-center p-4">
      <div className="language-switcher-wrapper" style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 1000 }}>
        <UserLanguageSwitcher />
      </div>

      <div className="majestic-card w-100 animate-slide-up my-4" style={{ maxWidth: '420px' }}>
        <div className="text-center mb-5">
          <div className="p-4 rounded-circle d-inline-block mb-4 shadow-lg animate-fade-in" style={{ border: '1px solid rgba(252, 213, 53, 0.2)', animationDelay: '0.2s', background: 'rgba(252, 213, 53, 0.1)' }}>
            <img src="/assets/images/logo.png" alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
          </div>
          <h2 className="majestic-text-shimmer fw-bold mb-2 tracking-tight">{t('welcome_back_title', 'Login to Goldxgo')}</h2>
          <p className="text-secondary small opacity-75">{t('welcome_back_desc', 'Start your trading journey')}</p>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="majestic-form-group">
            <div className="majestic-label-row">
              <div className="majestic-label-dot"></div>
              <label className="majestic-label-text">{t('username')}</label>
            </div>
            <div className={`majestic-input-wrapper ${errors.emailOrUsername ? 'border-danger' : ''}`}>
              <i className="bi bi-person-circle majestic-input-icon"></i>
              <Form.Control
                type="text"
                placeholder={t('enter_username')}
                {...register('emailOrUsername')}
                className="majestic-input-field"
              />
            </div>
            {errors.emailOrUsername && (
              <div className="text-danger extra-small mt-2 ps-1 animate-fade-in">{errors.emailOrUsername.message}</div>
            )}
          </div>

          <div className="majestic-form-group">
            <div className="majestic-label-row">
              <div className="majestic-label-dot"></div>
              <label className="majestic-label-text">{t('password')}</label>
            </div>
            <div className={`majestic-input-wrapper ${errors.password ? 'border-danger' : ''}`}>
              <i className="bi bi-shield-lock-fill majestic-input-icon"></i>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder={t('password')}
                {...register('password')}
                className="majestic-input-field"
              />
              <button
                type="button"
                className="btn btn-link text-secondary p-2 shadow-none transition-all"
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderRadius: '100%' }}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
              </button>
            </div>
            {errors.password && (
              <div className="text-danger extra-small mt-2 ps-1 animate-fade-in">{errors.password.message}</div>
            )}
          </div>

          <Button
            className="majestic-btn-primary w-100 py-3 fw-bold mt-2"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="d-flex align-items-center justify-content-center">
                <span className="spinner-border spinner-border-sm me-3" role="status" aria-hidden="true"></span>
                {t('loading')}...
              </div>
            ) : t('login')}
          </Button>

          <div className="text-center mt-5">
            <p className="text-secondary small">
              {t('no_account_yet', 'Don\'t have an account?')} {' '}
              <span className="text-warning fw-bold cursor-pointer hover-opacity-100 transition-all ms-1" onClick={() => navigate('/signup')}>
                {t('signup')}
              </span>
            </p>
          </div>
        </Form>
      </div>

      <style jsx>{`
        .tracking-tight { letter-spacing: -0.5px; }
        .hover-opacity-100:hover { opacity: 1 !important; }
      `}</style>
    </div>
  );
};

export default Login;