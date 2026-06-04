import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const Login = ({ onSwitchToRegister, onLoginSuccess, onClose, onBackToApp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');  // 👈 Исправлено: SetPassword → setPassword
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

         try {
            const result = await login(email, password);

            if (result?.success) {
                
                if (onLoginSuccess) {
                    onLoginSuccess(result);
                }
                if (onBackToApp) {
                    onBackToApp(); 
                }
            } else {
                setError(result?.message || "Неправильный логин или пароль");
            }
        } catch (err) {
            setError("Ошибка подключения к серверу");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="main">
            <div className="background-gradient"></div>
            <div className="app">
                <div className="auth-card">
                    <h1>Вход в Сервис</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="example@mail.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Пароль</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <button type="submit" disabled={loading}>
                            {loading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>
                    <p className="auth-link">
                        Нет аккаунта?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className="link-button"
                        >
                            Зарегистрироваться
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;