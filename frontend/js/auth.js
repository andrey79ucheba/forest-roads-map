// ===== НОВАЯ ЛОГИКА АВТОРИЗАЦИИ =====

// Элементы DOM
const loginModal = document.getElementById('login-modal');
const loginModalClose = document.getElementById('login-modal-close');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

const profileModal = document.getElementById('profile-modal');
const profileModalClose = document.getElementById('profile-modal-close');

const changePasswordModal = document.getElementById('change-password-modal');
const changePasswordClose = document.getElementById('change-password-close');
const changePasswordForm = document.getElementById('change-password-form');

const authLink = document.getElementById('auth-link');

// --- ОТКРЫТИЕ ОКНА ВХОДА ---
if (authLink) {
    authLink.addEventListener('click', function (e) {
        e.preventDefault();
        // Если пользователь уже авторизован — открываем профиль
        if (currentUser) {
            openProfile();
        } else {
            // Иначе — окно входа
            if (loginModal) {
                loginModal.classList.remove('hidden');
                loginError.style.display = 'none';
                loginForm.reset();
            }
        }
    });
}

// --- ЗАКРЫТИЕ ОКНА ВХОДА ---
if (loginModalClose) {
    loginModalClose.addEventListener('click', function () {
        loginModal.classList.add('hidden');
    });
}

// Закрытие по клику вне окна
if (loginModal) {
    loginModal.addEventListener('click', function (e) {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
        }
    });
}

// --- ОБРАБОТКА ФОРМЫ ВХОДА ---
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!username || !password) {
            loginError.textContent = 'Заполните все поля';
            loginError.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                loginModal.classList.add('hidden');
                currentUser = data.user;
                updateAuthUI(data.user, data.role);
                loginForm.reset();
                if (typeof updateUI === 'function') {
                    updateUI();
                }
                if (typeof loadTable === 'function') {
                    loadTable();
                }
            } else {
                loginError.textContent = data.error || 'Неверное имя пользователя или пароль';
                loginError.style.display = 'block';
            }
        } catch (error) {
            loginError.textContent = 'Ошибка сети. Попробуйте позже.';
            loginError.style.display = 'block';
        }
    });
}

// --- ОТКРЫТИЕ ПРОФИЛЯ ---
function openProfile() {
    if (!currentUser) return;

    document.getElementById('profile-username').textContent = currentUser.user.username;
    document.getElementById('profile-first-name').textContent = currentUser.user.first_name || '—';
    document.getElementById('profile-last-name').textContent = currentUser.user.last_name || '—';
    document.getElementById('profile-email').textContent = currentUser.user.email || '—';

    if (profileModal) {
        profileModal.classList.remove('hidden');
    }
}

// --- ЗАКРЫТИЕ ПРОФИЛЯ ---
if (profileModalClose) {
    profileModalClose.addEventListener('click', function () {
        profileModal.classList.add('hidden');
    });
}

if (profileModal) {
    profileModal.addEventListener('click', function (e) {
        if (e.target === profileModal) {
            profileModal.classList.add('hidden');
        }
    });
}

// --- ВЫХОД ИЗ ПРОФИЛЯ ---
const profileLogoutBtn = document.getElementById('profile-logout');
if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', function () {
        if (confirm('Вы уверены, что хотите выйти?')) {
            logout();
            profileModal.classList.add('hidden');
        }
    });
}

// --- СМЕНА ПАРОЛЯ (открытие окна) ---
const profileChangePasswordBtn = document.getElementById('profile-change-password');
if (profileChangePasswordBtn) {
    profileChangePasswordBtn.addEventListener('click', function () {
        profileModal.classList.add('hidden');
        changePasswordModal.classList.remove('hidden');
        document.getElementById('password-change-error').style.display = 'none';
        document.getElementById('password-change-success').style.display = 'none';
        changePasswordForm.reset();
    });
}

// --- ЗАКРЫТИЕ ОКНА СМЕНЫ ПАРОЛЯ ---
if (changePasswordClose) {
    changePasswordClose.addEventListener('click', function () {
        changePasswordModal.classList.add('hidden');
    });
}

if (changePasswordModal) {
    changePasswordModal.addEventListener('click', function (e) {
        if (e.target === changePasswordModal) {
            changePasswordModal.classList.add('hidden');
        }
    });
}

// --- ОБРАБОТКА ФОРМЫ СМЕНЫ ПАРОЛЯ ---
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        const errorEl = document.getElementById('password-change-error');
        const successEl = document.getElementById('password-change-success');

        errorEl.style.display = 'none';
        successEl.style.display = 'none';

        // Валидация
        if (newPassword.length < 8) {
            errorEl.textContent = 'Пароль должен содержать минимум 8 символов';
            errorEl.style.display = 'block';
            return;
        }

        if (newPassword !== confirmPassword) {
            errorEl.textContent = 'Пароли не совпадают';
            errorEl.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                successEl.textContent = 'Пароль успешно изменён!';
                successEl.style.display = 'block';
                changePasswordForm.reset();
                setTimeout(() => {
                    changePasswordModal.classList.add('hidden');
                }, 2000);
            } else {
                errorEl.textContent = data.error || 'Ошибка при смене пароля';
                errorEl.style.display = 'block';
            }
        } catch (error) {
            errorEl.textContent = 'Ошибка сети. Попробуйте позже.';
            errorEl.style.display = 'block';
        }
    });
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

function getCSRFToken() {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
    return cookie ? cookie.split('=')[1] : '';
}

// Переменная для хранения текущего пользователя
let currentUser = null;

// Обновление интерфейса после входа
function updateAuthUI(user, role) {
    const authLink = document.getElementById('auth-link');
    if (authLink) {
        if (user) {
            authLink.textContent = `👤 ${user.username}`;
            authLink.href = '#';
        } else {
            authLink.textContent = 'Войти';
            authLink.href = '#';
        }
    }
}

// Получение данных текущего пользователя
async function getCurrentUser() {
    try {
        const response = await fetch('/api/auth/me/');
        if (response.ok) {
            const data = await response.json();
            currentUser = data;
            updateAuthUI(data.user, data.role);
            if (typeof updateUI === 'function') {
                updateUI();
            }
            return data;
        }
    } catch (error) {
        console.log('Пользователь не авторизован');
    }
    return null;
}

// Выход из системы
async function logout() {
    try {
        const response = await fetch('/api/auth/logout/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            currentUser = null;
            updateAuthUI(null, null);
            if (typeof updateUI === 'function') {
                updateUI();
            }
            if (typeof loadTable === 'function') {
                loadTable();
            }
        }
    } catch (error) {
        console.error('Ошибка выхода:', error);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    getCurrentUser();
});