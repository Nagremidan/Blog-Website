import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle size={20} color="#22c55e" />,
        error: <AlertCircle size={20} color="#ef4444" />,
        info: <Info size={20} color="#3b82f6" />
    };

    const bgColors = {
        success: 'rgba(34, 197, 94, 0.1)',
        error: 'rgba(239, 68, 68, 0.1)',
        info: 'rgba(59, 130, 246, 0.1)'
    };

    const borderColors = {
        success: '#22c55e',
        error: '#ef4444',
        info: '#3b82f6'
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: '#1e293b',
            borderLeft: `4px solid ${borderColors[type]}`,
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            minWidth: '300px',
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease-out forwards',
            marginBottom: '0.5rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: bgColors[type],
                opacity: 0.5,
                pointerEvents: 'none'
            }} />

            <div style={{ zIndex: 1 }}>{icons[type]}</div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#f8fafc', flex: 1, zIndex: 1 }}>{message}</p>
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 0,
                    display: 'flex',
                    zIndex: 1
                }}
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
