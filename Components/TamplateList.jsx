import React, { useState, useEffect } from "react";
import { ListTamplate, DeleteTamplate } from "../Services/ServicesTamplate.jsx";

function TemplateLists() {
    const [template, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [deletingId, setDeletingId] = useState(null); // Для отслеживания удаляемого шаблона

    // Автоматический запрос шаблонов при загрузке компонента
    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await ListTamplate();
            // Проверяем структуру ответа от сервера
            if (response.success) {
                setTemplates(response.data || []);
            } else {
                setTemplates(response.data || []);
            }
        } catch (err) {
            setError(err.message || "Ошибка при загрузке шаблонов");
        } finally {
            setLoading(false);
        }
    };

    // Обработчик удаления шаблона
    const handleDeleteTemplate = async (template, event) => {
        event.stopPropagation(); // Останавливаем всплытие события

        // Подтверждение удаления
        const confirmDelete = window.confirm(`Вы уверены, что хотите удалить шаблон "${template.name}"?`);
        if (!confirmDelete) return;

        setDeletingId(template.id);

        try {
            // Отправляем данные на сервер
            const deleteData = {
                id: template.id,
                name: template.name,
                content: template.content
            };

            const response = await DeleteTamplate(deleteData);

            if (response.success) {
                // Удаляем шаблон из локального состояния
                setTemplates(prevTemplates => prevTemplates.filter(t => t.id !== template.id));

                // Если удаленный шаблон был выбран, закрываем детальный просмотр
                if (selectedTemplate?.id === template.id) {
                    setSelectedTemplate(null);
                }

                // Показываем уведомление об успехе
                alert(`Шаблон "${template.name}" успешно удален`);
            } else {
                throw new Error(response.error || "Ошибка при удалении");
            }
        } catch (err) {
            setError(err.message || "Ошибка при удалении шаблона");
            setTimeout(() => setError(null), 3000);
        } finally {
            setDeletingId(null);
        }
    };

    const handleTemplateClick = (template) => {
        setSelectedTemplate(selectedTemplate?.id === template.id ? null : template);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Текст скопирован в буфер обмена!");
    };

    return (
        <div className="templates-bottom-left">
            <div className="templates-wrapper">
                <div className="templates-header">
                    <h3>Мои шаблоны</h3>
                    <button onClick={fetchTemplates} className="refresh-btn" disabled={loading}>
                        {loading ? "Загрузка..." : "Обновить"}
                    </button>
                </div>

                <div className="templates-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Загрузка шаблонов...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>⚠️ {error}</p>
                            <button onClick={fetchTemplates} className="retry-btn">Повторить</button>
                        </div>
                    ) : template.length === 0 ? (
                        <div className="empty-state">
                            <p>📭 Нет сохраненных шаблонов</p>
                            <p>Создайте свой первый шаблон</p>
                        </div>
                    ) : (
                        <div className="templates-list">
                            {template.map((template) => (
                                <div
                                    key={template.id}
                                    className={`template-item ${selectedTemplate?.id === template.id ? 'expanded' : ''}`}
                                >
                                    <div
                                        className="template-name"
                                        onClick={() => handleTemplateClick(template)}
                                    >
                                        <span className="template-icon">📝</span>
                                        <h4>{template.name}</h4>
                                        <div className="template-actions">
                                            <button
                                                className="delete-template-btn"
                                                onClick={(e) => handleDeleteTemplate(template, e)}
                                                disabled={deletingId === template.id}
                                                title="Удалить шаблон"
                                            >
                                                {deletingId === template.id ? "⏳" : "🗑️"}
                                            </button>
                                            <span className="expand-icon">
                                                {selectedTemplate?.id === template.id ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedTemplate?.id === template.id && (
                                        <div className="template-text-wrapper">
                                            <div className="template-text">
                                                <p>{template.content}</p>
                                            </div>
                                            <div className="template-buttons">
                                                <button
                                                    className="copy-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(template.content);
                                                    }}
                                                >
                                                    📋 Копировать текст
                                                </button>
                                                <button
                                                    className="delete-template-full-btn"
                                                    onClick={(e) => handleDeleteTemplate(template, e)}
                                                    disabled={deletingId === template.id}
                                                >
                                                    {deletingId === template.id ? "Удаление..." : "🗑️ Удалить шаблон"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TemplateLists;