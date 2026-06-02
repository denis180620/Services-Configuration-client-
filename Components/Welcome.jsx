import React from "react";
import "./welcome.css"; // Подключаем CSS файл

const Welcome = () => {
    return ( // Добавлены скобки для правильного возврата JSX
        <div className="ms3">
            <div className="table-welcome">
                <h2>Вас приветствует приложение поздравления друзей</h2>
                <p><strong>Почему выбирают нас:</strong></p>
                <ul>
                    <li>Постоянно развиваемся</li>
                    <li>Возможность отправить поздравления по разным каналам</li>
                </ul>
            </div>
            <div className="table-wels">
                <h2>Мы работаем</h2>
                <p><strong>Наши партнеры</strong></p>
                <ul>
                    <li>- Telegram</li>
                    <li>- Вконтакте</li>
                    <li>- Роснано</li>
                </ul>
                <p>Отправка сообщения может быть анонимно</p>
                <p>Не записываем личные данные все анонимно</p>
            </div>
            <div className="table-our">
                <h4>О нас</h4>
                <p>Вы можете нас найти:</p>
                <ul>
                    <li>Telegram</li>
                    <li>Email</li>
                    <li>Вконтакте</li>
                </ul>
            </div>
        </div>
    );
}

export default Welcome;