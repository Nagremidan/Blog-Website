import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, PenTool, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

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
                <Link to="/" onClick={closeMenu} style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 102 }}>
                    <span style={{ color: 'var(--color-accent)' }}>Inkzenith</span>-Blog
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="btn btn-ghost mobile-menu-btn"
                    onClick={toggleMenu}
                    style={{ zIndex: 102 }}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Desktop & Mobile Menu */}
                <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" onClick={closeMenu} className={`btn ${!isAdmin ? 'btn-primary' : 'btn-ghost'}`}>
                        <Home size={18} />
                        Home
                    </Link>
                    <Link to="/admin" onClick={closeMenu} className={`btn ${isAdmin ? 'btn-primary' : 'btn-ghost'}`}>
                        <LayoutDashboard size={18} />
                        Admin
                    </Link>
                </div>
            </div>

            {/* Overlay for mobile menu */}
            {isMenuOpen && (
                <div
                    onClick={closeMenu}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 100
                    }}
                    className="mobile-overlay"
                />
            )}
        </nav>
    );
};

export default Navbar;
