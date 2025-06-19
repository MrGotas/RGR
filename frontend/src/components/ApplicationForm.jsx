import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createApplication, getProtectedResource, updateApplication } from '../utils/api';
import Modal from './Modal';

const ApplicationForm = ({ mode }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token, logout } = useAuth();

    const [formData, setFormData] = useState({
        identifier: '',
        location: '',
        object_instance: '',
        status: '',
        start_time: '',
        end_time: '',
        correction: '',
        brigade: '',
    });

    const [locations, setLocations] = useState([]);
    const [objects, setObjects] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [brigades, setBrigades] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const formContainerStyle = {
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '600px',
        boxSizing: 'border-box',
        margin: '20px auto',
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
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        boxSizing: 'border-box',
        fontSize: '16px',
    };

    const selectStyle = {
        ...inputStyle,
        appearance: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'currentColor\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\' clip-rule=\'evenodd\' /%3E%3C/svg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem',
    };

    const buttonBaseStyle = {
        padding: '12px 20px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        color: 'white',
        marginTop: '20px',
        marginRight: '10px',
        fontFamily: 'Inter, sans-serif',
    };

    const buttonPrimaryStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#007bff',
    };

    const buttonSecondaryStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#6c757d',
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

    const formTitleStyle = {
        fontSize: '2em',
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        marginBottom: '2rem',
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!token) {
                    openModal('Ошибка', 'Необходимо аутентифицироваться.', () => {
                        closeModal();
                        logout();
                        navigate('/login');
                    });
                    return;
                }

                const [locs, objs, stats, brigs] = await Promise.all([
                    getProtectedResource('/locations/'),
                    getProtectedResource('/objects/'),
                    getProtectedResource('/statuses/'),
                    getProtectedResource('/brigades/'),
                ]);

                setLocations(locs);
                setObjects(objs);
                setStatuses(stats);
                setBrigades(brigs);

                if (mode === 'edit' && id) {
                    const data = await getProtectedResource(`/applications/${id}/`);
                    setFormData({
                        identifier: data.identifier || '',
                        location: data.location || '',
                        object_instance: data.object_instance || '',
                        status: data.status || '',
                        start_time: data.start_time ? new Date(data.start_time).toISOString().slice(0, 16) : '',
                        end_time: data.end_time ? new Date(data.end_time).toISOString().slice(0, 16) : '',
                        correction: data.correction || '',
                        brigade: data.brigade || '',
                    });
                }
            } catch (err) {
                console.error('Ошибка загрузки данных формы:', err);
                if (err.status === 401 || err.status === 403) {
                    openModal('Сессия истекла', 'Ваша сессия истекла или токен недействителен. Пожалуйста, войдите снова.', () => {
                        closeModal();
                        logout();
                        navigate('/login');
                    });
                } else {
                    setError(err.message || 'Не удалось загрузить данные для формы.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [mode, id, token, navigate, logout]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'brigade' && value !== '') ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const dataToSend = {
            identifier: formData.identifier,
            location: formData.location,
            object_instance: formData.object_instance,
            status: formData.status,
            start_time: formData.start_time ? new Date(formData.start_time).toISOString() : null,
            end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
            correction: formData.correction || null,
            brigade: formData.brigade || null,
        };

        try {
            if (mode === 'create') {
                await createApplication(dataToSend);
                openModal('Успех', 'Заявка успешно создана!', () => {
                    closeModal();
                    navigate('/home');
                });
            } else {
                await updateApplication(id, dataToSend);
                openModal('Успех', 'Заявка успешно обновлена!', () => {
                    closeModal();
                    navigate('/home');
                });
            }
        } catch (err) {
            console.error('Ошибка при сохранении заявки:', err);
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5' }}>
                <p style={{ color: '#555', fontSize: '1.2rem' }}>Загрузка данных для формы...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5', padding: '16px' }}>
            <div style={formContainerStyle}>
                <h2 style={formTitleStyle}>{mode === 'create' ? 'Создать новую заявку' : 'Редактировать заявку'}</h2>
                {error && (
                    <div style={errorMessageStyle} role="alert">
                        <strong>Ошибка: </strong>
                        <pre style={{whiteSpace: 'pre-wrap', margin: 0}}>{error}</pre>
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={formGroupStyle}>
                        <label htmlFor="identifier" style={labelStyle}>Идентификатор (обязательно):</label>
                        <input
                            type="text"
                            id="identifier"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={formGroupStyle}>
                        <label htmlFor="location" style={labelStyle}>Местоположение (обязательно):</label>
                        <select
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            style={selectStyle}
                            required
                        >
                            <option value="">Выберите местоположение</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.location}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={formGroupStyle}>
                        <label htmlFor="object_instance" style={labelStyle}>Название объекта (обязательно):</label>
                        <select
                            id="object_instance"
                            name="object_instance"
                            value={formData.object_instance}
                            onChange={handleChange}
                            style={selectStyle}
                            required
                        >
                            <option value="">Выберите объект</option>
                            {objects.map(obj => (
                                <option key={obj.id} value={obj.id}>
                                    {obj.object}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={formGroupStyle}>
                        <label htmlFor="status" style={labelStyle}>Статус (обязательно):</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            style={selectStyle}
                            required
                        >
                            <option value="">Выберите статус</option>
                            {statuses.map(stat => (
                                <option key={stat.id} value={stat.id}>
                                    {stat.status}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={formGroupStyle}>
                        <label htmlFor="brigade" style={labelStyle}>Номер бригады:</label>
                        <select
                            id="brigade"
                            name="brigade"
                            value={formData.brigade}
                            onChange={handleChange}
                            style={selectStyle}
                        >
                            <option value="">Выберите бригаду (необязательно)</option>
                            {brigades.map(brig => (
                                <option key={brig.id} value={brig.id}>
                                    {brig.brigade}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={formGroupStyle}>
                        <label htmlFor="start_time" style={labelStyle}>Время начала:</label>
                        <input
                            type="datetime-local"
                            id="start_time"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label htmlFor="end_time" style={labelStyle}>Время завершения:</label>
                        <input
                            type="datetime-local"
                            id="end_time"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label htmlFor="correction" style={labelStyle}>Коррекция/Примечание:</label>
                        <textarea
                            id="correction"
                            name="correction"
                            value={formData.correction}
                            onChange={handleChange}
                            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <button type="submit" style={buttonPrimaryStyle}>
                            {mode === 'create' ? 'Создать' : 'Сохранить изменения'}
                        </button>
                        <button type="button" onClick={() => navigate('/home')} style={buttonSecondaryStyle}>
                            Отмена
                        </button>
                    </div>
                </form>
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

export default ApplicationForm;
