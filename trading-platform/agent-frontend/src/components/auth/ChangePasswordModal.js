import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { agentAuthService } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';



const ChangePasswordModal = ({ show, onHide }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const schema = yup.object().shape({
        currentPassword: yup.string().required(t('msg_password_required')),
        newPassword: yup.string().min(6, t('msg_password_min')).required(t('msg_password_required')),
        confirmPassword: yup.string().oneOf([yup.ref('newPassword'), null], t('msg_password_match')).required(t('confirm_new_password_placeholder'))
    });

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const response = await agentAuthService.changePassword(data);
            if (response.success) {
                toast.success(t('msg_password_change_success'));
                reset();
                onHide();
            }
        } catch (err) {
            setError(err.response?.data?.message || t('error_password_change'));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        reset();
        setError('');
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered contentClassName="bg-dark text-white border-secondary">
            <Modal.Header closeButton closeVariant="white" className="border-secondary">
                <Modal.Title>{t('change_password')}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('current_password')}</Form.Label>
                        <Form.Control
                            type="password"
                            {...register('currentPassword')}
                            isInvalid={!!errors.currentPassword}
                            className="bg-darker text-white border-secondary"
                            placeholder={t('enter_current_password')}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.currentPassword?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>{t('new_password')}</Form.Label>
                        <Form.Control
                            type="password"
                            {...register('newPassword')}
                            isInvalid={!!errors.newPassword}
                            className="bg-darker text-white border-secondary"
                            placeholder={t('enter_new_password')}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.newPassword?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>{t('confirm_new_password')}</Form.Label>
                        <Form.Control
                            type="password"
                            {...register('confirmPassword')}
                            isInvalid={!!errors.confirmPassword}
                            className="bg-darker text-white border-secondary"
                            placeholder={t('confirm_new_password_placeholder')}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={handleClose}>
                            {t('cancel')}
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? t('processing') : t('confirm')}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ChangePasswordModal;
