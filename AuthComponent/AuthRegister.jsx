import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const Register = ({ onSwitchToLogin, onBackToApp }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        userName: ''  
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!formData.userName.trim()) {  // ✅ Исправлено: userName
            setError('Введите имя пользователя');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            setLoading(false);
            return;
        }

        // ✅ Исправлено: передаем правильные поля
        const result = await register({
            email: formData.email,
            password: formData.password,
            userName: formData.userName  // ✅ Исправлено: userName
        });

        if (result.success) {
            setSuccess('Регистрация успешна! Теперь вы можете войти.');
            setTimeout(() => {
                if (onSwitchToLogin) onSwitchToLogin();
            }, 2000);
        } else {
            setError(result.message || 'Ошибка регистрации');
        }
        setLoading(false);
    };

    return (
        <div className="main">
            <div className="background-gradient"></div>
            <div className="app">
                <div className="auth-card">
                    <h2>Регистрация</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Имя пользователя</label>
                            <input
                                type="text"
                                name="userName"  // ✅ Исправлено: userName (с маленькой буквы)
                                value={formData.userName}
                                onChange={handleChange}
                                required
                                placeholder="Иванов Иван Иванович"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="example@mail.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Пароль</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Минимум 6 символов"
                            />
                        </div>

                        <div className="form-group">
                            <label>Подтверждение пароля</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Повторите пароль"
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </button>
                    </form>

                    <p className="auth-link">
                        Уже есть аккаунт?{' '}
                        <button type="button" onClick={onSwitchToLogin} className="link-button">
                            Войти
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;