import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, PenTool, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    const { theme, toggleTheme } = useTheme();

    return (
        <nav style={{
            borderBottom: '1px solid var(--color-border)',
            padding: '1rem 0',
            marginBottom: '2rem',
            backgroundColor: 'var(--color-bg-card)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            transition: 'background-color 0.3s, border-color 0.3s'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-accent)' }}>Inkzenith</span>-Blog
                </Link>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={toggleTheme} className="btn btn-ghost" title="Toggle Theme">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <Link to="/" className={`btn ${!isAdmin ? 'btn-primary' : 'btn-ghost'}`}>
                        <Home size={18} />
                        Home
                    </Link>
                    <Link to="/admin" className={`btn ${isAdmin ? 'btn-primary' : 'btn-ghost'}`}>
                        <LayoutDashboard size={18} />
                        Admin
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
