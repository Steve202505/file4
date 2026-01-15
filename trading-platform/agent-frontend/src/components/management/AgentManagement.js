import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Badge, Modal } from 'react-bootstrap';
import { adminService } from '../../services/adminService';
import CreateAgentModal from './CreateAgentModal';
import EditAgentModal from './EditAgentModal';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const AgentManagement = () => {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const response = await adminService.getAgents();
      if (response.success) {
        const filteredAgents = response.agents.filter(agent => agent.role !== 'admin' && agent.username !== 'superadmin');
        setAgents(filteredAgents);
      }
    } catch (error) {
      toast.error(t('error_fetch_agents'));
    }
  }, [t]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleEdit = (agent) => {
    setSelectedAgent(agent);
    setShowEditModal(true);
  };

  const handleDelete = (agent) => {
    setSelectedAgent(agent);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await adminService.deleteAgent(selectedAgent.id);
      toast.success(t('agent_deleted_success') || 'Agent deleted successfully');
      fetchAgents();
      setShowDeleteModal(false);
      setSelectedAgent(null);
    } catch (error) {
      toast.error(t('error_agent_delete') || 'Failed to delete agent');
    }
  };

  return (
    <div className="majestic-page-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="primary" size="sm" className="px-3" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-person-plus-fill me-2"></i>
          {t('create_new_agent')}
        </Button>
      </div>

      <div className="majestic-card p-0 majestic-table-container shadow-sm">
        <Table hover className="border-0 mb-0 text-nowrap">
          <thead>
            <tr>
              <th>{t('agent_id')}</th>
              <th>{t('refer_code')}</th>
              <th>{t('agent_name')}</th>
              <th className="d-none d-md-table-cell">{t('creation_time')}</th>
              <th>{t('status')}</th>
              <th className="text-end">{t('operate')}</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id}>
                <td style={{ color: 'var(--text-primary)' }}>{agent.id.slice(-6).toUpperCase()}</td>
                <td className="fw-bold text-primary">{agent.referCode || 'N/A'}</td>
                <td style={{ color: 'var(--text-primary)' }}>{agent.username}</td>
                <td className="d-none d-md-table-cell small text-secondary">{new Date(agent.createdAt).toLocaleString()}</td>
                <td>
                  <Badge bg={agent.isActive ? 'success' : 'secondary'} className="rounded-1 fw-normal">
                    {agent.isActive ? t('active') : t('inactive')}
                  </Badge>
                </td>
                <td className="text-end">
                  <Button variant="link" className="text-blue p-0 me-3 text-decoration-none fw-bold small" onClick={() => handleEdit(agent)}>{t('edit')}</Button>
                  <Button variant="link" className="text-danger p-0 text-decoration-none fw-bold small" onClick={() => handleDelete(agent)}>{t('delete')}</Button>
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr><td colSpan="6" className="text-center text-secondary py-5">{t('no_data')}</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      <CreateAgentModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={fetchAgents}
      />

      {selectedAgent && (
        <EditAgentModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          agent={selectedAgent}
          onSuccess={fetchAgents}
        />
      )}

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        data-bs-theme={settings.darkMode ? 'dark' : 'light'}
      >
        <div style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-regular)', borderRadius: '8px', overflow: 'hidden' }}>
          <Modal.Header closeButton className="border-bottom border-light">
            <Modal.Title className="fs-6 fw-bold text-danger">{t('confirm')} {t('delete')}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {t('agent_delete_confirm', { username: selectedAgent?.username })}
          </Modal.Body>
          <Modal.Footer className="border-top border-light">
            <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)} className="px-3">{t('cancel')}</Button>
            <Button variant="danger" size="sm" onClick={confirmDelete} className="px-4">{t('delete')}</Button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  );
};

export default AgentManagement;