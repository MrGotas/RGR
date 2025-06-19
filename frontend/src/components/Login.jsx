import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', onConfirm: null, onCancel: null, showCancelButton: false });

    const openModal = (title, message, onConfirm, onCancel = null, showCancelButton = false) => {
        setModalContent({ title, message, onConfirm, onCancel, showCancelButton });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalContent({ title: '', message: '', onConfirm: null, onCancel: null, showCancelButton: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const result = await login(username, password);

        if (result.success) {
            navigate('/home');
        } else {
            setError(result.error);
        }
    };

    const containerStyle = {
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '500px',
        boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif',
    };

    const formGroupStyle = {
        marginBottom: '15px',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#333',
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        boxSizing: 'border-box',
        fontSize: '16px',
    };

    const buttonBaseStyle = {
        width: '100%',
        padding: '12px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
    };

    const buttonPrimaryStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#007bff',
    };

    const errorMessageStyle = {
        backgroundColor: '#ffebe8',
        border: '1px solid #ff0000',
        color: '#ff0000',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '15px',
        textAlign: 'center',
        fontWeight: 'bold',
        whiteSpace: 'pre-wrap',
    };

    const linkTextStyle = {
        textAlign: 'center',
        marginTop: '20px',
    };

    const linkStyle = {
        color: '#007bff',
        textDecoration: 'none',
        fontWeight: 'bold',
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5', padding: '16px' }}>
            <div style={containerStyle}>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: '2rem' }}>Вход в систему</h2>
                {error && (
                    <div style={errorMessageStyle} role="alert">
                        <strong>Ошибка: </strong>
                        <span>{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={formGroupStyle}>
                        <label htmlFor="username" style={labelStyle}>
                            Логин:
                        </label>
                        <input
                            type="text"
                            id="username"
                            style={inputStyle}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label htmlFor="password" style={labelStyle}>
                            Пароль:
                        </label>
                        <input
                            type="password"
                            id="password"
                            style={inputStyle}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        style={buttonPrimaryStyle}
                    >
                        Войти
                    </button>
                </form>
                <p style={linkTextStyle}>
                    Еще нет аккаунта?{' '}
                    <Link to="/register" style={linkStyle}>
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
            <Modal
                show={showModal}
                title={modalContent.title}
                message={modalContent.message}
                onConfirm={modalContent.onConfirm}
                onCancel={modalContent.onCancel}
                showCancelButton={modalContent.showCancelButton}
            />
        </div>
    );
};

export default Login;
