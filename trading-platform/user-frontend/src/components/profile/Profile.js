import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Badge,
  Tab,
  Tabs,
  Table,
  Modal
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../../../services/auth';
import { userService } from '../../../services/userService';
import LoadingSpinner from '../common/LoadingSpinner';

import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const profileSchema = yup.object().shape({
    email: yup
      .string()
      .email(t('email_invalid'))
      .required(t('email_required')),
    mobileNumber: yup
      .string()
      .matches(/^[0-9]{10,15}$/, t('mobile_invalid'))
      .required(t('mobile_required'))
  });

  const passwordSchema = yup.object().shape({
    currentPassword: yup.string().required(t('password_required')),
    newPassword: yup
      .string()
      .min(6, t('password_min'))
      .required(t('password_required')),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword'), null], t('password_match'))
      .required(t('confirm_password'))
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm({
    resolver: yupResolver(profileSchema)
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  useEffect(() => {
    fetchUserData();
    fetchTransactions();
    fetchTradingHistory();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        resetProfile({
          email: currentUser.email || '',
          mobileNumber: currentUser.mobileNumber || ''
        });
      }
    } catch (error) {
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await userService.getTransactions();
      if (response.success) {
        setTransactions(response.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchTradingHistory = async () => {
    try {
      const response = await userService.getTradingHistory();
      if (response.success) {
        setTrades(response.trades);
      }
    } catch (error) {
      console.error('Failed to fetch trading history:', error);
    }
  };

  const handleProfileUpdate = async (data) => {
    try {
      setUpdating(true);
      // Note: In this system, user profile updates go through agent API
      toast.error('Profile updates require agent approval. Please contact support.');
      // Reset to original values
      resetProfile({
        email: user.email,
        mobileNumber: user.mobileNumber
      });
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (data) => {
    try {
      setChangingPassword(true);
      const response = await userService.updatePassword(data);
      if (response.success) {
        toast.success('Password updated successfully!');
        setShowPasswordModal(false);
        resetPassword();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <LoadingSpinner centered fullScreen message={t('loading')} />;
  }

  if (!user) {
    return (
      <Alert variant="warning">
        {t('user_data_unavailable')}
      </Alert>
    );
  }

  return (
    <div className="dashboard-container">
      <h2 className="mb-4">{t('my_profile')}</h2>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        fill
      >
        <Tab eventKey="profile" title={t('profile_settings')}>
          <Row>
            <Col md={4}>
              <Card className="mb-4">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      fontSize: '48px',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <h4>{user.username}</h4>
                  <p className="text-muted">{user.email}</p>
                  <Badge bg="info" className="px-3 py-2">
                    {user.role || 'User'}
                  </Badge>

                  <div className="mt-4">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      {t('change_password')}
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header>
                  <Card.Title>{t('account_summary')}</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>{t('account_id')}:</strong>
                    <div className="text-muted font-monospace">
                      {user.id?.slice(-8) || 'N/A'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>{t('current_balance')}:</strong>
                    <div className="h4 text-success">
                      ${user.accountBalance?.toLocaleString() || '0.00'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>{t('referral_code')}:</strong>
                    <div className="font-monospace text-primary">
                      {user.referCode || 'N/A'}
                    </div>
                    <small className="text-muted">
                      {t('referral_share_tip')}
                    </small>
                  </div>
                  <div className="mb-3">
                    <strong>{t('account_status')}:</strong>
                    <div>
                      <Badge bg="success">{t('active')}</Badge>
                    </div>
                  </div>
                  <div>
                    <strong>{t('member_since')}:</strong>
                    <div className="text-muted">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={8}>
              <Card>
                <Card.Header>
                  <Card.Title>{t('edit_profile_info')}</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info" className="mb-4">
                    {t('profile_update_note')}
                  </Alert>

                  <Form onSubmit={handleSubmitProfile(handleProfileUpdate)}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('username')}</Form.Label>
                      <Form.Control
                        type="text"
                        value={user.username}
                        disabled
                      />
                      <Form.Text className="text-muted">
                        {t('username_no_change')}
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>{t('email_address')}</Form.Label>
                      <Form.Control
                        type="email"
                        disabled={updating}
                        isInvalid={!!profileErrors.email}
                        {...registerProfile('email')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {profileErrors.email?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>{t('mobile_number')}</Form.Label>
                      <Form.Control
                        type="tel"
                        disabled={updating}
                        isInvalid={!!profileErrors.mobileNumber}
                        {...registerProfile('mobileNumber')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {profileErrors.mobileNumber?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={updating}
                      >
                        {updating ? t('updating') : t('update_profile')}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              <Card className="mt-4">
                <Card.Header>
                  <Card.Title>{t('security_settings')}</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>{t('last_login')}:</strong>
                    <div className="text-muted">
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>{t('account_security')}:</strong>
                    <div>
                      <Badge bg="success" className="me-2">{t('email_verified')}</Badge>
                      <Badge bg="warning">{t('2fa_disabled')}</Badge>
                    </div>
                  </div>
                  <div>
                    <strong>{t('security_tips')}:</strong>
                    <ul className="text-muted mt-2">
                      <li>{t('tip_2fa')}</li>
                      <li>{t('tip_password')}</li>
                      <li>{t('tip_share')}</li>
                      <li>{t('tip_public')}</li>
                    </ul>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="transactions" title={t('transaction_history')}>
          <Card>
            <Card.Header>
              <Card.Title>{t('recent_transactions')}</Card.Title>
            </Card.Header>
            <Card.Body>
              {transactions.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>{t('date')}</th>
                      <th>{t('type')}</th>
                      <th>{t('amount')}</th>
                      <th>{t('status')}</th>
                      <th>{t('reference')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{new Date(tx.date).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={
                            tx.type === 'deposit' ? 'success' :
                              tx.type === 'withdrawal' ? 'danger' : 'info'
                          }>
                            {tx.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td className={tx.amount >= 0 ? 'text-success' : 'text-danger'}>
                          ${Math.abs(tx.amount).toLocaleString()}
                        </td>
                        <td>
                          <Badge bg={
                            tx.status === 'completed' ? 'success' :
                              tx.status === 'pending' ? 'warning' : 'secondary'
                          }>
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="font-monospace">{tx.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">{t('no_transactions')}</p>
                  <Button variant="outline-primary" size="sm">
                    View All Transactions
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="trades" title={t('trade_history')}>
          <Card>
            <Card.Header>
              <Card.Title>{t('recent_trades')}</Card.Title>
            </Card.Header>
            <Card.Body>
              {trades.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>{t('time')}</th>
                      <th>{t('market')}</th>
                      <th>{t('type')}</th>
                      <th>{t('amount')}</th>
                      <th>{t('price')}</th>
                      <th>{t('pnl')}</th>
                      <th>{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id}>
                        <td>{new Date(trade.timestamp).toLocaleTimeString()}</td>
                        <td><strong>{trade.market}</strong></td>
                        <td>
                          <Badge bg={trade.type === 'buy' ? 'success' : 'danger'}>
                            {t(trade.type)}
                          </Badge>
                        </td>
                        <td>{trade.amount}</td>
                        <td>${trade.price.toLocaleString()}</td>
                        <td className={trade.pnl >= 0 ? 'text-success' : 'text-danger'}>
                          ${trade.pnl.toLocaleString()}
                        </td>
                        <td>
                          <Badge bg="success">{t('completed')}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">{t('no_trading_history')}</p>
                  <Button variant="outline-primary" size="sm">
                    {t('start_trading')}
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('change_password')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitPassword(handlePasswordChange)}>
          <Modal.Body>
            <Alert variant="warning" className="mb-3">
              {t('password_change_warning')}
            </Alert>

            <Form.Group className="mb-3">
              <Form.Label>{t('current_password')}</Form.Label>
              <Form.Control
                type="password"
                placeholder={t('enter_current_password', 'Enter current password')}
                disabled={changingPassword}
                isInvalid={!!passwordErrors.currentPassword}
                {...registerPassword('currentPassword')}
              />
              <Form.Control.Feedback type="invalid">
                {passwordErrors.currentPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('new_password')}</Form.Label>
              <Form.Control
                type="password"
                placeholder={t('enter_new_password', 'Enter new password')}
                disabled={changingPassword}
                isInvalid={!!passwordErrors.newPassword}
                {...registerPassword('newPassword')}
              />
              <Form.Control.Feedback type="invalid">
                {passwordErrors.newPassword?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {t('password_min_hint')}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('confirm_new_password')}</Form.Label>
              <Form.Control
                type="password"
                placeholder={t('confirm_new_password_placeholder', 'Confirm new password')}
                disabled={changingPassword}
                isInvalid={!!passwordErrors.confirmPassword}
                {...registerPassword('confirmPassword')}
              />
              <Form.Control.Feedback type="invalid">
                {passwordErrors.confirmPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
              disabled={changingPassword}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={changingPassword}
            >
              {changingPassword ? t('processing') : t('change_password')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;