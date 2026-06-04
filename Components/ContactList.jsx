import React, { useState, useEffect } from "react";
import { DeleteContact } from "../Services/ServicesContact.jsx";

function ContactList({ contacts = [], setContacts }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const handleDeleteContact = async (contact, event) => {
        if (event) event.stopPropagation();

        const confirmDelete = window.confirm(`Вы уверены, что хотите удалить контакт "${contact.name}"?`);
        if (!confirmDelete) return;

        setDeletingId(contact.id);
        setError(null);

        try {
            const deleteData = {
                id: contact.id,
                name: contact.name
            };

            const response = await DeleteContact(deleteData);
            console.log('Delete response:', response);

            if (response?.success) {
                // Удаляем контакт из локального состояния
                if (setContacts) {
                    setContacts(prevContacts => prevContacts.filter(c => c.id !== contact.id));
                }

                if (selectedContact?.id === contact.id) {
                    setSelectedContact(null);
                }

                alert(`Контакт "${contact.name}" успешно удален`);
            } else {
                throw new Error(response?.message || "Ошибка при удалении");
            }
        } catch (err) {
            console.error('Delete error:', err);
            setError(err.message || "Ошибка при удалении контакта");
            setTimeout(() => setError(null), 3000);
        } finally {
            setDeletingId(null);
        }
    };

    const handleContactClick = (contact) => {
        setSelectedContact(selectedContact?.id === contact.id ? null : contact);
    };

    const copyToClipboard = (text, field, event) => {
        if (event) event.stopPropagation();
        navigator.clipboard.writeText(text);
        alert(`${field} скопирован в буфер обмена!`);
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="contacts-bottom-right">
            <div className="contacts-wrapper">
                <div className="contacts-header">
                    <h3>Мои контакты ({contacts.length})</h3>
                </div>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="🔍 Поиск по имени, телефону или email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="contacts-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Загрузка контактов...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>⚠️ {error}</p>
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="empty-state">
                            <p>{searchTerm ? "Контакты не найдены" : "Нет сохраненных контактов"}</p>
                            {!searchTerm && <p>Добавьте свой первый контакт через форму слева</p>}
                        </div>
                    ) : (
                        <div className="contacts-list">
                            {filteredContacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    className={`contact-item ${selectedContact?.id === contact.id ? 'expanded' : ''}`}
                                >
                                    <div
                                        className="contact-name"
                                        onClick={() => handleContactClick(contact)}
                                    >
                                        <span className="contact-icon">👤</span>
                                        <h4>{contact.name}</h4>
                                        <div className="contact-actions">
                                            <button
                                                className="delete-contact-btn"
                                                onClick={(e) => handleDeleteContact(contact, e)}
                                                disabled={deletingId === contact.id}
                                                title="Удалить контакт"
                                            >
                                                {deletingId === contact.id ? "⏳" : "🗑️"}
                                            </button>
                                            <span className="expand-icon">
                                                {selectedContact?.id === contact.id ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedContact?.id === contact.id && (
                                        <div className="contact-details">
                                            <div className="detail-item">
                                                <span className="detail-icon">📱</span>
                                                <div className="detail-content">
                                                    <label>Телефон:</label>
                                                    <p>{contact.phone || "—"}</p>
                                                    {contact.phone && (
                                                        <button
                                                            className="copy-detail-btn"
                                                            onClick={(e) => copyToClipboard(contact.phone, "Телефон", e)}
                                                        >
                                                            Копировать
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {contact.nikNameTelegram && (
                                                <div className="detail-item">
                                                    <span className="detail-icon">💬</span>
                                                    <div className="detail-content">
                                                        <label>Telegram:</label>
                                                        <p>{contact.nikNameTelegram}</p>
                                                        <button
                                                            className="copy-detail-btn"
                                                            onClick={(e) => copyToClipboard(contact.nikNameTelegram, "Telegram", e)}
                                                        >
                                                            Копировать
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {contact.idVk && (
                                                <div className="detail-item">
                                                    <span className="detail-icon">🌐</span>
                                                    <div className="detail-content">
                                                        <label>VK ID:</label>
                                                        <p>{contact.idVk}</p>
                                                        <button
                                                            className="copy-detail-btn"
                                                            onClick={(e) => copyToClipboard(contact.idVk, "VK ID", e)}
                                                        >
                                                            Копировать
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {contact.email && (
                                                <div className="detail-item">
                                                    <span className="detail-icon">✉️</span>
                                                    <div className="detail-content">
                                                        <label>Email:</label>
                                                        <p>{contact.email}</p>
                                                        <button
                                                            className="copy-detail-btn"
                                                            onClick={(e) => copyToClipboard(contact.email, "Email", e)}
                                                        >
                                                            Копировать
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="detail-item delete-section">
                                                <button
                                                    className="delete-full-btn"
                                                    onClick={(e) => handleDeleteContact(contact, e)}
                                                    disabled={deletingId === contact.id}
                                                >
                                                    {deletingId === contact.id ? "Удаление..." : "🗑️ Удалить контакт"}
                                                </button>
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

export default ContactList;