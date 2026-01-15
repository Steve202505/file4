import React from 'react';
import { Outlet } from 'react-router-dom';
import UserLanguageSwitcher from './UserLanguageSwitcher';

const MainLayout = () => {
    return (
        <div className="d-flex flex-column min-vh-100 position-relative">
            <main className="flex-grow-1">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
