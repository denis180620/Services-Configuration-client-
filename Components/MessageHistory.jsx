import React, { useState, useEffect } from "react";
import { GetMessageHistory } from "../Services/ServicesMessageHistory";
import "./MessageHistory.css";

function MessageHistory() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all"); // all, sent, received, draft

    // Автоматический запрос истории сообщений при загрузке компонента
    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try{
            console.log('fetchMessages started');
        setLoading(true);
        setError(null);

        
            const response = await GetMessageHistory();
            console.log(response);
            setMessages(response.messages || []);
        } catch (err) {
            console.error('Ошибка в fetchMessages:', err);
            setError(err.message || "Ошибка при загрузке истории сообщений");
        } finally {
            setLoading(false);
        }
    };

    const handleMessageClick = (message) => {
        setSelectedMessage(selectedMessage?.id === message.id ? null : message);
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        alert(`${field} скопирован в буфер обмена!`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'read': return '📖';
            case 'failed': return '❌';
            default: return '📨';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Sent': return 'Доставлено';;
            case 'Failed': return 'Ошибка';
            default: return 'Отправлено';
        }
    };

    const getChannelIcon = (channel) => {
        switch (channel) {
            case 'telegram': return '💬';
            case 'email': return '✉️';
            case 'vk': return '🎯';
            default: return '📱';
        }
    };

    // Фильтрация сообщений по поиску и статусу
    const filteredMessages = messages.filter(message => {
        const matchesSearch =
            message.recipientInfo.includes(searchTerm) ||
            message.contentPreview.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filter === "all" || message.status === filter; 

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="message-history-container">
            <div className="message-history-wrapper">
                <div className="message-history-header">
                    <h3>📨 История сообщений</h3>
                    <button onClick={fetchMessages} className="refresh-btn" disabled={loading}>
                        {loading ? "Загрузка..." : "Обновить"}
                    </button>
                </div>

                {/* Фильтры */}
                <div className="filter-bar">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Все
                    </button>
                    <button
                        className={`filter-btn ${filter === 'Sent' ? 'active' : ''}`}
                        onClick={() => setFilter('Sent')}
                    >
                        Доставленные
                    </button>
                    <button
                        className={`filter-btn ${filter === 'Failed' ? 'active' : ''}`}
                        onClick={() => setFilter('Failed')}
                    >
                        С ошибкой
                    </button>
                </div>

                {/* Поиск сообщений */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="🔍 Поиск по имени, телефону или тексту сообщения..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="messages-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Загрузка истории сообщений...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>⚠️ {error}</p>
                            <button onClick={fetchMessages} className="retry-btn">Повторить</button>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="empty-state">
                            <p>📭 {searchTerm ? "Сообщения не найдены" : "Нет отправленных сообщений"}</p>
                            {!searchTerm && <p>Отправьте свое первое поздравление</p>}
                        </div>
                    ) : (
                        <div className="messages-list">
                            {filteredMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`message-item ${selectedMessage?.id === message.id ? 'expanded' : ''}`}
                                >
                                    <div
                                        className="message-preview"
                                        onClick={() => handleMessageClick(message)}
                                    >
                                        <div className="message-preview-header">
                                            <div className="recipient-info">
                                                <span className="recipient-icon">👤</span>
                                                <strong>{message.recipientName}</strong>
                                                <span className="recipient-contact">{message.recipientPhone}</span>
                                            </div>
                                            <div className="message-meta">
                                                <span className="channel-icon" title={message.channel}>
                                                    {getChannelIcon(message.channel)}
                                                </span>
                                                <span className="status-icon" title={getStatusText(message.status)}>
                                                    {getStatusIcon(message.status)}
                                                </span>
                                                <span className="message-date">{formatDate(message.sentAt)}</span>
                                                <span className="expand-icon">
                                                    {selectedMessage?.id === message.id ? '▲' : '▼'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="message-preview-text">
                                            {message.contentPreview.length > 100
                                                ? message.contentPreview.substring(0, 100) + '...'
                                                : message.contentPreview}
                                        </div>
                                    </div>

                                    {selectedMessage?.id === message.id && (
                                        <div className="message-details">
                                            <div className="detail-section">
                                                <div className="detail-item">
                                                    <span className="detail-icon">📝</span>
                                                    <div className="detail-content">
                                                        <label>Полный текст сообщения:</label>
                                                        <p className="full-message-text">{message.contentPreview}</p>
                                                        <button
                                                            className="copy-detail-btn"
                                                            onClick={() => copyToClipboard(message.contentPreview, "Текст сообщения")}
                                                        >
                                                            Копировать текст
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="detail-row">
                                                    <div className="detail-item-small">
                                                        <span className="detail-icon">👤</span>
                                                        <div className="detail-content">
                                                            <label>Получатель:</label>
                                                            <p>{message.recipientName}</p>
                                                        </div>
                                                    </div>

                                                    <div className="detail-item-small">
                                                        <span className="detail-icon">📞</span>
                                                        <div className="detail-content">
                                                            <label>Телефон:</label>
                                                            <p>{message.recipientPhone}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="detail-row">
                                                    <div className="detail-item-small">
                                                        <span className="detail-icon">📱</span>
                                                        <div className="detail-content">
                                                            <label>Контакт:</label>
                                                            <p>{message.recipientInfo}</p>
                                                        </div>
                                                    </div>

                                                    <div className="detail-item-small">
                                                        <span className="detail-icon">📋</span>
                                                        <div className="detail-content">
                                                            <label>Использованный шаблон:</label>
                                                            <p>{message.templateName || "Пользовательский текст"}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="detail-row">
                                                    <div className="detail-item-small">
                                                        <span className="detail-icon">📅</span>
                                                        <div className="detail-content">
                                                            <label>Дата отправки:</label>
                                                            <p>{formatDate(message.sentAt)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="detail-item-small">
                                                        <span className="detail-icon">{getChannelIcon(message.channel)}</span>
                                                        <div className="detail-content">
                                                            <label>Канал отправки:</label>
                                                            <p>{message.channel === 'telegram' ? 'Telegram' :
                                                                message.channel === 'email' ? 'Email' :
                                                                    message.channel === 'vk' ? 'VK' : 'Другой'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="detail-row">
                                                    <div className="detail-item-small">
                                                        <span className="detail-icon">{getStatusIcon(message.status)}</span>
                                                        <div className="detail-content">
                                                            <label>Статус:</label>
                                                            <p className={`status-${message.status}`}>
                                                                {getStatusText(message.status)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MessageHistory;