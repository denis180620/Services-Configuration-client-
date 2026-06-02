import React, { useState } from "react";
import "./Contact.css";
import { CreateContact } from "../Services/ServicesContact.jsx";

function createContact() {
    const [data, setData] = useState({
        name: '',
        phone: '',
        nikNameTelegram: '',
        idVk: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const submitChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Здесь должен быть ваш API запрос
            const contactData = {
                name: data.name,
                phone: data.phone,
                nikNameTelegram: data.nikNameTelegram,
                idVk: data.idVk,
                email: data.email
            };

            // Имитация отправки на сервер
            const response = await CreateContact(contactData);

            setResult(response);
            // Очистка формы после успешной отправки
            setData({
                name: '',
                phone: '',
                nikNameTelegram: '',
                idVk: '',
                email: ''
            });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="contact-container">
            <div className="contact-form-wrapper">
                <div className="contact-header">
                    <h3>Создание контакта</h3>
                    <p>Заполните информацию о друге или коллеге</p>
                </div>
                <div className="contact-body">
                    <form onSubmit={submitChange}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                <span className="required">*</span> Имя контакта
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={handleChange}
                                placeholder="Введите полное имя"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone" className="form-label">
                                <span className="required">*</span> Номер телефона
                            </label>
                            <input
                                type="tel"
                                className="form-input"
                                id="phone"
                                name="phone"
                                value={data.phone}
                                onChange={handleChange}
                                placeholder="+7 (XXX) XXX-XX-XX"
                                required
                            />
                            <small className="form-hint">Введите номер в международном формате</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="nikNameTelegram" className="form-label">
                                NikName в Telegram
                            </label>
                            <div className="input-with-icon">
                                <span className="input-icon">📱</span>
                                <input
                                    type="text"
                                    className="form-input with-icon"
                                    id="nikNameTelegram"
                                    name="nikNameTelegram"
                                    value={data.nikNameTelegram}
                                    onChange={handleChange}
                                    placeholder="@username или Telegram ID"
                                />
                            </div>
                            <small className="form-hint">Укажите username без @ или ID пользователя</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="idVk" className="form-label">
                                ID ВКонтакте
                            </label>
                            <div className="input-with-icon">
                                <span className="input-icon">🎯</span>
                                <input
                                    type="text"
                                    className="form-input with-icon"
                                    id="idVk"
                                    name="idVk"
                                    value={data.idVk}
                                    onChange={handleChange}
                                    placeholder="vk.com/id123456789"
                                />
                            </div>
                            <small className="form-hint">ID страницы или screen name</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email адрес
                            </label>
                            <div className="input-with-icon">
                                <span className="input-icon">✉️</span>
                                <input
                                    type="email"
                                    className="form-input with-icon"
                                    id="email"
                                    name="email"
                                    value={data.email}
                                    onChange={handleChange}
                                    placeholder="example@mail.com"
                                />
                            </div>
                            <small className="form-hint">Укажите действующий email</small>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Создание контакта...' : 'Создать контакт'}
                        </button>
                    </form>

                    {error && (
                        <div className="alert-error">
                            <strong>Ошибка!</strong> {error.message || "Произошла ошибка при создании контакта"}
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

export default createContact;