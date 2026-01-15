import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const HeaderTabs = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    // Map paths to tab names matching the screenshots
    const getTabName = (pathname) => {
        switch (pathname) {
            case '/dashboard': return 'workbench';
            case '/user-management': return 'menu_user_list';
            case '/stock-orders': return 'menu_stock_orders';
            case '/withdrawals': return 'menu_withdrawal_records';
            case '/user-balance-details': return 'menu_user_balance_details';
            case '/agent-management': return 'menu_agent_management';
            default:
                if (pathname.startsWith('/user-details/')) return 'user_details';
                return 'page';
        }
    };

    const currentTab = {
        path: location.pathname,
        name: getTabName(location.pathname),
        active: true
    };

    // In a real app, this list would be in a global context. 
    // For now, we simulate the "workbench" always being open + the current page.
    const tabs = [
        { path: '/dashboard', name: 'workbench', active: location.pathname === '/dashboard' }
    ];

    if (location.pathname !== '/dashboard') {
        tabs.push(currentTab);
    }

    return (
        <div className="d-flex align-items-center w-100" style={{
            height: '34px',
            backgroundColor: 'var(--bg-dark)',
            borderBottom: '1px solid var(--border-color)',
            paddingLeft: '10px'
        }}>
            {tabs.map((tab, index) => (
                <div
                    key={index}
                    onClick={() => navigate(tab.path)}
                    className="d-flex align-items-center px-2 me-1"
                    style={{
                        height: '24px',
                        backgroundColor: tab.active ? 'var(--primary-blue)' : 'transparent',
                        color: tab.active ? '#fff' : 'var(--text-secondary)',
                        borderRadius: '2px',
                        border: tab.active ? 'none' : '1px solid var(--border-color)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        userSelect: 'none'
                    }}
                >
                    <span className="me-2">{t(tab.name)}</span>
                    {tab.name !== 'workbench' && (
                        <i className="bi bi-x" style={{ fontSize: '14px', opacity: 0.8 }}></i>
                    )}
                </div>
            ))}
        </div>
    );
};

export default HeaderTabs;
