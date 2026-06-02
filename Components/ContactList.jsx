import React, { useState, useEffect } from "react";
import { GetContacts, DeleteContact } from "../Services/ServicesContact.jsx";

function ContactList() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [deletingId, setDeletingId] = useState(null); // Для отслеживания удаляемого контакта

    // Автоматический запрос контактов при загрузке компонента
    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await GetContacts();
            // Проверяем структуру ответа от сервера
            if (response.success) {
                setContacts(response.data || []);
            } else {
                setContacts(response.data || []);
            }
        } catch (err) {
            setError(err.message || "Ошибка при загрузке контактов");
        } finally {
            setLoading(false);
        }
    };

    // Обработчик удаления контакта
    const handleDeleteContact = async (contact, event) => {
        event.stopPropagation(); // Останавливаем всплытие события, чтобы не открывался детальный просмотр

        // Подтверждение удаления
        const confirmDelete = window.confirm(`Вы уверены, что хотите удалить контакт "${contact.name}"?`);
        if (!confirmDelete) return;

        setDeletingId(contact.id);

        try {
            // Отправляем данные на сервер: id и name
            const deleteData = {
                id: contact.id,
                name: contact.name
            };

            const response = await DeleteContact(deleteData);

            if (response.success) {
                // Удаляем контакт из локального состояния
                setContacts(prevContacts => prevContacts.filter(c => c.id !== contact.id));

                // Если удаленный контакт был выбран, закрываем детальный просмотр
                if (selectedContact?.id === contact.id) {
                    setSelectedContact(null);
                }

                // Показываем уведомление об успехе
                alert(`Контакт "${contact.name}" успешно удален`);
            } else {
                throw new Error(response.error || "Ошибка при удалении");
            }
        } catch (err) {
            setError(err.message || "Ошибка при удалении контакта");
            setTimeout(() => setError(null), 3000);
        } finally {
            setDeletingId(null);
        }
    };

    const handleContactClick = (contact) => {
        setSelectedContact(selectedContact?.id === contact.id ? null : contact);
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        alert(`${field} скопирован в буфер обмена!`);
    };

    // Фильтрация контактов по поиску
    const filteredContacts = contacts.filter(contact =>
        contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="contacts-bottom-right">
            <div className="contacts-wrapper">
                <div className="contacts-header">
                    <h3>Мои контакты</h3>
                    <button onClick={fetchContacts} className="refresh-btn" disabled={loading}>
                        {loading ? "Загрузка..." : "Обновить"}
                    </button>
                </div>

                {/* Поиск контактов */}
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
                            <button onClick={fetchContacts} className="retry-btn">Повторить</button>
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="empty-state">
                            <p> {searchTerm ? "Контакты не найдены" : "Нет сохраненных контактов"}</p>
                            {!searchTerm && <p>Добавьте свой первый контакт</p>}
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
                                                    <p>{contact.phone}</p>
                                                    <button
                                                        className="copy-detail-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyToClipboard(contact.phone, "Телефон");
                                                        }}
                                                    >
                                                        Копировать
                                                    </button>
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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(contact.nikNameTelegram, "Telegram");
                                                            }}
                                                        >
                                                            Копировать
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {contact.idVk && (
                                                <div className="detail-item">
                                                    <span className="detail-icon"></span>
                                                    <div className="detail-content">
                                                        <label>VK ID:</label>
                                                        <p>{contact.idVk}</p>
                                                        <button
                                                            className="copy-detail-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(contact.idVk, "VK ID");
                                                            }}
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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(contact.email, "Email");
                                                            }}
                                                        >
                                                            Копировать
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Кнопка удаления в деталях */}
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