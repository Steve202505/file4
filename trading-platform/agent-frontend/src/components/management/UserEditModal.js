import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { agentService } from '../../services/agentService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const UserEditModal = ({ show, onHide, user, onSuccess }) => {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      mobileNumber: '',
      resetPassword: '',
      transactionPassword: '',
      walletAddress: '',
      creditScore: 0,
      vipLevel: 0,
      isSimulated: false,
      controlLevel: 'none',
      isActive: true
    }
  });

  useEffect(() => {
    if (user) {
      setValue('username', user.username);
      setValue('email', user.email || '');
      setValue('mobileNumber', user.mobileNumber || '');
      setValue('walletAddress', user.walletAddress || '');
      setValue('creditScore', user.creditScore ?? 0);
      setValue('vipLevel', user.vipLevel ?? 0);
      setValue('isSimulated', user.isSimulated ?? false);
      setValue('controlLevel', user.winLossControl?.controlLevel || 'none');
      setValue('isActive', user.isActive ?? true);
      setValue('resetPassword', '');
      setValue('transactionPassword', '');
    } else {
      reset({
        username: '',
        resetPassword: '',
        transactionPassword: '',
        walletAddress: '',
        creditScore: 0,
        vipLevel: 0,
        isSimulated: false,
        controlLevel: 'none',
        isActive: true
      });
    }
  }, [user, setValue, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setFormError('');

    // Strict Credit Score Validation
    if (data.creditScore < 0 || data.creditScore > 100) {
      setFormError(t('error_credit_score_range'));
      toast.error(t('error_credit_score_range'));
      setLoading(false);
      return;
    }

    try {
      let response;
      if (user) {
        response = await agentService.updateUser(user.id, data);
      } else {
        // For new user, we need a special "createUser" service call
        // If it doesn't exist, we should check agentService
        response = await agentService.createUser(data);
      }

      if (response.success) {
        toast.success(user ? t('user_updated_success') : t('user_created_success'));
        onSuccess();
        onHide();
      }
    } catch (error) {
      const errorMsg = error.message || (user ? t('error_update_user') : t('error_create_user'));
      setFormError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setFormError('');
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      contentClassName="border-0 shadow-lg"
      data-bs-theme={settings.darkMode ? 'dark' : 'light'}
    >
      <div style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-regular)', borderRadius: '8px', overflow: 'hidden' }}>
        <Modal.Header closeButton className="border-bottom border-light p-3">
          <Modal.Title className="fs-6 fw-bold text-primary">
            {user ? t('adjustment') : t('new_user')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {formError && <div className="alert alert-danger mb-3 py-2 small">{formError}</div>}
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Username */}
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label className="mb-0 small text-secondary" style={{ minWidth: '120px' }}>{t('username')}</Form.Label>
              <Form.Control
                type="text"
                {...register('username', { required: !user })}
                readOnly={!!user}
                placeholder={t('enter_username')}
                className={`bg-input border-color ${user ? 'text-secondary' : 'text-primary'}`}
                style={{ fontSize: '13px' }}
              />
            </Form.Group>

            {/* Email */}
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label className="mb-0 small text-secondary" style={{ minWidth: '120px' }}>{t('email')}</Form.Label>
              <Form.Control
                type="email"
                {...register('email', {
                  required: !user,
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('invalid_email_address') || "Invalid email address"
                  }
                })}
                placeholder={t('enter_email')}
                className={`bg-input border-color text-primary-text ${errors.email ? 'is-invalid' : ''}`}
                style={{ fontSize: '13px' }}
              />
            </Form.Group>

            {/* Mobile Number */}
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label className="mb-0 small text-secondary" style={{ minWidth: '120px' }}>{t('mobile_number')}</Form.Label>
              <Form.Control
                type="text"
                {...register('mobileNumber', {
                  pattern: {
                    value: /^[0-9+\-\s]{8,20}$/,
                    message: t('invalid_mobile_number') || "Invalid mobile number"
                  }
                })}
                placeholder={t('enter_mobile_number')}
                className={`bg-input border-color text-primary-text ${errors.mobileNumber ? 'is-invalid' : ''}`}
                style={{ fontSize: '13px' }}
              />
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label className="mb-0 small text-secondary" style={{ minWidth: '120px' }}>{t('user_password')}</Form.Label>
              <Form.Control
                type="password"
                placeholder={t('enter_user_password')}
                {...register('resetPassword')}
                className="bg-input border-color text-primary-text"
                style={{ fontSize: '13px' }}
              />
            </Form.Group>

            {/* Transaction Password */}
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label className="mb-0 small text-secondary" style={{ minWidth: '120px' }}>{t('user_transaction')}</Form.Label>
              <Form.Control
                type="password"
                placeholder={t('enter_transaction_password')}
                {...register('transactionPassword')}
                className="bg-input border-color text-primary-text"
                style={{ fontSize: '13px' }}
              />
            </Form.Group>

            {/* Wallet Address */}
            <Form.Group className="mb-3 d-flex align-items-start">
              <Form.Label className="mb-0 small text-secondary mt-1" style={{ minWidth: '120px' }}>{t('wallet_address')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                {...register('walletAddress')}
                className="bg-input border-color text-primary-text"
                style={{ fontSize: '13px' }}
              />
            </Form.Group>

            {/* Credit Score */}
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label className="mb-0 small text-secondary" style={{ minWidth: '120px' }}>{t('credit_score')}</Form.Label>
              <Form.Control
                type="number"
                min={0}
                max={100}
                {...register('creditScore', {
                  required: true,
                  min: { value: 0, message: 'Minimum 0' },
                  max: { value: 100, message: 'Maximum 100' },
                  valueAsNumber: true
                })}
                className="bg-input border-color text-primary-text"
                style={{ fontSize: '13px' }}
              />
            </Form.Group>

            {/* VIP Level */}
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label className="mb-0 small text-secondary" style={{ minWidth: '120px' }}>{t('vip_level')}</Form.Label>
              <Form.Control
                type="number"
                {...register('vipLevel')}
                className="bg-input border-color text-primary-text"
                style={{ fontSize: '13px' }}
              />
            </Form.Group>

            {/* Simulate User */}
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label className="mb-0 small text-secondary" style={{ minWidth: '120px' }}>{t('simulate_user')}</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  label={t('yes')}
                  name="isSimulated"
                  checked={watch('isSimulated') === true}
                  onChange={() => setValue('isSimulated', true)}
                  className="small"
                />
                <Form.Check
                  type="radio"
                  label={t('no')}
                  name="isSimulated"
                  checked={watch('isSimulated') === false}
                  onChange={() => setValue('isSimulated', false)}
                  className="small"
                />
              </div>
            </Form.Group>

            {/* Win/Loss Control */}
            <Form.Group className="mb-3 d-flex align-items-start">
              <Form.Label className="mb-0 small text-secondary mt-1" style={{ minWidth: '120px' }}>
                {t('controlling_wins')}<br />{t('and_losses')}
              </Form.Label>
              <div className="d-flex flex-column gap-2">
                <Form.Check
                  type="radio"
                  label={t('with_the_market')}
                  name="controlLevel"
                  checked={watch('controlLevel') === 'none'}
                  onChange={() => setValue('controlLevel', 'none')}
                  className="small"
                />
                <Form.Check
                  type="radio"
                  label={t('win')}
                  name="controlLevel"
                  checked={watch('controlLevel') === 'high'}
                  onChange={() => setValue('controlLevel', 'high')}
                  className="small"
                />
                <Form.Check
                  type="radio"
                  label={t('deficit')}
                  name="controlLevel"
                  checked={watch('controlLevel') === 'low'}
                  onChange={() => setValue('controlLevel', 'low')}
                  className="small"
                />
              </div>
            </Form.Group>

            {/* State */}
            <Form.Group className="mb-4 d-flex align-items-center">
              <Form.Label className="mb-0 small text-secondary" style={{ minWidth: '120px' }}>{t('state')}</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  label={t('normal')}
                  name="isActive"
                  checked={watch('isActive') === true}
                  onChange={() => setValue('isActive', true)}
                  className="small"
                />
                <Form.Check
                  type="radio"
                  label={t('disable')}
                  name="isActive"
                  checked={watch('isActive') === false}
                  onChange={() => setValue('isActive', false)}
                  className="small"
                />
              </div>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-light">
              <Button variant="secondary" size="sm" onClick={handleClose} className="px-4">
                {t('cancel')}
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={loading} className="px-5">
                {loading ? t('processing') : t('sure')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default UserEditModal;