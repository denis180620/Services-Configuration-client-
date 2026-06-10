import React, { useState, useEffect, useCallback, useRef } from "react";
import "./CreateMessage.css";
import { SendMessage } from "../Services/ServicesMessageHistory";
import { GetContacts } from "../Services/ServicesContact";
import { ListTamplate } from "../Services/ServicesTamplate";

function CreateMessage() {
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
    const [contacts, setContacts] = useState([]);
    const [tamplates, setTamplate] = useState([]);
    const [searchContact, setSearchContact] = useState('');
    const [searchTemplate, setSearchTemplate] = useState('');
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [filteredTemplates, setFilteredTemplates] = useState([]);
    const [showContactDropdown, setShowContactDropdown] = useState(false);
    const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const contactDropdownRef = useRef(null);
    const templateDropdownRef = useRef(null);
    const contactInputRef = useRef(null);
    const templateInputRef = useRef(null);

    // Закрытие dropdown при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contactDropdownRef.current &&
                !contactDropdownRef.current.contains(event.target) &&
                contactInputRef.current &&
                !contactInputRef.current.contains(event.target)) {
                setShowContactDropdown(false);
            }
            if (templateDropdownRef.current &&
                !templateDropdownRef.current.contains(event.target) &&
                templateInputRef.current &&
                !templateInputRef.current.contains(event.target)) {
                setShowTemplateDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Запрос контактов
    useEffect(() => {
        const FetchGetContacts = async () => {
            try {
                const response = await GetContacts();
                if (response.data) {
                    setContacts(response.data);
                }
            } catch (err) {
                console.error(err);
                setError("Не удалось найти контакты");
            }
        };
        FetchGetContacts();
    }, []);

    // Запрос шаблонов
    useEffect(() => {
        const FetchGetTampalte = async () => {
            try {
                const response = await ListTamplate();
                if (response.data) {
                    setTamplate(response.data);
                }
            } catch (err) {
                console.error(err);
                setError("Не удалось загрузить шаблоны");
            } finally {
                setLoadingData(false);
            }
        };
        FetchGetTampalte();
    }, []);

    // Фильтрация контактов
    useEffect(() => {
        if (!searchContact.trim()) {
            setFilteredContacts([]);
            setShowContactDropdown(false);
            return;
        }

        const filtered = contacts.filter(contact =>
            contact.name?.toLowerCase().includes(searchContact.toLowerCase()) ||
            contact.phone?.includes(searchContact)
        );

        setFilteredContacts(filtered);
        setShowContactDropdown(filtered.length > 0);
    }, [searchContact, contacts]);

    // Фильтрация шаблонов
    useEffect(() => {
        if (!searchTemplate.trim()) {
            setFilteredTemplates([]);
            setShowTemplateDropdown(false);
            return;
        }

        const filtered = tamplates.filter(tamplate =>
            tamplate.name?.toLowerCase().includes(searchTemplate.toLowerCase())
        );

        setFilteredTemplates(filtered);
        setShowTemplateDropdown(filtered.length > 0);
    }, [searchTemplate, tamplates]);

    const handleSelectContact = useCallback((contact) => {
        setMessageData(prev => ({
            ...prev,
            selectedContact: contact.id,
            contactName: contact.name,
            contactPhone: contact.phone || '',
            contactTelegram: contact.nikNameTelegram || '',
            contactVk: contact.idVk || '',
            contactEmail: contact.email || ''
        }));
        setSearchContact(contact.name);
        setShowContactDropdown(false);
    }, []);

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

    const handleClearMessage = useCallback(() => {
        setMessageData(prev => ({
            ...prev,
            messageText: ''
        }));
    }, []);

    const handleChannelChange = useCallback((channel) => {
        setMessageData(prev => ({
            ...prev,
            selectedChannel: channel
        }));
    }, []);

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

    const getAvailableChannels = useCallback(() => {
        const channels = [];
        if (messageData.contactPhone) channels.push({ value: 'sms', label: '📱 SMS', icon: '📱' });
        if (messageData.contactTelegram) channels.push({ value: 'telegram', label: '💬 Telegram', icon: '💬' });
        if (messageData.contactEmail) channels.push({ value: 'email', label: '✉️ Email', icon: '✉️' });
        if (messageData.contactVk) channels.push({ value: 'vk', label: '🎯 VK', icon: '🎯' });
        return channels;
    }, [messageData.contactPhone, messageData.contactTelegram, messageData.contactEmail, messageData.contactVk]);

    if (loadingData) {
        return (
            <div className="message-container">
                <div className="loading-spinner">Загрузка данных...</div>
            </div>
        );
    }

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
                                        ref={contactInputRef}
                                        type="text"
                                        className="form-input"
                                        placeholder="Поиск контакта по имени или телефону..."
                                        value={searchContact}
                                        onChange={(e) => {
                                            setSearchContact(e.target.value);
                                            setShowContactDropdown(true);
                                        }}
                                        onFocus={() => {
                                            setShowContactDropdown(true);
                                        }}
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

                                {/* Выпадающий список контактов */}
                                {showContactDropdown && (
                                    <div className="dropdown-overlay">
                                        <div className="dropdown-list" ref={contactDropdownRef}>
                                            {filteredContacts.length > 0 ? (
                                                filteredContacts.map(contact => (
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
                                                ))
                                            ) : (
                                                <div className="dropdown-empty">
                                                    <p>❌ Контакты не найдены</p>
                                                </div>
                                            )}
                                        </div>
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
                                        ref={templateInputRef}
                                        type="text"
                                        className="form-input"
                                        placeholder="Поиск шаблона по названию..."
                                        value={searchTemplate}
                                        onChange={(e) => {
                                            setSearchTemplate(e.target.value);
                                            setShowTemplateDropdown(true);
                                        }}
                                        onFocus={() => {
                                            setShowTemplateDropdown(true);
                                        }}
                                    />
                                </div>

                                {/* Выпадающий список шаблонов */}
                                {showTemplateDropdown && (
                                    <div className="dropdown-overlay">
                                        <div className="dropdown-list" ref={templateDropdownRef}>
                                            {filteredTemplates.length > 0 ? (
                                                filteredTemplates.map(template => (
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
                                                ))
                                            ) : (
                                                <div className="dropdown-empty">
                                                    <p>❌ Шаблоны не найдены</p>
                                                </div>
                                            )}
                                        </div>
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
                            <strong>Ошибка!</strong> 
                        </div>
                    )}

                    {result && (
                        <div className="alert-success">
                            <strong>Успешно!</strong> 
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateMessage;