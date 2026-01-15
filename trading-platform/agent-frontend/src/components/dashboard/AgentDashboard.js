import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { agentService } from '../../services/agentService';
import { useTranslation } from 'react-i18next';

const AgentDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    todayRegistrations: 0,
    totalBalance: 0
  });

  const [timeFilter, setTimeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await agentService.getUsers({ limit: 1 });
        if (response.success) {
          setStats({
            totalUsers: response.pagination?.total || 0,
            activeUsers: Math.floor((response.pagination?.total || 0) * 0.8),
            todayRegistrations: 5,
            totalBalance: 125000.00
          });
        }
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const InfoCard = ({ title, value, color, icon }) => (
    <Card className="majestic-card h-100 border-0">
      <Card.Body className="d-flex align-items-center justify-content-between">
        <div>
          <div className="text-secondary small text-uppercase mb-1">{title}</div>
          <div className="h3 mb-0 fw-bold">{value}</div>
        </div>
        <div className={`rounded-circle d-flex align-items-center justify-content-center`}
          style={{ width: '48px', height: '48px', backgroundColor: `${color}20`, color: color }}>
          <i className={`bi ${icon} fs-4`}></i>
        </div>
      </Card.Body>
    </Card>
  );

  const quickFunctions = [
    { name: t('shortcut_user_list'), icon: 'bi-people', color: 'var(--primary-blue)', path: '/user-management' },
    { name: t('shortcut_stock_orders'), icon: 'bi-graph-up', color: 'var(--warning-orange)', path: '/stock-orders' },
    { name: t('shortcut_withdrawal'), icon: 'bi-wallet2', color: 'var(--danger-red)', path: '/withdrawals' },
    { name: t('shortcut_audit_logs'), icon: 'bi-file-earmark-text', color: 'var(--success-green)', path: '/audit-logs' },
  ];

  return (
    <div className="majestic-page-wrapper p-3">
      {/* 1. Data Analysis Header */}
      <h5 className="mb-4 ps-1 border-start border-4 border-primary" style={{ color: 'var(--text-primary)' }}>{t('workbench')} {t('overview')}</h5>

      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <InfoCard title={t('card_total_users')} value={stats.totalUsers} color="var(--primary-blue)" icon="bi-people-fill" />
        </Col>
        <Col xs={6} md={3}>
          <InfoCard title={t('card_active_users')} value={stats.activeUsers} color="var(--success-green)" icon="bi-person-check-fill" />
        </Col>
        <Col xs={6} md={3}>
          <InfoCard title={t('card_total_balance')} value={`$${stats.totalBalance.toLocaleString()}`} color="var(--warning-orange)" icon="bi-wallet-fill" />
        </Col>
        <Col xs={6} md={3}>
          <InfoCard title={t('card_today_registration')} value={stats.todayRegistrations} color="var(--danger-red)" icon="bi-person-plus-fill" />
        </Col>
      </Row>

      {/* New Time Filter Section */}
      <Card className="majestic-card border-0 mb-4 time-filter-card">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center mb-3">
            <span className="text-secondary me-3 small" style={{ minWidth: '40px' }}>{t('time')}</span>
            <div className="flex-grow-1 border-bottom border-light border-opacity-10"></div>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div className="d-flex align-items-center rounded overflow-hidden me-2 mb-2" style={{ height: '36px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', minWidth: '220px' }}>
              <div className="ps-2 text-secondary">
                <i className="bi bi-clock small"></i>
              </div>
              <Form.Control
                type="text"
                placeholder={t('start_time')}
                className="bg-transparent border-0 small shadow-none text-center"
                style={{ width: '90px', fontSize: '12px', color: 'var(--text-primary)' }}
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <span className="text-secondary">-</span>
              <Form.Control
                type="text"
                placeholder={t('end_time')}
                className="bg-transparent border-0 small shadow-none text-center"
                style={{ width: '90px', fontSize: '12px', color: 'var(--text-primary)' }}
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>

            <div className="d-flex flex-wrap gap-1 mb-2">
              {[
                { id: 'all', label: t('all') },
                { id: 'today', label: t('today') },
                { id: 'yesterday', label: t('yesterday') },
                { id: 'seven', label: t('seven_days') },
                { id: 'month', label: t('that_month') }
              ].map(btn => (
                <Button
                  key={btn.id}
                  size="sm"
                  variant={timeFilter === btn.id ? 'primary' : 'outline-secondary'}
                  className="py-1 px-2 mb-1"
                  style={{
                    fontSize: '11px',
                    backgroundColor: timeFilter === btn.id ? 'var(--primary-blue)' : 'transparent',
                    borderColor: timeFilter === btn.id ? 'var(--primary-blue)' : 'var(--border-color)',
                    color: timeFilter === btn.id ? '#fff' : 'var(--text-regular)',
                    borderRadius: '2px',
                    minWidth: '60px'
                  }}
                  onClick={() => setTimeFilter(btn.id)}
                >
                  {btn.label}
                </Button>
              ))}
            </div>

            <div className="d-flex gap-2 mb-2 ms-auto">
              <Button
                size="sm"
                variant="primary"
                className="px-3 border-0 fw-bold"
                style={{ fontSize: '12px', backgroundColor: 'var(--primary-blue)', borderRadius: '2px', height: '32px' }}
              >
                {t('query')}
              </Button>

              <Button
                size="sm"
                variant="outline-secondary"
                className="px-3"
                style={{ fontSize: '12px', borderColor: 'var(--border-color)', color: 'var(--text-secondary)', borderRadius: '2px', height: '32px' }}
                onClick={() => {
                  setTimeFilter('all');
                  setDateRange({ start: '', end: '' });
                }}
              >
                {t('reset')}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* 2. System Announcements Section */}
      <Card className="majestic-card border-0 mb-4 overflow-hidden">
        <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center pt-3 pb-2 px-3">
          <div className="d-flex align-items-center">
            <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '28px', height: '28px', backgroundColor: 'var(--primary-blue)' }}>
              <i className="bi bi-megaphone-fill text-white small"></i>
            </div>
            <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>{t('announcement_title')}</span>
          </div>
          <Button variant="link" className="text-secondary p-0 text-decoration-none small hover-primary" style={{ fontSize: '12px' }}>
            {t('view_more')} <i className="bi bi-chevron-right ms-1"></i>
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {[
            { id: 1, type: 'maintenance', title: t('maint_announcement'), date: '2024-10-12', color: 'var(--warning-orange)' },
            { id: 2, type: 'update', title: t('update_announcement'), date: '2024-10-10', color: 'var(--success-green)' },
            { id: 3, type: 'notice', title: 'New policy regarding secondary agent commissions defined.', date: '2024-10-08', color: 'var(--primary-blue)' },
          ].map((item, index, arr) => (
            <div
              key={item.id}
              className={`d-flex align-items-center justify-content-between p-3 announcement-item ${index !== arr.length - 1 ? 'border-bottom' : ''}`}
              style={{ borderColor: 'var(--border-light)', cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center">
                <Badge
                  className="me-3 border-0 py-1"
                  style={{
                    backgroundColor: item.color.startsWith('var') ? `var(--${item.color.slice(6, -1)}-muted)` : `${item.color}15`,
                    color: item.color,
                    fontSize: '11px',
                    fontWeight: '500',
                    width: '75px',
                    textAlign: 'center'
                  }}
                >
                  {t(item.type)}
                </Badge>
                <span className="announcement-title-text text-truncate" style={{ fontSize: '14px', color: 'var(--text-regular)', maxWidth: '200px' }}>{item.title}</span>
              </div>
              <span className="text-secondary smaller">{item.date}</span>
            </div>
          ))}
        </Card.Body>
      </Card>

      {/* 3. Quick Functions / Shortcuts */}
      <h6 className="mb-3 text-secondary ms-1" style={{ fontSize: '13px', fontWeight: '600' }}>{t('quick_functions')}</h6>
      <Row className="g-3 mb-4">
        {quickFunctions.map((item, idx) => (
          <Col xs={6} md={3} key={idx}>
            <Card
              className="majestic-card h-100 border-0 text-center py-4 shortcut-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(item.path)}
            >
              <div className="mb-3">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-3" style={{ backgroundColor: `${item.color}15` }}>
                  <i className={`bi ${item.icon} fs-1`} style={{ color: item.color }}></i>
                </div>
              </div>
              <h6 className="mb-0 fw-bold" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{item.name}</h6>
            </Card>
          </Col>
        ))}
      </Row>

      <style>{`
        .shortcut-card:hover { transform: translateY(-5px); transition: all 0.3s ease; background-color: var(--border-light) !important; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .announcement-item:hover { background-color: rgba(var(--primary-blue), 0.02); }
        .announcement-item:hover .announcement-title-text { color: var(--primary-blue) !important; }
        .hover-primary:hover { color: var(--primary-blue) !important; }
        .time-filter-card .form-control::placeholder { color: #888; }
      `}</style>
    </div>
  );
};

export default AgentDashboard;