import React, { useState } from "react";
import "./Contact.css";
import { CreateContact } from "../Services/ServicesContact.jsx";

function CreateContacts({onAddContact}) {
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
        e.preventDefault();
        const { name, value } = e.target;
        setData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const submitChange = async (e) => {
        try{
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!data.name.trim()) {
            setError({ message: "Имя контакта обязательно" });
            setLoading(false);
            return;
        }
        if (!data.phone.trim()) {
            setError({ message: "Номер телефона обязателен" });
            setLoading(false);
            return;
        }
        
            const contactData = {
                name: data.name,
                phone: data.phone,
                nikNameTelegram: data.nikNameTelegram,
                idVk: data.idVk,
                email: data.email
            };
            
            const response = await CreateContact(contactData);

            if (response?.data?.success) {
                setResult(response.message || "Контакт успешно создан!");

                if (onAddContact) {
                    onAddContact(response.data || contactData);
                }

                // Очистка формы
                setData({
                    name: '',
                    phone: '',
                    nikNameTelegram: '',
                    idVk: '',
                    email: ''
                });

            } else {
                setError({ message: response?.data?.message || "Ошибка при создании контакта" });
            }
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

                        <button type="submit" className="btn-submit" disabled={loading} onClick={submitChange}>
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

export default CreateContacts;