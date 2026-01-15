import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const EditAgentModal = ({ show, onHide, agent, onSuccess }) => {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const editAgentSchema = yup.object().shape({
    username: yup.string().min(3).required(t('msg_username_required')),
    password: yup.string().nullable().transform(v => v === '' ? null : v).min(6, t('msg_password_min')),
    isActive: yup.boolean()
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: yupResolver(editAgentSchema),
    defaultValues: { username: '', password: '', isActive: true }
  });

  const isActive = watch('isActive');

  useEffect(() => {
    if (agent) {
      setValue('username', agent.username);
      setValue('isActive', agent.isActive);
      setValue('password', '');
    }
  }, [agent, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const updateData = { username: data.username, isActive: data.isActive };
      if (data.password) updateData.password = data.password;

      const response = await adminService.updateAgent(agent.id, updateData);
      if (response.success) {
        toast.success(t('agent_updated_success') || 'Agent updated successfully');
        reset();
        onSuccess();
        onHide();
      }
    } catch (error) {
      setError(error.message || t('error_update_agent'));
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
          <Modal.Title className="fs-6 fw-bold text-white">{t('edit_agent')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label className="small text-secondary">{t('agent_name')}</Form.Label>
              <Form.Control
                type="text"
                {...register('username')}
                isInvalid={!!errors.username}
                className="bg-input border-color text-secondary"
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small text-secondary">{t('reset_password')}</Form.Label>
              <Form.Control
                type="password"
                {...register('password')}
                isInvalid={!!errors.password}
                placeholder={t('leave_blank_keep')}
                className="bg-input border-color text-primary-text"
              />
              <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check
                type="switch"
                id="isActive"
                label={isActive ? t('status_normal') : t('status_disabled')}
                {...register('isActive')}
                className="small"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-light">
              <Button variant="secondary" size="sm" onClick={onHide} className="px-4">
                {t('cancel')}
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={loading} className="px-5">
                {loading ? t('saving') : t('confirm')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </div>
    </Modal>
  );
};
export default EditAgentModal;