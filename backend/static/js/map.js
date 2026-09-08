// Инициализация карты
const map = L.map('map').setView([61.3, 47.0], 10);

// Добавление слоя OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Хранилище для всех объектов
let allObjects = [];

// Глобальные переменные для слоёв
let roadLayer = null;
let quarterLayer = null;
let roadsLoaded = false; //добавил когда удалял дубли


// Загрузка квартальной сетки
async function loadQuarterGrid() {
    try {
        const response = await fetch('/api/quarter-grid/');
        const data = await response.json();

        console.log('Данные кварталов:', data);
        console.log('Количество кварталов:', data.length);

        if (!Array.isArray(data)) {
            console.error('Кварталы: данные не являются массивом', data);
            return;
        }

        if (data.length === 0) {
            console.warn('Нет данных для отображения кварталов');
            return;
        }

        quarterLayer = L.geoJSON(data, {
            style: {
                color: '#808080',
                weight: 1,
                opacity: 0.5,
                fillOpacity: 0.05
            },
            onEachFeature: function (feature, layer) {
                const props = feature.properties || {};
                let popupText = '<b>Квартал</b>';
                if (props.name && props.name.trim() !== '') {
                    popupText += `<br>Название: ${props.name}`;
                }
                if (props.label && props.label.trim() !== '') {
                    popupText += `<br>${props.label}`;
                }
                if ((!props.name || props.name.trim() === '') && (!props.label || props.label.trim() === '')) {
                    popupText += `<br>ID: ${props.id || 'неизвестно'}`;
                }
                layer.bindPopup(popupText);
            }
        }).addTo(map);

        quarterLayer.bringToBack();
        console.log('Квартальная сетка загружена');
    } catch (error) {
        console.error('Ошибка загрузки кварталов:', error);
    }
}

// Загрузка дорожных объектов
async function loadRoads() {
    // Защита от повторной загрузки
    if (roadsLoaded) {
        console.warn('Дороги уже загружены!');
        return;
    }
    roadsLoaded = true;

    try {
        const response = await fetch('/api/roads/');
        const data = await response.json();

        console.log('Данные с сервера:', data);
        console.log('Тип данных:', typeof data);
        console.log('Массив?', Array.isArray(data));
        console.log('Количество объектов до фильтрации:', data.length);

        if (!Array.isArray(data)) {
            console.error('Данные не являются массивом', data);
            return;
        }

        if (data.length === 0) {
            console.warn('Нет данных для отображения');
            return;
        }

        // Очищаем старый слой
        if (roadLayer) {
            map.removeLayer(roadLayer);
            roadLayer = null;
        }

        // Очищаем allObjects перед заполнением
        allObjects = [];

        function parseGeometry(geom) {
            if (typeof geom === 'string') {
                try {
                    return JSON.parse(geom);
                } catch (e) {
                    console.error('Ошибка парсинга geometry:', e);
                    return null;
                }
            }
            return geom;
        }

        // Преобразование в GeoJSON FeatureCollection
        const geojsonData = {
            type: "FeatureCollection",
            features: data.map(item => {
                const geom = parseGeometry(item.geometry);
                return {
                    type: "Feature",
                    geometry: geom,
                    properties: {
                        id: item.id,
                        name: item.name,
                        object_type: item.object_type,
                        label: item.label,
                        label2: item.label2,
                        label3: item.label3,
                        type_code: item.type_code,
                    }
                };
            }).filter(f => f.geometry !== null)
        };

        console.log('GeoJSON для Leaflet:', geojsonData);

        if (geojsonData.features.length === 0) {
            console.warn('Нет валидных объектов для отображения');
            return;
        }

        // Заполняем allObjects
        allObjects = data;

        roadLayer = L.geoJSON(geojsonData, {
            style: function (feature) {
                const type = feature.properties.object_type;
                return {
                    color: type === 'POLYLINE' ? '#0066ff' : '#ff6600',
                    weight: type === 'POLYLINE' ? 5 : 4,
                    fillOpacity: 0.3
                };
            },
            onEachFeature: function (feature, layer) {
                let popupText = `<b>${feature.properties.label || feature.properties.name || 'Информация'}</b>`;
                if (feature.properties.label2) popupText += `<br>${feature.properties.label2}`;
                if (feature.properties.label3) popupText += `<br>${feature.properties.label3}`;
                layer.bindPopup(popupText);
            }
        }).addTo(map);

        console.log('Дорожные объекты загружены');
    } catch (error) {
        console.error('Ошибка загрузки дорог:', error);
    }
}

// ===== ФУНКЦИИ ПОИСКА =====

// Поиск дороги
document.getElementById('search-btn').addEventListener('click', function () {
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        searchRoad(query);
    }
});

document.getElementById('search-input').addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
        const query = this.value.trim();
        if (query) {
            searchRoad(query);
        }
    }
});

function searchRoad(query) {
    // Находим все объекты по запросу
    const found = allObjects.filter(obj => {
        const label = obj.label || '';
        const name = obj.name || '';
        return label.toLowerCase().includes(query.toLowerCase()) ||
            name.toLowerCase().includes(query.toLowerCase());
    });

    console.log('Найдено до фильтрации дублей:', found.length);

    // ===== УДАЛЕНИЕ ДУБЛЕЙ ПО ID =====
    const seenIds = new Set();
    const uniqueFound = found.filter(obj => {
        if (seenIds.has(obj.id)) {
            console.warn('Дубликат по ID:', obj.id, obj.label);
            return false;
        }
        seenIds.add(obj.id);
        return true;
    });

    console.log('Найдено после фильтрации дублей:', uniqueFound.length);

    if (uniqueFound.length === 0) {
        alert('Дорога не найдена');
        return;
    }

    if (uniqueFound.length === 1) {
        const road = uniqueFound[0];
        centerMapOnRoad(road);
        showInfo(road);
        return;
    }

    showRoadList(uniqueFound, query);
}

function centerMapOnRoad(road) {
    const coords = road.geometry.coordinates;
    if (road.geometry.type === 'Point') {
        map.setView([coords[1], coords[0]], 14);
    } else if (road.geometry.type === 'LineString' || road.geometry.type === 'MultiLineString') {
        let allCoords = [];
        if (road.geometry.type === 'MultiLineString') {
            road.geometry.coordinates.forEach(line => {
                line.forEach(p => allCoords.push(p));
            });
        } else {
            allCoords = road.geometry.coordinates;
        }
        const center = getCenter(allCoords);
        map.setView(center, 14);
    }
}

function getCenter(coords) {
    let lat = 0, lng = 0, count = 0;
    coords.forEach(p => {
        if (Array.isArray(p) && p.length === 2) {
            lat += p[1];
            lng += p[0];
            count++;
        }
    });
    return count > 0 ? [lat / count, lng / count] : [61.3, 47.0];
}

function showRoadList(roads, query) {
    const oldList = document.getElementById('road-search-results');
    if (oldList) {
        oldList.remove();
    }

    const container = document.createElement('div');
    container.id = 'road-search-results';
    container.style.cssText = `
        position: absolute;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 500px;
        width: 90%;
        max-height: 300px;
        overflow-y: auto;
        z-index: 9999;
        padding: 10px 0;
    `;

    const title = document.createElement('div');
    title.style.cssText = `
        padding: 8px 16px;
        font-weight: 600;
        color: #2c3e50;
        border-bottom: 1px solid #eee;
        font-size: 14px;
    `;
    title.textContent = `🔍 Найдено дорог: ${roads.length} (по запросу "${query}")`;
    container.appendChild(title);

    roads.forEach((road) => {
        const item = document.createElement('div');
        item.style.cssText = `
            padding: 10px 16px;
            cursor: pointer;
            transition: background 0.2s ease;
            border-bottom: 1px solid #f5f5f5;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        item.onmouseover = function () {
            this.style.background = '#e8f4fd';
        };
        item.onmouseout = function () {
            this.style.background = 'transparent';
        };

        const nameSpan = document.createElement('span');
        nameSpan.textContent = road.label || road.name || 'Без названия';

        const typeSpan = document.createElement('span');
        typeSpan.style.cssText = `
            font-size: 12px;
            color: #888;
            margin-left: 10px;
        `;
        typeSpan.textContent = road.object_type === 'POLYLINE' ? '📍 Линия' : '📍 Полигон';

        item.appendChild(nameSpan);
        item.appendChild(typeSpan);

        item.addEventListener('click', function () {
            container.remove();
            centerMapOnRoad(road);
            showInfo(road);
        });

        container.appendChild(item);
    });

    const closeBtn = document.createElement('div');
    closeBtn.style.cssText = `
        padding: 8px 16px;
        text-align: center;
        color: #999;
        font-size: 13px;
        cursor: pointer;
        border-top: 1px solid #eee;
        margin-top: 5px;
    `;
    closeBtn.textContent = '✖ Закрыть список';
    closeBtn.addEventListener('click', function () {
        container.remove();
    });
    container.appendChild(closeBtn);

    document.getElementById('map-container').appendChild(container);

    setTimeout(() => {
        document.addEventListener('click', function closeOnOutside(e) {
            if (!container.contains(e.target) && e.target.id !== 'search-btn' && e.target.id !== 'search-input') {
                if (document.getElementById('road-search-results')) {
                    container.remove();
                }
                document.removeEventListener('click', closeOnOutside);
            }
        });
    }, 100);
}

// ===== ФУНКЦИЯ ПОКАЗА ИНФОРМАЦИИ =====
function showInfo(properties) {
    const popup = document.getElementById('info-popup');
    const body = document.getElementById('popup-body');
    const title = document.getElementById('popup-title');

    if (!popup || !body) {
        console.error('Элементы попапа не найдены в HTML');
        return;
    }

    let header = properties.label || properties.name || 'Информация об объекте';
    if (title) {
        title.textContent = header;
    }

    let html = '';
    if (properties.label) {
        html += `<p><strong>Название:</strong> ${properties.label}</p>`;
    }
    if (properties.label2 && properties.label2.trim() !== '') {
        html += `<p><strong>Описание:</strong> ${properties.label2}</p>`;
    }
    if (properties.label3 && properties.label3.trim() !== '') {
        html += `<p><strong>Примечание:</strong> ${properties.label3}</p>`;
    }
    if (properties.object_type) {
        const typeMap = {
            'POLYLINE': 'Линия',
            'POLYGON': 'Полигон (область)',
            'MULTILINESTRING': 'Мультилиния'
        };
        const typeDisplay = typeMap[properties.object_type.toUpperCase()] || properties.object_type;
        html += `<p><strong>Тип:</strong> ${typeDisplay}</p>`;
    }
    if (properties.type_code && properties.type_code.trim() !== '') {
        html += `<p><strong>Код:</strong> ${properties.type_code}</p>`;
    }
    if (html === '') {
        html = '<p>Информация отсутствует</p>';
    }

    body.innerHTML = html;
    popup.classList.remove('hidden');
}

// Закрытие окна информации
document.getElementById('popup-close').addEventListener('click', function () {
    document.getElementById('info-popup').classList.add('hidden');
});

document.getElementById('map-container').addEventListener('click', function (e) {
    if (e.target.closest('.popup')) return;
    document.getElementById('info-popup').classList.add('hidden');
});

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    loadQuarterGrid();
    loadRoads();
});