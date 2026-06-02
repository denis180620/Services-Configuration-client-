import React, { useState } from 'react';
import CreateContact from './Contact.jsx';
import CreateTemplate from './Tamplate.jsx';
import TemplateList from './TamplateList.jsx';
import ContactList from './ContactList.jsx';
import './Profile.css'

function Profile() {
    const [activeForm, setActiveForm] = useState('contact');

    // Данные хранятся здесь, в родительском компоненте
    const [templates, setTemplates] = useState([]);

    const [contacts, setContacts] = useState([]);

    // Функция для добавления нового шаблона
    const addTemplate = (newTemplate) => {
        const templateWithId = {
            ...newTemplate,
            id: templates.length + 1
        };
        setTemplates([...templates, templateWithId]);
    };

    // Функция для добавления нового контакта
    const addContact = (newContact) => {
        const contactWithId = {
            ...newContact,
            id: contacts.length + 1
        };
        setContacts([...contacts, contactWithId]);
    };

    return (
        
        <div className="profile-page">
            <div className="profile-top-navbar">
                <div className="profile-title">
                    <h1>🎉 Сервис поздравления друзей</h1>
                </div>
                <div className="profile-nav-buttons">
                    <button
                        className={`profile-nav-btn ${activeForm === 'contact' ? 'active' : ''}`}
                        onClick={() => setActiveForm('contact')}
                    >
                        <span className="btn-icon">👤</span>
                        Создать контакт
                    </button>
                    <button
                        className={`profile-nav-btn ${activeForm === 'template' ? 'active' : ''}`}
                        onClick={() => setActiveForm('template')}
                    >
                        <span className="btn-icon">📝</span>
                        Создать шаблон
                    </button>
                </div>
            </div>

            <div className="profile-main-content">
                <div className="profile-left-column">
                    <div className="form-card">
                        {activeForm === 'contact' ?
                            <CreateContact onAddContact={addContact} /> :
                            <CreateTemplate onAddTemplate={addTemplate} />
                        }
                    </div>
                </div>

                <div className="profile-right-column">
                    {/* Передаем данные в компоненты списков */}
                    <TemplateList templates={templates} />
                    <ContactList contacts={contacts} />
                </div>
            </div>
        </div>
        
    );
}

export default Profile;