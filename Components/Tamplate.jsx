import React, { useState } from "react";
import "./Tamplate.css";
import { CreateTemplate } from "../Services/ServicesTamplate.jsx";
function Tamplate() {
    const [data, setData] = useState({
        name: '',
        tamplate: ''
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
            const dataform = await CreateTemplate(data);
            
            setResult(dataform);
            setData({ name: '', tamplate: '' }); // Очистка формы после успешной отправки
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="tamplate-container">
            <div className="tamplate-form-wrapper">
                <div className="tamplate-header">
                    <h3>Создание шаблона</h3>
                </div>
                <div className="tamplate-body">
                    <form onSubmit={submitChange}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Имя шаблона</label>
                            <input
                                type="text"
                                className="form-input"
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={handleChange}
                                placeholder="Введите имя шаблона"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tamplate" className="form-label">Содержимое шаблона</label>
                            <textarea
                                className="form-textarea"
                                id="tamplate"
                                name="tamplate"
                                value={data.tamplate}
                                onChange={handleChange}
                                placeholder="Введите текст шаблона здесь..."
                                rows="6"
                                required
                            />
                            <small className="form-hint">Поддерживается многострочный текст</small>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Создание...' : 'Создать шаблон'}
                        </button>
                    </form>

                    {error && (
                        <div className="alert-error">
                            <strong>Ошибка!</strong> {error.message || "Произошла ошибка при создании шаблона"}
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

export default Tamplate;