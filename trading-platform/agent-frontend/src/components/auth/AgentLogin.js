import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { agentAuthService } from '../../services/api';
import { setAgentAuthData } from '../../services/auth';
import { useTranslation } from 'react-i18next';
import AgentLanguageSwitcher from '../common/AgentLanguageSwitcher';
import '../../pages/MajesticCommon.css';
import './AgentLogin.css';

const AgentLogin = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const loginSchema = yup.object().shape({
    username: yup.string().required(t('msg_username_required')),
    password: yup.string().required(t('msg_password_required'))
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
      const response = await agentAuthService.login({
        username: data.username,
        password: data.password
      });

      if (response.data.success) {
        const { token, agent } = response.data;
        setAgentAuthData(token, agent);
        toast.success(t('msg_login_success', 'Login successful!'));
        reset();
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message ? t(error.response.data.message) : t('error_login_failed', 'Login failed. Please try again.');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="majestic-page-wrapper d-flex align-items-center justify-content-center p-4">
      <div className="language-switcher-wrapper" style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 1000 }}>
        <AgentLanguageSwitcher />
      </div>

      <div className="majestic-card w-100 animate-slide-up" style={{ maxWidth: '420px' }}>
        <div className="text-center mb-5">
          <div className="bg-warning bg-opacity-10 p-4 rounded-circle d-inline-block mb-4 shadow-lg animate-fade-in" style={{ border: '1px solid rgba(252, 213, 53, 0.2)', animationDelay: '0.2s' }}>
            <img src="/assets/images/logo.png" alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
          </div>
          <h2 className="majestic-text-shimmer fw-bold mb-2 tracking-tight">{t('agent_login', 'Login to Goldxgo')}</h2>
          <p className="text-secondary small opacity-75">{t('agent_portal_title', 'Agent/Admin Management Portal')}</p>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="majestic-form-group">
            <div className="majestic-label-row">
              <div className="majestic-label-dot"></div>
              <label className="majestic-label-text">{t('username')}</label>
            </div>
            <div className={`majestic-input-wrapper ${errors.username ? 'border-danger' : ''}`}>
              <i className="bi bi-person-badge-fill majestic-input-icon"></i>
              <Form.Control
                type="text"
                placeholder={t('enter_username')}
                {...register('username')}
                className="majestic-input-field"
                spellCheck="false"
                autoComplete="username"
              />
            </div>
            {errors.username && (
              <div className="text-danger extra-small mt-2 ps-1 animate-fade-in">{errors.username.message}</div>
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
                spellCheck="false"
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
            className="majestic-btn-primary w-100 py-3 fw-bold mb-4 mt-2 pulse-effect"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="d-flex align-items-center justify-content-center">
                <span className="spinner-border spinner-border-sm me-3" role="status" aria-hidden="true"></span>
                {t('processing')}...
              </div>
            ) : t('login')}
          </Button>

          <div className="text-center pt-3 border-top border-white border-opacity-10 mt-3">
            <div className="d-inline-flex align-items-center justify-content-center px-3 py-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <i className="bi bi-shield-check text-warning me-2" style={{ fontSize: '14px' }}></i>
              <span className="text-secondary extra-small opacity-75 fw-medium">
                {t('agent_portal_notice', 'This portal is for agents and administrators only')}
              </span>
            </div>
          </div>
        </Form>
      </div>

      <style jsx>{`
        .tracking-tight { letter-spacing: -0.5px; }
        .hover-opacity-100:hover { opacity: 1 !important; }
        .pulse-effect:not(:disabled) { animation: pulse-glow 3s infinite; }
      `}</style>
    </div>

  );
};

export default AgentLogin;