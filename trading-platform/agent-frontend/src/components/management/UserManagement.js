import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Form,
  Row,
  Col,
  Pagination
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { agentService } from '../../services/agentService';
import UserEditModal from './UserEditModal';
import toast from 'react-hot-toast';

import { useTranslation } from 'react-i18next';

const UserManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userCategory, setUserCategory] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [filters, setFilters] = useState({
    userId: '',
    mobileNumber: '',
    startTime: '',
    endTime: ''
  });

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await agentService.getUsers({
        page,
        limit: 10,
        ...filters,
        status: userCategory
      });
      if (response.success) {
        setUsers(response.users);
        setTotalPages(response.pagination.pages);
        setCurrentPage(response.pagination.page);
      }
    } catch (error) {
      toast.error(t('error_fetch_users'));
    } finally {
      setLoading(false);
    }
  }, [filters, userCategory, t]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      mobileNumber: '',
      startTime: '',
      endTime: ''
    });
    setUserCategory('all');
  };

  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  const openDetails = (user) => {
    navigate(`/user-details/${user.id}`);
  };

  return (
    <div className="majestic-page-wrapper">

      {/* Top Action Bar */}
      <div className="d-flex justify-content-between mb-3">
        <Button
          variant="primary"
          size="sm"
          className="px-4 d-flex align-items-center gap-2"
          onClick={() => {
            setSelectedUser(null);
            setShowEditModal(true);
          }}
        >
          <i className="bi bi-person-plus"></i>
          {t('new')}
        </Button>
      </div>

      {/* Filter Section */}
      <div className="majestic-card filter-bar mb-3">
        <div className="d-flex align-items-center mb-3 w-100">
          <span className="text-secondary small me-3 fw-bold" style={{ whiteSpace: 'nowrap' }}>{t('user_categories')}</span>
          <div className="btn-group">
            <Button
              variant={userCategory === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setUserCategory('all')}
            >{t('cat_all')}</Button>
            <Button
              variant={userCategory === 'acting' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setUserCategory('acting')}
            >{t('cat_acting')}</Button>
          </div>
        </div>

        <Row className="g-3 align-items-center w-100">
          <Col xs={12} md="auto">
            <div className="d-flex align-items-center">
              <span className="form-label mb-0 text-secondary small me-2" style={{ minWidth: '80px' }}>{t('user_id')}</span>
              <Form.Control
                type="text"
                name="userId"
                placeholder={t('user_id')}
                value={filters.userId}
                onChange={handleFilterChange}
                className="w-100"
                style={{ minWidth: '150px' }}
              />
            </div>
          </Col>
          <Col xs={12} md="auto">
            <div className="d-flex align-items-center">
              <span className="form-label mb-0 text-secondary small me-2" style={{ minWidth: '80px' }}>{t('mobile_number')}</span>
              <Form.Control
                type="text"
                name="mobileNumber"
                placeholder=""
                value={filters.mobileNumber}
                onChange={handleFilterChange}
                className="w-100"
                style={{ minWidth: '150px' }}
              />
            </div>
          </Col>
          <Col xs={12} md="auto" className="ms-auto text-end">
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="primary" size="sm" className="px-3" onClick={() => fetchUsers(1)}>{t('query')}</Button>
              <Button variant="secondary" size="sm" className="px-3" onClick={clearFilters}>{t('reset')}</Button>
              <Button variant="secondary" size="sm" className="px-3">{t('export')}</Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Data Table */}
      <div className="majestic-card p-0 majestic-table-container">
        <Table hover className="border-0 mb-0">
          <thead>
            <tr>
              <th>{t('user_id')}</th>
              <th>{t('username')}</th>
              <th>{t('user_nickname')}</th>
              <th>{t('invitation_code')}</th>
              <th>{t('inviter_superior')}</th>
              <th>{t('credit_score')}</th>
              <th>{t('win_loss_control')}</th>
              <th>{t('balance')}</th>
              <th>{t('frozen_balance')}</th>
              <th>{t('commission_balance')}</th>
              <th>{t('registration_time')}</th>
              <th className="text-end">{t('operate')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="12" className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t('loading')}</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-5 text-secondary">
                  {t('no_data')}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id.slice(-8).toUpperCase()}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{user.username}</td>
                  <td>{user.email.split('@')[0]}</td>
                  <td>{user.referCode || 'N/A'}</td>
                  <td>{user.assignedAgent?.username || 'None'}</td>
                  <td>{user.creditScore ?? 0}</td>
                  <td>
                    {(!user.winLossControl || !user.winLossControl.isActive) ? t('cat_all') :
                      user.winLossControl.controlLevel.toUpperCase()}
                  </td>
                  <td className="text-blue fw-bold">{user.accountBalance?.toFixed(2)}</td>
                  <td>0.00</td>
                  <td>0.00</td>
                  <td>{new Date(user.createdAt).toLocaleString()}</td>
                  <td className="text-end">
                    <span
                      className="fw-bold"
                      style={{ cursor: 'pointer', color: 'var(--primary-blue)' }}
                      onClick={() => openDetails(user)}
                    >{t('details')}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-end mt-3">
        <Pagination size="sm">
          <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => handlePageChange(i + 1)}>
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>

      {/* Keep Modals for functionality */}
      <UserEditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        user={selectedUser}
        onSuccess={() => fetchUsers(currentPage)}
      />
    </div>
  );
};

export default UserManagement;