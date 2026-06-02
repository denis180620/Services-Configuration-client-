import React from "react";
import './Header.css';

const Header = ({
    activeTab, 
    setActiveTab,
    onLoginClick,
    onRegisterClick,
    onLogoutClick,
    isAuthenticated
}) =>{
    const tabs = [
        {id: 'welcome', label: 'Приветствие'},
        {id: 'profile', label: 'Профиль'},
        {id: "message", label: 'Сообщение'},

    ];

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <h2>Сервис Поздравления</h2>
                </div>
                <nav className="nav-tabs">
                    {tabs.map(tab =>(
                        <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="auth-buttons">
                    {!isAuthenticated ? (
                        <>
                    <button className="btn-login" onClick={onLoginClick}>Вход</button>
                    <button className="btn-register" onClick={onRegisterClick}>Регистрация</button>
                    </>
                    ) : (
                        <button className="bth-logout" onClick={onLogoutClick}>Выйти</button>
                    )}
                </div>
            </div>
        </header>
    );
    };
export default Header;