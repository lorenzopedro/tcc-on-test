import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Mensagens.css';

const Mensagens = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/notifications', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data.notifications);
                } else {
                    console.error('Falha ao buscar notificações');
                }
            } catch (error) {
                console.error('Erro ao buscar notificações:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleBack = () => {
        if (user && user.tipo) {
            const dashboardPath = `/dashboard-${user.tipo}`;
            navigate(dashboardPath);
        } else {
            navigate('/login');
        }
    };

    // NOVO: Função para lidar com o clique na mensagem
    const handleMessageClick = async (notification) => {
        // Se a notificação não estiver lida, marca como lida
        if (!notification.read) {
            try {
                await fetch(`http://localhost:5000/api/notifications/${notification._id}/read`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                // Atualiza o estado local para refletir a mudança imediatamente
                setNotifications(prevNotifications => 
                    prevNotifications.map(n => 
                        n._id === notification._id ? { ...n, read: true } : n
                    )
                );

            } catch (error) {
                console.error('Erro ao marcar notificação como lida:', error);
            }
        }
        
        // Navega para o dashboard
        handleBack();
    };


    return (
        <div className="mensagens-container">
            <header className="mensagens-header">
                <h1>Caixa de Entrada</h1>
                <button onClick={handleBack} className="back-button">Voltar ao Painel</button>
            </header>
            <main className="mensagens-main">
                {loading ? (
                    <p>Carregando mensagens...</p>
                ) : notifications.length === 0 ? (
                    <div className="no-messages">
                        <p>Nenhuma mensagem nova.</p>
                    </div>
                ) : (
                    <div className="messages-list">
                        {notifications.map(notif => (
                            // EDITADO: Adicionado onClick e cursor pointer
                            <div 
                                key={notif._id} 
                                className={`message-item ${notif.read ? 'read' : 'unread'}`}
                                onClick={() => handleMessageClick(notif)}
                            >
                                <div className="message-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                    </svg>
                                </div>
                                <div className="message-content">
                                    <p className="message-text">{notif.message}</p>
                                    <span className="message-date">
                                        {new Date(notif.createdAt).toLocaleString('pt-BR')}
                                    </span>
                                    {/* NOVO: Indicador de status */}
                                    <span className={`status-indicator ${notif.read ? 'status-read' : 'status-unread'}`}>
                                        {notif.read ? 'Lida' : 'Não lida'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Mensagens;