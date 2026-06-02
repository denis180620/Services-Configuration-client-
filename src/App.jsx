import { useState } from 'react';
import { AuthProvider, useAuth } from '../AuthComponent/AuthContext';
import Header from '../Components/Layout/Header.jsx';
import Login from '../AuthComponent/AuthLogin.jsx';
import Register from '../AuthComponent/AuthRegister.jsx';
import Welcome from '../Components/Welcome.jsx';
import Profile from '../Components/Profile.jsx';
import MessagePage from '../Components/MessagePage.jsx';
import './App.css';

const AppContent = () => {
    const [activeTab, setActiveTab] = useState('welcome');
    const [showAuthPage, setShowAuthPage] = useState(null);
    const { isAuthenticated, logout } = useAuth(); 

    const handleShowLogin = () => {
        setShowAuthPage('login');
    };

    const handleShowRegister = () => {
        setShowAuthPage('register');
    };

    const handleBackToApp = () => {
        setShowAuthPage(null);
    };

    const handleLogout = async () => {
        await logout();
        setActiveTab('welcome');
        setShowAuthPage(null);
    };

    // Если показываем страницу входа
    if (showAuthPage === 'login') {
        return (
            <div className="app">
                <Header
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onLoginClick={handleShowLogin}
                    onRegisterClick={handleShowRegister}
                    onLogoutClick={handleLogout}
                    isAuthenticated={isAuthenticated}
                />
                <Login
                    onSwitchToRegister={handleShowRegister}
                    onBackToApp={handleBackToApp}
                />
            </div>
        );
    }

    // Если показываем страницу регистрации
    if (showAuthPage === 'register') {
        return (
            <div className="app">
                <Header
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onLoginClick={handleShowLogin}
                    onRegisterClick={handleShowRegister}
                    onLogoutClick={handleLogout}
                    isAuthenticated={isAuthenticated}
                />
                <Register
                    onSwitchToLogin={handleShowLogin}
                    onBackToApp={handleBackToApp}
                />
            </div>
        );
    }

    // Проверка авторизации для защищенных страниц
    const showAuthRequired = () => {
        if (!isAuthenticated && activeTab !== 'welcome') {
            return (
                <div className="auth-required-page">
                    <div className="auth-required-card">
                        <h2> Требуется авторизация</h2>
                        <p>Для доступа к странице "{activeTab === 'profile' ? 'Профиль': 'Сообщения'}" необходимо войти в аккаунт</p>
                        <div className="auth-required-buttons">
                            <button onClick={handleShowLogin} className="btn-primary">Войти</button>
                            <button onClick={handleShowRegister} className="btn-secondary">Зарегистрироваться</button>
                        </div>
                        <button onClick={() => setActiveTab('welcome')} className="btn-back">
                            Вернуться на главную
                        </button>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderContent = () => {
        const authRequired = showAuthRequired();
        if (authRequired) return authRequired;

        switch (activeTab) {
            case 'welcome':
               return <Welcome />;
            case 'profile':
               return <Profile />;
            case 'message':
                return <MessagePage />;
            default:
                return <Welcome />;
        }
    };

    return (
        <div className="app">
            <Header
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLoginClick={handleShowLogin}
                onRegisterClick={handleShowRegister}
                onLogoutClick={handleLogout}
                isAuthenticated={isAuthenticated}
            />
            <main className="main-container">
                {renderContent()}
            </main>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;