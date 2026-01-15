import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AgentNavbar from './AgentNavbar';
import HeaderTabs from './HeaderTabs';
import { useTheme } from '../../context/ThemeContext';

const MainLayout = () => {
    const { settings } = useTheme();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Handle window resize to detect mobile
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setIsMobileSidebarOpen(false);
                document.body.classList.remove('sidebar-mobile-open');
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Toggle body class for mobile sidebar
    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.body.classList.add('sidebar-mobile-open');
        } else {
            document.body.classList.remove('sidebar-mobile-open');
        }
    }, [isMobileSidebarOpen]);

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };

    return (
        <div className="d-flex" style={{ backgroundColor: 'var(--bg-dark)', minHeight: '100vh', width: '100%', maxWidth: '100vw' }}>
            {/* Sidebar Overlay for mobile */}
            <div
                className={`sidebar-overlay ${isMobileSidebarOpen ? 'show' : ''}`}
                onClick={closeMobileSidebar}
            />

            {/* Sidebar - always rendered on side layout, controlled by CSS on mobile */}
            {settings.layout === 'side' && (
                <Sidebar
                    isMobileOpen={isMobileSidebarOpen}
                    onMobileClose={closeMobileSidebar}
                />
            )}

            <div className="flex-grow-1 d-flex flex-column" style={{ backgroundColor: 'var(--bg-body)', minWidth: 0 }}>
                <AgentNavbar
                    isMobile={isMobile}
                    onMobileMenuClick={toggleMobileSidebar}
                />
                {settings.multipleTabs && <HeaderTabs />}
                <main className="flex-grow-1 p-3 p-md-3 p-2" style={{ backgroundColor: 'var(--bg-body)', maxWidth: '100%' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
