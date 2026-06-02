import React, { useState, useEffect, useCallback, useRef } from "react";
import "./CreateMessage.css";
import { SendMessage } from "../Services/ServicesMessageHistory";

function CreateMessage({ contacts = [], templates = [] }) {
    const [messageData, setMessageData] = useState({
        selectedContact: '',
        contactName: '',
        contactPhone: '',
        contactTelegram: '',
        contactVk: '',
        contactEmail: '',
        messageText: '',
        selectedChannel: 'telegram'
    });
    const [searchContact, setSearchContact] = useState('');
    const [searchTemplate, setSearchTemplate] = useState('');
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [filteredTemplates, setFilteredTemplates] = useState([]);
    const [showContactDropdown, setShowContactDropdown] = useState(false);
    const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Используем ref для отслеживания первого рендера и предотвращения бесконечного цикла
    const isFirstRender = useRef(true);
    const prevContactsRef = useRef(contacts);
    const prevTemplatesRef = useRef(templates);

    // Фильтрация контактов при поиске - с защитой от бесконечного цикла
    useEffect(() => {
        // Пропускаем первый рендер
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Проверяем, изменились ли контакты
        const contactsChanged = prevContactsRef.current !== contacts;
        prevContactsRef.current = contacts;

        if (!searchContact || (!contactsChanged && filteredContacts.length === 0 && searchContact)) {
            // Если нет поискового запроса, очищаем
            if (!searchContact) {
                if (filteredContacts.length !== 0) {
                    setFilteredContacts([]);
                    setShowContactDropdown(false);
                }
                return;
            }
        }

        // Выполняем фильтрацию
        const filtered = contacts.filter(contact =>
            contact.name?.toLowerCase().includes(searchContact.toLowerCase()) ||
            contact.phone?.includes(searchContact)
        );

        setFilteredContacts(filtered);
        setShowContactDropdown(filtered.length > 0);

    }, [searchContact, contacts, filteredContacts.length]);

    // Фильтрация шаблонов при поиске
    useEffect(() => {
        if (!searchTemplate) {
            if (filteredTemplates.length !== 0) {
                setFilteredTemplates([]);
                setShowTemplateDropdown(false);
            }
            return;
        }

        const filtered = templates.filter(template =>
            template.name?.toLowerCase().includes(searchTemplate.toLowerCase())
        );

        setFilteredTemplates(filtered);
        setShowTemplateDropdown(filtered.length > 0);

    }, [searchTemplate, templates]);

    // Выбор контакта
    const handleSelectContact = useCallback((contact) => {
        setMessageData(prev => ({
            ...prev,
            selectedContact: contact.id,
            contactName: contact.name,
            contactPhone: contact.phone,
            contactTelegram: contact.nikNameTelegram || '',
            contactVk: contact.idVk || '',
            contactEmail: contact.email || ''
        }));
        setSearchContact(contact.name);
        setShowContactDropdown(false);
    }, []);

    // Выбор шаблона
    const handleSelectTemplate = useCallback((template) => {
        let messageText = template.text;
        if (messageData.contactName) {
            messageText = messageText.replace(/{name}/g, messageData.contactName);
        }

        setMessageData(prev => ({
            ...prev,
            messageText: messageText
        }));
        setSearchTemplate(template.name);
        setShowTemplateDropdown(false);
    }, [messageData.contactName]);

    // Очистка выбранного контакта
    const handleClearContact = useCallback(() => {
        setMessageData(prev => ({
            ...prev,
            selectedContact: '',
            contactName: '',
            contactPhone: '',
            contactTelegram: '',
            contactVk: '',
            contactEmail: ''
        }));
        setSearchContact('');
        setFilteredContacts([]);
        setShowContactDropdown(false);
    }, []);

    // Очистка текста сообщения
    const handleClearMessage = useCallback(() => {
        setMessageData(prev => ({
            ...prev,
            messageText: ''
        }));
    }, []);

    // Выбор канала отправки
    const handleChannelChange = useCallback((channel) => {
        setMessageData(prev => ({
            ...prev,
            selectedChannel: channel
        }));
    }, []);

    // Отправка сообщения
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!messageData.selectedContact) {
            setError("Пожалуйста, выберите контакт для отправки");
            setTimeout(() => setError(null), 3000);
            return;
        }

        if (!messageData.messageText.trim()) {
            setError("Пожалуйста, введите текст сообщения");
            setTimeout(() => setError(null), 3000);
            return;
        }

        let recipientInfo = '';
        switch (messageData.selectedChannel) {
            case 'telegram':
                recipientInfo = messageData.contactTelegram;
                break;
            case 'email':
                recipientInfo = messageData.contactEmail;
                break;
            case 'vk':
                recipientInfo = messageData.contactVk;
                break;
            default:
                recipientInfo = messageData.contactPhone;
        }

        if (!recipientInfo) {
            setError(`У выбранного контакта нет данных для отправки через ${messageData.selectedChannel}`);
            setTimeout(() => setError(null), 3000);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await SendMessage({
                recipientInfo: recipientInfo,
                channel: messageData.selectedChannel,
                content: messageData.messageText
            });

            if (response?.success) {
                setResult(response.message || "Сообщение успешно отправлено!");
                setMessageData(prev => ({
                    ...prev,
                    messageText: ''
                }));
            } else {
                setError(response?.error || "Произошла ошибка при отправке сообщения");
            }

            setTimeout(() => {
                setResult(null);
                setError(null);
            }, 3000);
        } catch (err) {
            setError(err.message || "Произошла ошибка при отправке сообщения");
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Доступные каналы
    const getAvailableChannels = useCallback(() => {
        const channels = [];
        if (messageData.contactPhone) channels.push({ value: 'sms', label: '📱 SMS', icon: '📱' });
        if (messageData.contactTelegram) channels.push({ value: 'telegram', label: '💬 Telegram', icon: '💬' });
        if (messageData.contactEmail) channels.push({ value: 'email', label: '✉️ Email', icon: '✉️' });
        if (messageData.contactVk) channels.push({ value: 'vk', label: '🎯 VK', icon: '🎯' });
        return channels;
    }, [messageData.contactPhone, messageData.contactTelegram, messageData.contactEmail, messageData.contactVk]);

    return (
        <div className="message-container">
            <div className="message-form-wrapper">
                <div className="message-header">
                    <h3>💬 Создание сообщения</h3>
                    <p>Отправьте поздравление другу или коллеге</p>
                </div>

                <div className="message-body">
                    <form onSubmit={handleSubmit}>
                        {/* Поле выбора контакта */}
                        <div className="form-group">
                            <label className="form-label">
                                <span className="required">*</span> Кому отправить
                            </label>
                            <div className="contact-selector">
                                <div className="search-input-wrapper">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Поиск контакта по имени или телефону..."
                                        value={searchContact}
                                        onChange={(e) => setSearchContact(e.target.value)}
                                        onFocus={() => searchContact && setShowContactDropdown(true)}
                                    />
                                    {messageData.contactName && (
                                        <button
                                            type="button"
                                            className="clear-btn"
                                            onClick={handleClearContact}
                                        >
                                            ✖
                                        </button>
                                    )}
                                </div>

                                {showContactDropdown && filteredContacts.length > 0 && (
                                    <div className="dropdown-list">
                                        {filteredContacts.map(contact => (
                                            <div
                                                key={contact.id}
                                                className="dropdown-item"
                                                onClick={() => handleSelectContact(contact)}
                                            >
                                                <div className="dropdown-item-icon">👤</div>
                                                <div className="dropdown-item-info">
                                                    <div className="dropdown-item-name">{contact.name}</div>
                                                    <div className="dropdown-item-detail">{contact.phone}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {showContactDropdown && filteredContacts.length === 0 && searchContact && (
                                    <div className="dropdown-empty">
                                        <p>❌ Контакты не найдены</p>
                                    </div>
                                )}
                            </div>

                            {messageData.contactName && (
                                <div className="selected-contact">
                                    <span className="selected-icon">✅</span>
                                    <span>Выбран контакт: <strong>{messageData.contactName}</strong></span>
                                    <span className="contact-phone">({messageData.contactPhone})</span>
                                </div>
                            )}
                        </div>

                        {/* Выбор канала отправки */}
                        {messageData.selectedContact && getAvailableChannels().length > 0 && (
                            <div className="form-group">
                                <label className="form-label">
                                    📡 Канал отправки
                                </label>
                                <div className="channels-container">
                                    {getAvailableChannels().map(channel => (
                                        <button
                                            key={channel.value}
                                            type="button"
                                            className={`channel-btn ${messageData.selectedChannel === channel.value ? 'active' : ''}`}
                                            onClick={() => handleChannelChange(channel.value)}
                                        >
                                            {channel.icon} {channel.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Поле поиска шаблонов */}
                        <div className="form-group">
                            <label className="form-label">
                                📋 Быстрый шаблон
                            </label>
                            <div className="template-selector">
                                <div className="search-input-wrapper">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Поиск шаблона по названию..."
                                        value={searchTemplate}
                                        onChange={(e) => setSearchTemplate(e.target.value)}
                                        onFocus={() => searchTemplate && setShowTemplateDropdown(true)}
                                    />
                                </div>

                                {showTemplateDropdown && filteredTemplates.length > 0 && (
                                    <div className="dropdown-list">
                                        {filteredTemplates.map(template => (
                                            <div
                                                key={template.id}
                                                className="dropdown-item"
                                                onClick={() => handleSelectTemplate(template)}
                                            >
                                                <div className="dropdown-item-icon">📝</div>
                                                <div className="dropdown-item-info">
                                                    <div className="dropdown-item-name">{template.name}</div>
                                                    <div className="dropdown-item-preview">
                                                        {template.text?.substring(0, 60)}...
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {showTemplateDropdown && filteredTemplates.length === 0 && searchTemplate && (
                                    <div className="dropdown-empty">
                                        <p>❌ Шаблоны не найдены</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Поле ввода текста сообщения */}
                        <div className="form-group">
                            <label className="form-label">
                                <span className="required">*</span> Текст сообщения
                            </label>
                            <div className="message-textarea-wrapper">
                                <textarea
                                    className="message-textarea"
                                    value={messageData.messageText}
                                    onChange={(e) => setMessageData(prev => ({ ...prev, messageText: e.target.value }))}
                                    placeholder="Введите текст вашего поздравления..."
                                    rows="8"
                                    required
                                />
                                {messageData.messageText && (
                                    <button
                                        type="button"
                                        className="clear-message-btn"
                                        onClick={handleClearMessage}
                                        title="Очистить текст"
                                    >
                                        ✖
                                    </button>
                                )}
                            </div>
                            <small className="form-hint">
                                💡 Подсказка: Вы можете использовать переменную {'{name}'} в шаблонах
                            </small>
                        </div>

                        {messageData.messageText && (
                            <div className="message-preview">
                                <div className="preview-header">
                                    <span>👁️ Предпросмотр сообщения</span>
                                </div>
                                <div className="preview-content">
                                    <p>{messageData.messageText}</p>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Отправка...' : '✈️ Отправить сообщение'}
                        </button>
                    </form>

                    {error && (
                        <div className="alert-error">
                            <strong>Ошибка!</strong> {error}
                        </div>
                    )}

                    {result && (
                        <div className="alert-success">
                            <strong>Успешно!</strong> {result}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateMessage;