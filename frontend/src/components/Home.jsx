import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProtectedResource, deleteApplication } from '../utils/api';
import Modal from './Modal';

const Home = () => {
    const { user, token, logout } = useAuth();
    const [allApplications, setAllApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [statusesForFilter, setStatusesForFilter] = useState([]);

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

    const basePageStyle = {
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Inter, sans-serif',
    };

    const mainContainerStyle = {
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '1200px',
        boxSizing: 'border-box',
        margin: '20px auto',
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '15px',
    };

    const pageTitleStyle = {
        fontSize: '2.8em',
        fontWeight: '800',
        color: '#333',
        margin: '0',
        width: '100%',
        textAlign: 'center',
        marginBottom: '30px',
    };

    const buttonBaseStyle = {
        padding: '10px 18px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        color: 'white',
        textDecoration: 'none',
        display: 'inline-block',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
    };

    const buttonDangerStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#dc3545',
    };
    const buttonEditStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#ffc107',
        color: '#333',
        padding: '8px 12px',
        fontSize: '14px',
        marginRight: '5px',
    };
    const buttonDeleteStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#dc3545',
        padding: '8px 12px',
        fontSize: '14px',
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

    const sectionTitleStyle = {
        fontSize: '1.8em',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '20px',
        textAlign: 'center',
    };

    const applicationsTableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        borderRadius: '8px',
        overflow: 'hidden',
    };

    const tableHeaderStyle = {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '12px 15px',
        textAlign: 'left',
        borderBottom: '1px solid #ddd',
        fontWeight: 'bold',
    };

    const tableRowStyle = {
        borderBottom: '1px solid #eee',
        transition: 'background-color 0.2s ease',
    };

    const tableCellStyle = {
        padding: '10px 15px',
        verticalAlign: 'top',
        color: '#333',
    };

    const filterContainerStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '25px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #eee',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto 25px auto',
    };

    const filterInputStyle = {
        padding: '10px 12px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '1em',
        flexGrow: 1,
        minWidth: '180px',
        boxSizing: 'border-box',
    };

    const filterLabelStyle = {
        fontWeight: 'bold',
        color: '#555',
    };

    const filterSelectStyle = {
        ...filterInputStyle,
        appearance: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'currentColor\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\' clip-rule=\'evenodd\' /%3E%3C/svg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem',
    };

    const paginationContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '15px',
        marginTop: '20px',
    };

    const paginationButtonStyle = {
        padding: '10px 20px',
        border: '1px solid #007bff',
        borderRadius: '5px',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
        fontFamily: 'Inter, sans-serif',
    };

    const paginationButtonDisabledStyle = {
        ...paginationButtonStyle,
        backgroundColor: '#e0e0e0',
        borderColor: '#ccc',
        color: '#a0a0a0',
        cursor: 'not-allowed',
    };

    const paginationCurrentPageStyle = {
        fontSize: '1.1em',
        fontWeight: 'bold',
        color: '#333',
    };

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate('/login');
        } else {
            openModal('Ошибка выхода', result.error || 'Не удалось выйти из системы.', () => closeModal());
        }
    };

    const fetchApplicationsAndStatuses = useCallback(async () => {
        if (!token) {
            setLoading(false);
            openModal('Ошибка доступа', 'Необходимо аутентифицироваться для просмотра заявок.', () => {
                closeModal();
                logout();
                navigate('/login');
            });
            return;
        }
        try {
            setLoading(true);
            const [applicationsData, statusesData] = await Promise.all([
                getProtectedResource('/applications/'),
                getProtectedResource('/statuses/')
            ]);

            setAllApplications(applicationsData);
            setFilteredApplications(applicationsData);
            setStatusesForFilter(statusesData);
            setError(null);
        } catch (err) {
            console.error('Ошибка при получении данных:', err);
            if (err.status === 401 || err.status === 403) {
                openModal('Сессия истекла', 'Ваша сессия истекла или токен недействителен. Пожалуйста, войдите снова.', () => {
                    closeModal();
                    logout();
                    navigate('/login');
                });
            } else {
                setError(err.message || 'Не удалось загрузить данные.');
            }
        } finally {
            setLoading(false);
        }
    }, [token, logout, navigate]);

    useEffect(() => {
        fetchApplicationsAndStatuses();
    }, [fetchApplicationsAndStatuses]);

    useEffect(() => {
        let currentApplications = [...allApplications];

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            currentApplications = currentApplications.filter(app =>
                app.identifier.toLowerCase().includes(lowerSearchTerm) ||
                app.location_name.toLowerCase().includes(lowerSearchTerm) ||
                app.object_name.toLowerCase().includes(lowerSearchTerm)
            );
        }

        if (filterStatus) {
            currentApplications = currentApplications.filter(app =>
                app.status_name.toLowerCase() === filterStatus.toLowerCase()
            );
        }

        setFilteredApplications(currentApplications);
        setCurrentPage(1);
    }, [searchTerm, filterStatus, allApplications]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleDelete = (appId) => {
        openModal(
            'Подтвердите удаление',
            'Вы уверены, что хотите удалить эту заявку? Это действие необратимо.',
            async () => {
                closeModal();
                try {
                    await deleteApplication(appId);
                    // Обновляем состояние, чтобы удалить заявку без перезагрузки
                    setAllApplications(prevApplications => prevApplications.filter(app => app.id !== appId));
                    openModal('Успех', 'Заявка успешно удалена!', () => {
                        closeModal();
                    });
                } catch (err) {
                    openModal('Ошибка', err.message || 'Не удалось удалить заявку.', () => closeModal());
                    console.error('Ошибка удаления заявки:', err);
                }
            },
            () => closeModal(),
            true
        );
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5' }}>
                <p style={{ color: '#555', fontSize: '1.2rem' }}>Загрузка данных...</p>
            </div>
        );
    }

    return (
        <div style={basePageStyle}>
            <h1 style={pageTitleStyle}>Система управления заявками</h1>
            <div style={mainContainerStyle}>
                <div style={headerStyle}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link to="/applications/create" style={{ ...buttonBaseStyle, backgroundColor: '#28a745' }}>
                            Создать заявку
                        </Link>
                        <button onClick={handleLogout} style={buttonDangerStyle}>
                            Выйти
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={errorMessageStyle} role="alert" >
                        <strong>Ошибка: </strong>
                        <span>{error}</span>
                    </div>
                )}

                <h2 style={sectionTitleStyle}>Список заявок:</h2>

                <div style={filterContainerStyle}>
                    <label style={filterLabelStyle}>Поиск:</label>
                    <input
                        type="text"
                        placeholder="Поиск по идентификатору/местоположению/объекту"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={filterInputStyle}
                    />
                    <label htmlFor="filterStatus" style={filterLabelStyle}>Статус:</label>
                    <select
                        id="filterStatus"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={filterSelectStyle}
                    >
                        <option value="">Все статусы</option>
                        {statusesForFilter.map(stat => (
                            <option key={stat.id} value={stat.status}>
                                {stat.status}
                            </option>
                        ))}
                    </select>
                </div>

                {filteredApplications.length > 0 ? (
                    <>
                        <div style={{ overflowX: 'auto', width: '100%' }}>
                            <table style={applicationsTableStyle}>
                                <thead>
                                    <tr style={{backgroundColor: '#f8f9fa'}}>
                                        <th style={tableHeaderStyle}>ID</th>
                                        <th style={tableHeaderStyle}>Идентификатор</th>
                                        <th style={tableHeaderStyle}>Местоположение</th>
                                        <th style={tableHeaderStyle}>Объект</th>
                                        <th style={tableHeaderStyle}>Статус</th>
                                        <th style={tableHeaderStyle}>Время начала</th>
                                        <th style={tableHeaderStyle}>Время завершения</th>
                                        <th style={tableHeaderStyle}>Бригада</th>
                                        <th style={tableHeaderStyle}>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map(app => (
                                        <tr key={app.id} style={tableRowStyle}>
                                            <td style={tableCellStyle}>{app.id}</td>
                                            <td style={tableCellStyle}>{app.identifier}</td>
                                            <td style={tableCellStyle}>{app.location_name}</td>
                                            <td style={tableCellStyle}>{app.object_name}</td>
                                            <td style={tableCellStyle}>{app.status_name}</td>
                                            <td style={tableCellStyle}>{app.start_time ? new Date(app.start_time).toLocaleString() : '-'}</td>
                                            <td style={tableCellStyle}>{app.end_time ? new Date(app.end_time).toLocaleString() : '-'}</td>
                                            <td style={tableCellStyle}>{app.brigade_number || '-'}</td>
                                            <td style={tableCellStyle}>
                                                <Link to={`/applications/edit/${app.id}`} style={buttonEditStyle}>
                                                    Редактировать
                                                </Link>
                                                <button onClick={() => handleDelete(app.id)} style={buttonDeleteStyle}>
                                                    Удалить
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Блок пагинации */}
                        {totalPages > 1 && (
                            <div style={paginationContainerStyle}>
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    style={currentPage === 1 ? paginationButtonDisabledStyle : paginationButtonStyle}
                                >
                                    Предыдущая
                                </button>
                                <span style={paginationCurrentPageStyle}>
                                    Страница {currentPage} из {totalPages}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    style={currentPage === totalPages ? paginationButtonDisabledStyle : paginationButtonStyle}
                                >
                                    Следующая
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    !loading && !error && <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>Заявок пока нет или они не соответствуют фильтрам.</p>
                )}
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

export default Home;