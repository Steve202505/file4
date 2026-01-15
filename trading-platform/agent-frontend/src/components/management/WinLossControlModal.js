import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { agentService } from '../../services/agentService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const WinLossControlModal = ({ show, onHide, user, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      controlLevel: 'none',
      isActive: true,
      notes: ''
    }
  });

  const controlLevel = watch('controlLevel');

  useEffect(() => {
    if (user) {
      // Fetch existing win/loss control
      const fetchControl = async () => {
        try {
          const response = await agentService.getUser(user.id);
          if (response.success && response.user.winLossControl) {
            const control = response.user.winLossControl;
            setValue('controlLevel', control.controlLevel);
            setValue('isActive', control.isActive);
            setValue('notes', control.notes || '');
          } else {
            reset({
              controlLevel: 'none',
              isActive: true,
              notes: ''
            });
          }
        } catch (error) {
          console.error('Failed to fetch control:', error);
        }
      };

      fetchControl();
    }
  }, [user, reset, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const response = await agentService.updateWinLossControl(user.id, data);

      if (response.success) {
        toast.success(t('win_loss_updated_success'));
        onSuccess();
        onHide();
      }
    } catch (error) {
      const errorMsg = error.message || t('error_update_win_loss');
      setError(errorMsg);
      toast.error(errorMsg);
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
    <Modal show={show} onHide={handleClose} centered contentClassName="majestic-card border-0">
      <Modal.Header closeButton className="border-bottom border-secondary border-opacity-10 py-3">
        <Modal.Title className="text-white fw-bold">
          <i className="bi bi-controller text-gold me-2"></i> {t('win_loss_strategy')}: {user?.username}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {error && (
          <Alert variant="danger" className="glass-effect border-danger border-opacity-25 text-danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}

        <div className="mb-4 p-3 rounded-3 glass-effect border border-secondary border-opacity-10">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-secondary small text-uppercase fw-bold">{t('active_config')}</span>
            <Badge bg={controlLevel === 'none' ? 'secondary' : 'gold'} className={`px-3 py-2 rounded-pill ${controlLevel === 'none' ? '' : 'text-dark'}`} style={controlLevel !== 'none' ? { background: 'linear-gradient(45deg, #D4AF37, #F4C430)' } : {}}>
              {controlLevel.toUpperCase()}
            </Badge>
          </div>
          <p className="text-white small mb-0 opacity-75">
            {controlLevel === 'high' && t('force_win_high')}
            {controlLevel === 'medium' && t('force_win_medium')}
            {controlLevel === 'low' && t('force_win_low')}
            {controlLevel === 'none' && t('force_win_none')}
          </p>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label className="text-secondary small fw-bold text-uppercase">{t('market_prob_level')}</Form.Label>
            <Form.Select {...register('controlLevel')} className="bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white py-2">
              <option value="none" className="bg-dark">{t('normal_market')}</option>
              <option value="low" className="bg-dark">{t('house_advantage')}</option>
              <option value="medium" className="bg-dark">{t('user_advantage')}</option>
              <option value="high" className="bg-dark">{t('max_win')}</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4">
            <div className="d-flex align-items-center justify-content-between glass-effect p-3 rounded-3 border border-secondary border-opacity-10">
              <div>
                <div className="text-white small fw-bold">{t('execution_engine')}</div>
                <div className="text-secondary smaller">{t('execution_engine_desc')}</div>
              </div>
              <Form.Check
                type="switch"
                id="isActive"
                className="premium-switch"
                {...register('isActive')}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="text-secondary small fw-bold text-uppercase">{t('strategic_notes')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={t('strategic_notes_placeholder')}
              {...register('notes')}
              className="bg-dark bg-opacity-50 border-secondary border-opacity-25 text-white placeholder-secondary"
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-secondary" className="px-4 rounded-pill border-opacity-25 text-white" onClick={handleClose}>
              {t('cancel').toUpperCase()}
            </Button>
            <Button variant="gold" type="submit" disabled={loading} className="px-5 rounded-pill fw-bold">
              {loading ? t('applying') : t('confirm_strategy')}
            </Button>
          </div>
        </Form>
      </Modal.Body>

    </Modal>
  );
};

export default WinLossControlModal;