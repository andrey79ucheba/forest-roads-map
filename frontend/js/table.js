// Переменная для хранения текущего пользователя
//let currentUser = null;

// Получение данных о пользователе
//async function getCurrentUser() {
//    try {
//        const response = await fetch('/api/auth/me/');
//        if (response.ok) {
//            const data = await response.json();
//            currentUser = data;
//            updateUI();
//        }
//    } catch (error) {
//        console.log('Пользователь не авторизован');
//    }
//}

// Обновление интерфейса в зависимости от роли
function updateUI() {
    const status = document.getElementById('user-status');
    const addBtn = document.getElementById('add-row-btn');

    if (typeof currentUser !== 'undefined' && currentUser) {
        status.textContent = `👤 ${currentUser.user.username}`;
        addBtn.classList.remove('hidden');
    } else {
        status.textContent = '👤 Гость (только просмотр)';
        addBtn.classList.add('hidden');
    }
}

// Загрузка таблицы с данными
async function loadTable() {
    try {
        const response = await fetch('/api/roads-info/');
        const data = await response.json();
        renderTable(data);
    } catch (error) {
        console.error('Ошибка загрузки таблицы:', error);
    }
}

// Рендеринг таблицы
function renderTable(data) {
    const tbody = document.getElementById('table-body');

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Нет данных</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(row => `
        <tr data-id="${row.id}">
            <td>${row.id}</td>
            <td class="editable" data-field="district">${escapeHtml(row.district)}</td>
            <td class="editable" data-field="road_name">${escapeHtml(row.road_name)}</td>
            <td class="editable" data-field="conditions">${escapeHtml(row.conditions)}</td>
            <td>${row.updated_by || '-'}</td>
            <td>${formatDate(row.updated_at)}</td>
            <td>
                ${currentUser ? `
                    <button class="edit-btn" onclick="editRow(${row.id})">✏️</button>
                    ${currentUser.role === 'admin' ? `<button class="delete-btn" onclick="deleteRow(${row.id})">🗑️</button>` : ''}
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Функция для экранирования HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Форматирование даты
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// Редактирование строки
function editRow(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const cells = row.querySelectorAll('.editable');

    // Сохраняем оригинальные значения
    const originalValues = {};
    cells.forEach(cell => {
        const field = cell.dataset.field;
        originalValues[field] = cell.textContent.trim();
        cell.innerHTML = `<input type="text" class="edit-input" value="${escapeHtml(originalValues[field])}">`;
    });

    // Заменяем кнопки на "Сохранить" и "Отмена"
    const actionsCell = row.querySelector('td:last-child');
    const editBtn = actionsCell.querySelector('.edit-btn');
    const deleteBtn = actionsCell.querySelector('.delete-btn');

    actionsCell.innerHTML = `
        <button class="save-btn" onclick="saveRow(${id})">💾</button>
        <button class="cancel-btn" onclick="cancelEdit(${id})">✖️</button>
    `;
}

// Отмена редактирования
function cancelEdit(id) {
    loadTable();
}

// Сохранение строки
async function saveRow(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const inputs = row.querySelectorAll('.edit-input');
    const cells = row.querySelectorAll('.editable');

    const data = {};
    cells.forEach((cell, index) => {
        const field = cell.dataset.field;
        data[field] = inputs[index].value.trim();
    });

    try {
        const response = await fetch(`/api/roads-info/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            loadTable();
        } else {
            alert('Ошибка при сохранении');
        }
    } catch (error) {
        alert('Ошибка сети');
    }
}

// Удаление строки
async function deleteRow(id) {
    if (!confirm('Удалить запись?')) return;

    try {
        const response = await fetch(`/api/roads-info/${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        if (response.ok) {
            loadTable();
        } else {
            alert('Ошибка при удалении');
        }
    } catch (error) {
        alert('Ошибка сети');
    }
}

// Добавление новой записи
function showAddForm() {
    document.getElementById('edit-modal').classList.remove('hidden');
    document.getElementById('edit-modal-title').textContent = '➕ Добавить запись';
    document.getElementById('edit-id').value = '';
    document.getElementById('edit-district').value = '';
    document.getElementById('edit-road').value = '';
    document.getElementById('edit-conditions').value = '';
}

// Сохранение новой записи
async function saveNewRow() {
    const data = {
        district: document.getElementById('edit-district').value.trim(),
        road_name: document.getElementById('edit-road').value.trim(),
        conditions: document.getElementById('edit-conditions').value.trim()
    };

    if (!data.district || !data.road_name) {
        alert('Район и Автодорога обязательны для заполнения');
        return;
    }

    try {
        const response = await fetch('/api/roads-info/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            document.getElementById('edit-modal').classList.add('hidden');
            loadTable();
        } else {
            alert('Ошибка при добавлении');
        }
    } catch (error) {
        alert('Ошибка сети');
    }
}

// Получение CSRF токена
function getCSRFToken() {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
    return cookie ? cookie.split('=')[1] : '';
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', function () {
    loadTable();
    updateUI();

    // Кнопка "Добавить запись"
    document.getElementById('add-row-btn').addEventListener('click', showAddForm);

    // Кнопка "Обновить"
    document.getElementById('refresh-btn').addEventListener('click', loadTable);

    // Модальное окно для добавления
    document.getElementById('edit-modal-close').addEventListener('click', function () {
        document.getElementById('edit-modal').classList.add('hidden');
    });

    document.getElementById('edit-cancel').addEventListener('click', function () {
        document.getElementById('edit-modal').classList.add('hidden');
    });

    document.getElementById('edit-save').addEventListener('click', function (e) {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        if (id) {
            // Редактирование существующей записи
            // (этот функционал можно добавить позже)
        } else {
            saveNewRow();
        }
    });
});