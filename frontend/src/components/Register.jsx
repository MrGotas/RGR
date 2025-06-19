import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState(null);
    const { register } = useAuth();
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

        if (password !== password2) {
            setError("Пароли не совпадают.");
            return;
        }

        const result = await register(username, email, password, password2);

        if (result.success) {
            openModal('Регистрация успешна!', 'Теперь вы можете войти в систему.', () => {
                closeModal();
                navigate('/login');
            });
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

    const buttonSuccessStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#28a745',
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
                <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: '2rem' }}>Регистрация</h2>
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
                        <label htmlFor="email" style={labelStyle}>
                            Email (опционально):
                        </label>
                        <input
                            type="email"
                            id="email"
                            style={inputStyle}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                    <div style={formGroupStyle}>
                        <label htmlFor="password2" style={labelStyle}>
                            Повторите пароль:
                        </label>
                        <input
                            type="password"
                            id="password2"
                            style={inputStyle}
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        style={buttonSuccessStyle}
                    >
                        Зарегистрироваться
                    </button>
                </form>
                <p style={linkTextStyle}>
                    Уже есть аккаунт?{' '}
                    <Link to="/login" style={linkStyle}>
                        Войти
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

export default Register;
