import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { isAdmin } from '../../services/auth';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import './Sidebar.css';

const Sidebar = ({ isMobileOpen, onMobileClose }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const { settings } = useTheme();
    const [openMenus, setOpenMenus] = useState({});

    // Effect to keep submenus open if a child route is active
    useEffect(() => {
        // Define the menu structure matching the user's reference images
        const menuItems = [
            {
                path: '/dashboard',
                name: t('workbench'),
                icon: 'bi-display'
            },
            {
                id: 'stock',
                name: t('menu_stock_management'),
                icon: 'bi-apple', // Using apple icon from screenshot for consistent look
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
                icon: 'bi-apple', // screenshot uses apple icon for multiple groups? Let's follow screenshot
                children: [
                    { path: '/user-management', name: t('menu_user_list') },
                    { path: '/user-balance-details', name: t('menu_user_balance_details') },
                    ...(isAdmin() ? [{ path: '/user-wallet-details', name: t('menu_user_wallet_details', 'User Wallet Details') }] : [])
                ]
            }
        ];

        if (isAdmin()) {
            menuItems.push({
                id: 'admin',
                name: t('menu_agent_management'),
                icon: 'bi-shield-lock',
                children: [
                    { path: '/agent-management', name: t('menu_agent_list') },
                    { path: '/audit-logs', name: t('menu_audit_logs') }
                ]
            });

            // My Management Section
            menuItems.push({
                id: 'my-management',
                name: t('menu_my_management', 'My Management'),
                icon: 'bi-person-badge',
                children: [
                    { path: '/my-wallet', name: t('menu_my_wallet', 'My Wallet') },
                    { path: '/management/global-support', name: t('menu_global_support', 'Global Support') }
                ]
            });
        }

        const newOpenMenus = settings.expandOneLevel ? {} : { ...openMenus };
        let changed = false;

        menuItems.forEach(item => {
            if (item.children) {
                const hasActiveChild = item.children.some(child => location.pathname === child.path);
                if (hasActiveChild && !newOpenMenus[item.id]) {
                    newOpenMenus[item.id] = true;
                    changed = true;
                }
            }
        });

        if (changed) {
            setOpenMenus(newOpenMenus);
        }
    }, [location.pathname, settings.expandOneLevel, t, openMenus]);

    // Mobile override: If mobile sidebar is open, treat as NOT collapsed regardless of settings
    const isCollapsed = settings.sidebarCollapsed && !isMobileOpen;

    // Close sidebar on mobile when a link is clicked
    const handleLinkClick = () => {
        if (isMobileOpen && onMobileClose) {
            onMobileClose();
        }
    };

    const toggleMenu = (id) => {
        if (isCollapsed) return; // Prevent toggling in collapsed mode
        setOpenMenus(prev => {
            if (settings.expandOneLevel) {
                return { [id]: !prev[id] };
            }
            return {
                ...prev,
                [id]: !prev[id]
            };
        });
    };

    const renderWithTooltip = (content, title) => {
        if (!isCollapsed) return content;

        return (
            <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={<Tooltip id={`tooltip-${title}`}>{title}</Tooltip>}
            >
                {content}
            </OverlayTrigger>
        );
    };

    return (
        <div className={`sidebar-container ${isMobileOpen ? 'mobile-open' : ''}`}>
            {/* Logo Area */}
            {settings.showLogo && (
                <div className="sidebar-logo">
                    <div className="logo-box">
                        <img src="/assets/images/logo.png" alt={t('logo', 'Logo')} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                    </div>
                    <span className="logo-text">{isAdmin() ? t('admin') : t('agent')}</span>
                </div>
            )}

            {/* Navigation */}
            <div className="sidebar-nav">
                {(() => {
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
                                { path: '/user-balance-details', name: t('menu_user_balance_details') },
                                ...(isAdmin() ? [{ path: '/user-wallet-details', name: t('menu_user_wallet_details', 'User Wallet Details') }] : [])
                            ]
                        }
                    ];

                    if (isAdmin()) {
                        menuItems.push({
                            id: 'admin',
                            name: t('menu_agent_management'),
                            icon: 'bi-shield-lock',
                            children: [
                                { path: '/agent-management', name: t('menu_agent_list') },
                                { path: '/audit-logs', name: t('menu_audit_logs') }
                            ]
                        });
                        menuItems.push({
                            id: 'my-management',
                            name: t('menu_my_management', 'My Management'),
                            icon: 'bi-person-badge',
                            children: [
                                { path: '/my-wallet', name: t('menu_my_wallet', 'My Wallet') },
                                { path: '/management/global-support', name: t('menu_global_support', 'Global Support') }
                            ]
                        });
                    }

                    return menuItems.map((item) => (
                        <div key={item.id || item.path} className="nav-item-wrapper">
                            {item.children ? (
                                <>
                                    {renderWithTooltip(
                                        <div
                                            className={`sidebar-link ${item.children.some(c => location.pathname === c.path) ? 'parent-active' : ''}`}
                                            onClick={() => toggleMenu(item.id)}
                                        >
                                            <i className={`bi ${item.icon}`}></i>
                                            <span className="menu-text">{item.name}</span>
                                            <i className={`bi bi-chevron-down arrow-icon ${openMenus[item.id] ? 'open' : ''}`}></i>
                                        </div>
                                        , item.name)}

                                    <div
                                        className="submenu-container"
                                        style={{ maxHeight: (!isCollapsed && openMenus[item.id]) ? '500px' : '0' }}
                                    >
                                        {item.children.map(child => (
                                            <NavLink
                                                key={child.path}
                                                to={child.path}
                                                className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}
                                                onClick={handleLinkClick}
                                            >
                                                <i className="bi bi-apple"></i>
                                                <span>{child.name}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                renderWithTooltip(
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) => `sidebar-link ${isActive ? 'active-root' : ''}`}
                                        onClick={handleLinkClick}
                                    >
                                        <i className={`bi ${item.icon}`}></i>
                                        <span className="menu-text">{item.name}</span>
                                    </NavLink>
                                    , item.name)
                            )}
                        </div>
                    ));
                })()}
            </div>
        </div>
    );
};

export default Sidebar;
