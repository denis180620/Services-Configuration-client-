import React, { useState, useEffect } from 'react';
import CreateContacts from './Contact.jsx';
import CreateTemplate from './Tamplate.jsx';
import TemplateLists from './TamplateList.jsx';
import ContactList from './ContactList.jsx';
import './Profile.css'

function Profile() {
    const [activeForm, setActiveForm] = useState('contact');

    // Данные хранятся здесь, в родительском компоненте
    const [templates, setTemplates] = useState([]);

    const [contacts, setContacts] = useState([]);



    const addTemplate = (newTemplate) => {
        setTemplates(prev => [newTemplate, ...prev]);

    };


    const addContact = (newContact) => {
        setContacts(prev => [newContact, ...prev]);

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
                            <CreateContacts onAddContact={addContact} /> :
                            <CreateTemplate onAddTemplate={addTemplate} />
                        }
                    </div>
                </div>

                <div className="profile-right-column">


                    <ContactList contacts={contacts} setContacts={setContacts} />
                    <TemplateLists templates={templates} setTemplates={setTemplates} />
                </div>
            </div>
        </div>
        
    );
}


export default Profile;