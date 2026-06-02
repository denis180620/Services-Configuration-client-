import React, { useState } from 'react';
import CreateMessage from './CreateMessage.jsx';
import MessageHistory from './MessageHistory.jsx';
import './MessagePage.css';

function MessagePage() {
    const [activeTab, setActiveTab] = useState('create'); // Используем activeTab, а не activeView

    // Данные для сообщений
    const [contacts] = useState();

    const [templates] = useState();

    const [refreshHistory, setRefreshHistory] = useState(false);

    const handleMessageSent = () => {
        setRefreshHistory(prev => !prev);
    };

    return (
        <div className="message-page">
            <div className="message-top-navbar">
                <div className="message-title">
                    <h1>💬 Отправка сообщений</h1>
                </div>
                <div className="message-nav-buttons">
                    <button
                        className={`message-nav-btn ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        <span className="btn-icon">✏️</span>
                        Создать сообщение
                    </button>
                    <button
                        className={`message-nav-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <span className="btn-icon">📜</span>
                        История сообщений
                    </button>
                </div>
            </div>

            <div className="message-main-content">
                {activeTab === 'create' ? (
                    <div className="message-left-column">
                        <div className="message-form-card">
                            <CreateMessage
                                contacts={contacts}
                                templates={templates}
                                onMessageSent={handleMessageSent}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="message-full-width">
                        <MessageHistory refreshTrigger={refreshHistory} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessagePage;