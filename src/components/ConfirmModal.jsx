import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                maxWidth: '400px',
                width: '90%',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--color-border)',
                animation: 'slideIn 0.2s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                        <AlertTriangle size={24} color="var(--color-danger)" />
                        {title}
                    </h3>
                    <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.25rem' }}>
                        <X size={20} />
                    </button>
                </div>

                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="btn btn-danger">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
