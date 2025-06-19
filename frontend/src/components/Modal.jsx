import React from 'react';

const Modal = ({ show, title, message, onConfirm, onCancel, showCancelButton = true }) => {
    if (!show) {
        return null;
    }

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };

    const modalStyle = {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        position: 'relative',
        fontFamily: 'Inter, sans-serif',
    };

    const titleStyle = {
        fontSize: '1.8em',
        color: '#333',
        marginBottom: '15px',
    };

    const messageStyle = {
        fontSize: '1.1em',
        color: '#555',
        marginBottom: '25px',
        whiteSpace: 'pre-wrap',
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '20px',
    };

    const buttonBaseStyle = {
        padding: '12px 25px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1em',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        fontFamily: 'Inter, sans-serif',
    };

    const confirmButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#007bff',
        color: 'white',
    };

    const cancelButtonPrimaryStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#6c757d',
        color: 'white',
    };

    const closeButtonStyle = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '1.5em',
        cursor: 'pointer',
        color: '#aaa',
        transition: 'color 0.2s ease',
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <button style={closeButtonStyle} onClick={onCancel || onConfirm}>&times;</button>
                <h3 style={titleStyle}>{title}</h3>
                <p style={messageStyle}>{message}</p>
                <div style={buttonContainerStyle}>
                    {showCancelButton && (
                        <button
                            style={cancelButtonPrimaryStyle}
                            onClick={onCancel}
                        >
                            Отмена
                        </button>
                    )}
                    <button
                        style={confirmButtonStyle}
                        onClick={onConfirm}
                    >
                        {showCancelButton ? 'Подтвердить' : 'ОК'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
