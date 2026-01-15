import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const CreateAgentModal = ({ show, onHide, onSuccess }) => {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createAgentSchema = yup.object().shape({
    username: yup.string().min(3, t('msg_username_min')).required(t('msg_username_required')),
    password: yup.string().min(6, t('msg_password_min')).required(t('msg_password_required')),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], t('msg_password_match')).required(t('confirm_password_placeholder'))
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(createAgentSchema),
    defaultValues: { username: '', password: '', confirmPassword: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.createAgent({
        username: data.username,
        password: data.password
      });
      if (response.success) {
        toast.success(t('agent_created_success'));
        reset();
        onSuccess();
        onHide();
      }
    } catch (error) {
      setError(error.message || t('error_create_agent'));
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
          <Modal.Title className="fs-6 fw-bold text-white">{t('create_new_agent')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label className="small text-secondary">{t('username_agent_name')}</Form.Label>
              <Form.Control
                type="text"
                {...register('username')}
                isInvalid={!!errors.username}
                placeholder={t('agent_name_placeholder')}
                className="bg-input border-color text-primary-text"
              />
              <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small text-secondary">{t('password')}</Form.Label>
              <Form.Control
                type="password"
                {...register('password')}
                isInvalid={!!errors.password}
                placeholder={t('password_placeholder')}
                className="bg-input border-color text-primary-text"
              />
              <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small text-secondary">{t('confirm_password')}</Form.Label>
              <Form.Control
                type="password"
                {...register('confirmPassword')}
                isInvalid={!!errors.confirmPassword}
                placeholder={t('confirm_password_placeholder')}
                className="bg-input border-color text-primary-text"
              />
              <Form.Control.Feedback type="invalid">{errors.confirmPassword?.message}</Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-light">
              <Button variant="secondary" size="sm" onClick={onHide} className="px-4">
                {t('cancel')}
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={loading} className="px-5">
                {loading ? t('creating') : t('confirm')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </div>
    </Modal>
  );
};
export default CreateAgentModal;