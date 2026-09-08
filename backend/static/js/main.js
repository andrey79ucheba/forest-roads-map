/**
 * main.js — Главный файл для инициализации всех компонентов
 * Подключает карту, таблицу, авторизацию и другие модули
 */

document.addEventListener('DOMContentLoaded', function () {
    console.log('Приложение загружено');

    // Проверяем, на какой странице мы находимся
    const currentPage = window.location.pathname;

    // Если мы на главной странице с картой
    if (currentPage === '/' || currentPage === '/index.html') {
        console.log('Загрузка карты...');
        // Функции из map.js должны быть доступны глобально
        // Они вызываются автоматически из map.js
    }

    // Если мы на странице с таблицей
    if (currentPage === '/roads-info/' || currentPage === '/roads-info.html') {
        console.log('Загрузка таблицы...');
        // Функции из table.js должны быть доступны глобально
        // Они вызываются автоматически из table.js
    }

    // ===== ОБРАБОТКА МОБИЛЬНОГО МЕНЮ =====
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileToggle && mainNav) {
        // Открытие/закрытие меню по кнопке ☰
        mobileToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            mainNav.classList.toggle('open');
        });
    }

    // Закрытие меню при клике вне его
    document.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) {
            if (mainNav && !mainNav.contains(e.target) && !mobileToggle.contains(e.target)) {
                mainNav.classList.remove('open');
            }
        }
    });

    // Закрытие меню при клике на ссылку в меню (навигация)
    if (mainNav) {
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    mainNav.classList.remove('open');
                }
            });
        });
    }

    // Восстановление меню при изменении размера окна
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && mainNav) {
            mainNav.classList.remove('open');
            // Сбрасываем inline-стили, если они были установлены старым кодом
            mainNav.style.display = '';
            mainNav.style.position = '';
            mainNav.style.flexDirection = '';
            mainNav.style.background = '';
            mainNav.style.padding = '';
            mainNav.style.gap = '';
            mainNav.style.zIndex = '';
            mainNav.style.top = '';
            mainNav.style.left = '';
            mainNav.style.right = '';
        }
    });
});

// ===== ОБЩАЯ ФУНКЦИЯ ДЛЯ УВЕДОМЛЕНИЙ =====
function showNotification(message, type = 'info') {
    const colors = {
        info: '#3498db',
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 400px;
        font-family: 'Segoe UI', sans-serif;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Автоматическое скрытие через 4 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Добавляем стили для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

console.log('main.js загружен');