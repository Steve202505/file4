import React, { useState } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getCurrentAgent, clearAgentAuthData, isAdmin } from '../../services/auth';
import { useTheme } from '../../context/ThemeContext';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSettingsDrawer from './ThemeSettingsDrawer';
import toast from 'react-hot-toast';

const AgentNavbar = ({ isMobile, onMobileMenuClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const agent = getCurrentAgent();
  const { settings, updateSettings } = useTheme();
  const isLoggedIn = !!agent;
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showThemeDrawer, setShowThemeDrawer] = useState(false);

  const handleLogout = () => {
    clearAgentAuthData();
    navigate('/login');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleToggleSidebar = () => {
    updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed });
  };

  const copyReferralCode = (e) => {
    e.stopPropagation(); // Prevent dropdown from closing immediately if desired, though usually closing is fine
    if (agent?.referCode) {
      navigator.clipboard.writeText(agent.referCode);
      toast.success(t('msg_copy_success', 'Copied to clipboard!'));
    }
  };

  const menuItems = [
    {
      path: '/dashboard',
      name: t('workbench'),
      icon: 'bi-display'
    },
    {
      id: 'stock',
      name: t('menu_stock_management'),
      icon: 'bi-apple',
      children: [
        { path: '/stock-orders', name: t('menu_stock_orders') }
      ]
    },
    {
      id: 'financial',
      name: t('menu_financial_management'),
      icon: 'bi-graph-up-arrow',
      children: [
        { path: '/withdrawals', name: t('menu_withdrawal_records') }
      ]
    },
    {
      id: 'user',
      name: t('menu_user_management'),
      icon: 'bi-apple',
      children: [
        { path: '/user-management', name: t('menu_user_list') },
        { path: '/user-balance-details', name: t('menu_user_balance_details') }
      ]
    }
  ];

  if (isAdmin()) {
    menuItems.push({
      id: 'admin',
      name: t('menu_agent_management'),
      icon: 'bi-shield-lock',
      children: [
        { path: '/agent-management', name: t('menu_agent_management') },
        { path: '/audit-logs', name: t('menu_audit_logs') }
      ]
    });
  }

  return (
    <>
      <Navbar className="border-bottom py-0 px-0 navbar-expand" style={{ height: '50px', backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)' }}>
        <Container fluid className="px-0 h-100">

          {/* Mobile Hamburger Menu Button */}
          {isMobile && settings.layout === 'side' && (
            <div
              className="d-flex align-items-center justify-content-center h-100 px-3"
              onClick={onMobileMenuClick}
              style={{ cursor: 'pointer', borderRight: '1px solid var(--border-color)' }}
            >
              <i className="bi bi-list text-secondary" style={{ fontSize: '24px' }}></i>
            </div>
          )}

          {/* Logo - Show only for Top Layout or if Breadcrumbs are hidden */}
          {(settings.layout === 'top' || !settings.showBreadcrumbs) && settings.showLogo && (
            <div className="d-flex align-items-center px-3 border-end border-secondary" style={{ height: '30px', borderColor: 'var(--border-light)' }}>
              <img src="/assets/images/logo.png" alt={t('logo', 'Logo')} className="me-2" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>{isAdmin() ? t('admin') : t('agent')}</span>
            </div>
          )}

          {/* Sidebar Toggle & Refresh Buttons - Only show if Side Layout */}
          {settings.layout === 'side' && (
            <div className="d-flex align-items-center h-100 border-end" style={{ borderColor: 'var(--border-light)' }}>
              {!isMobile && (
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip>{settings.sidebarCollapsed ? (t('expand_menu') || 'Expand Menu') : (t('collapse_menu') || 'Collapse Menu')}</Tooltip>}
                >
                  <div
                    className="d-flex align-items-center justify-content-center h-100"
                    onClick={handleToggleSidebar}
                    style={{ cursor: 'pointer', width: '40px', }}
                  >
                    <i
                      className={`bi ${settings.sidebarCollapsed ? 'bi-text-indent-right' : 'bi-text-indent-left'} text-secondary`}
                      style={{ fontSize: '20px' }}
                    ></i>
                  </div>
                </OverlayTrigger>
              )}

              <OverlayTrigger placement="bottom" overlay={<Tooltip>{t('refresh') || 'Refresh'}</Tooltip>}>
                <div
                  className="d-flex align-items-center justify-content-center h-100"
                  onClick={handleRefresh}
                  style={{ cursor: 'pointer', width: '40px' }}
                >
                  <i className="bi bi-arrow-clockwise text-secondary" style={{ fontSize: '18px' }}></i>
                </div>
              </OverlayTrigger>
            </div>
          )}

          {/* Breadcrumb Area - Only show if not Top Layout and not on small mobile */}
          {settings.showBreadcrumbs && settings.layout !== 'top' && (
            <div className="d-none d-md-flex align-items-center text-secondary small ps-3">
              <span className="me-2">{t('current_location')}:</span>
              <span className="text-blue fw-bold">{t('workbench')}</span>
            </div>
          )}

          {/* Mobile Center Title - Optional, helps on very small screens */}
          {isMobile && (
            <div className="d-flex d-md-none align-items-center flex-grow-1 justify-content-center">
              <span className="fw-bold text-white small text-truncate px-2">{t('workbench')}</span>
            </div>
          )}

          {/* Top Navigation Menu */}
          {settings.layout === 'top' && isLoggedIn && (
            <Nav className="me-auto ms-3 d-none d-lg-flex">
              {menuItems.map((item) => (
                item.children ? (
                  <Dropdown key={item.id} as={Nav.Item} className="mx-1">
                    <Dropdown.Toggle
                      as={Nav.Link}
                      className={`d-flex align-items-center px-2 ${item.children.some(c => location.pathname === c.path) ? 'active text-primary' : 'text-secondary'}`}
                      style={{ color: 'var(--text-regular)' }}
                    >
                      <i className={`bi ${item.icon} me-1`}></i> {item.name}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="shadow-sm mt-0" data-bs-theme={settings.darkMode ? 'dark' : 'light'} style={{ backgroundColor: 'var(--bg-card)' }}>
                      {item.children.map(child => (
                        <Dropdown.Item
                          key={child.path}
                          as={NavLink}
                          to={child.path}
                          className={`d-flex align-items-center px-3 py-2 small ${location.pathname === child.path ? 'text-primary bg-light-primary' : ''}`}
                        >
                          <i className="bi bi-apple me-2 small"></i> {child.name}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <Nav.Link
                    key={item.path}
                    as={NavLink}
                    to={item.path}
                    className="mx-1 d-flex align-items-center px-2"
                    style={{ color: location.pathname === item.path ? 'var(--primary-blue)' : 'var(--text-regular)' }}
                  >
                    <i className={`bi ${item.icon} me-1`}></i> {item.name}
                  </Nav.Link>
                )
              ))}
            </Nav>
          )}

          {/* Right Side Items - Always Visible (No Collapse) */}
          <Nav className="ms-auto align-items-center h-100 flex-row">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {isLoggedIn ? (
              <>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="link" className="border-0 bg-transparent p-0 d-flex align-items-center text-decoration-none px-3" id="user-dropdown">
                    <i className="bi bi-person-circle text-secondary fs-5 me-2"></i>
                    <span className="small me-1 d-none d-sm-inline" style={{ color: 'var(--text-primary)' }}>{agent.username}</span>
                    <i className="bi bi-chevron-down text-secondary" style={{ fontSize: '10px' }}></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="bg-card border-secondary mt-2 shadow" data-bs-theme={settings.darkMode ? 'dark' : 'light'}>
                    {/* Referral Code Implementation */}
                    {!isAdmin() && agent.referCode && (
                      <>
                        <div className="px-3 py-2 mb-1">
                          <span className="text-secondary d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('refer_code')}</span>
                          <div className="d-flex align-items-center justify-content-between p-2 rounded position-relative group-hover-target"
                            style={{
                              backgroundColor: 'var(--bg-body)',
                              border: '1px dashed var(--border-color)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <span className="fw-bold text-primary font-monospace user-select-all" style={{ letterSpacing: '1px' }}>{agent.referCode}</span>
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle cursor-pointer hover-bg-primary-subtle"
                              onClick={copyReferralCode}
                              title={t('copy')}
                              style={{ width: '28px', height: '28px', cursor: 'pointer' }}
                            >
                              <i className="bi bi-clipboard text-primary"></i>
                            </div>
                          </div>
                        </div>
                        <Dropdown.Divider className="border-secondary my-1" />
                      </>
                    )}

                    <Dropdown.Item onClick={() => setShowPwdModal(true)} className="px-3 py-2 d-flex align-items-center mt-1">
                      <div className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '32px', height: '32px', backgroundColor: 'rgba(144, 147, 153, 0.1)' }}>
                        <i className="bi bi-key text-secondary"></i>
                      </div>
                      <span style={{ fontWeight: '500' }}>{t('change_password')}</span>
                    </Dropdown.Item>

                    <Dropdown.Item onClick={handleLogout} className="px-3 py-2 d-flex align-items-center mb-1 text-danger">
                      <div className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '32px', height: '32px', backgroundColor: 'rgba(245, 108, 108, 0.1)' }}>
                        <i className="bi bi-box-arrow-right text-danger"></i>
                      </div>
                      <span style={{ fontWeight: '500' }}>{t('logout')}</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                {/* Theme Settings Trigger - Gear Icon */}
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip id="theme-tooltip">{t('theme_settings')}</Tooltip>}
                >
                  <div
                    className="h-100 d-flex align-items-center justify-content-center px-3"
                    onClick={() => setShowThemeDrawer(true)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: 'var(--bg-dark)',
                      borderLeft: '1px solid var(--border-color)'
                    }}
                  >
                    <i className="bi bi-gear fs-5" style={{ color: 'var(--text-primary)' }}></i>
                  </div>
                </OverlayTrigger>
              </>
            ) : (
              <Nav.Link onClick={() => navigate('/login')} className="text-light px-3">
                {t('login')}
              </Nav.Link>
            )}
          </Nav>
        </Container>
      </Navbar>

      <ChangePasswordModal show={showPwdModal} onHide={() => setShowPwdModal(false)} />
      <ThemeSettingsDrawer show={showThemeDrawer} onHide={() => setShowThemeDrawer(false)} />
    </>
  );
};

export default AgentNavbar;