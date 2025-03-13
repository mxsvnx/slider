// Инициализация переменных
const blockMin = document.getElementById('blockMin');
const blockMax = document.getElementById('blockMax');
const colorRange = document.getElementById('colorRange');
const slider = document.querySelector('.slider');
const labelsContainer = document.querySelector('.labels-container'); // Контейнер для делений
const showYearsButton = document.getElementById('showYears'); // Кнопка "Все года"
const showMonthsButton = document.getElementById('showMonths'); // Кнопка "Месяца"
let rangeMin = 2014; // Минимальное значение (первый год)
let rangeMax = 2021; // Максимальное значение (последний год)

let currentMode = 'years'; // Режим отображения: 'years' или 'months'

// Функция для создания делений (годы или месяцы)
function createLabels() {
    labelsContainer.innerHTML = ''; // Очищаем контейнер

    const sliderWidth = slider.offsetWidth; // Ширина слайдера

    if (currentMode === 'months') {
        // Режим месяцев (2015–2016)
        const monthsShort = [
            "янв", "фев", "мар", "апр", "май", "июн",
            "июл", "авг", "сен", "окт", "ноя", "дек"
        ];
        const totalMonths = (2016 - 2015 + 1) * 12; // Общее количество месяцев (2015–2016)

        for (let i = 0; i < totalMonths; i++) {
            const monthElement = document.createElement('span');
            const year = 2015 + Math.floor(i / 12);
            const month = monthsShort[i % 12];
            monthElement.textContent = month;

            // Добавляем класс в зависимости от того, год это или месяц
            if (i % 12 === 0) {
                monthElement.classList.add('year'); // Год
                monthElement.textContent = year; // Отображаем год
            } else {
                monthElement.classList.add('month'); // Месяц
            }

            // Рассчитываем позицию для деления
            const monthPosition = (i / (totalMonths - 1)) * sliderWidth;
            monthElement.style.left = `${monthPosition}px`;

            labelsContainer.appendChild(monthElement);
        }

        // Добавляем 2017 год в конец
        const year2017 = document.createElement('span');
        year2017.textContent = 2017;
        year2017.classList.add('year'); // Добавляем класс для года
        year2017.style.left = `${sliderWidth}px`; // Позиция в конце слайдера
        labelsContainer.appendChild(year2017);
    } else {
        // Режим годов (2014–2021)
        const totalYears = rangeMax - rangeMin + 1; // Общее количество лет

        for (let year = rangeMin; year <= rangeMax; year++) {
            const yearElement = document.createElement('span');
            yearElement.textContent = year;
            yearElement.classList.add('year'); // Добавляем класс для года

            // Рассчитываем позицию для деления
            const yearPosition = ((year - rangeMin) / (totalYears - 1)) * sliderWidth;
            yearElement.style.left = `${yearPosition}px`;

            labelsContainer.appendChild(yearElement);
        }
    }
}

// Обработчик для кнопки "Все года"
showYearsButton.addEventListener('click', () => {
    currentMode = 'years'; // Переключаем режим на годы
    rangeMin = 2014; // Возвращаем диапазон к 2014–2021
    rangeMax = 2021;
    showYearsButton.classList.add('active'); // Делаем кнопку активной
    showMonthsButton.classList.remove('active'); // Делаем другую кнопку неактивной
    createLabels(); // Обновляем деления
});

// Обработчик для кнопки "Месяца"
showMonthsButton.addEventListener('click', () => {
    currentMode = 'months'; // Переключаем режим на месяцы
    rangeMin = 2015; // Устанавливаем диапазон 2015–2016
    rangeMax = 2016;
    showMonthsButton.classList.add('active'); // Делаем кнопку активной
    showYearsButton.classList.remove('active'); // Делаем другую кнопку неактивной
    createLabels(); // Обновляем деления
});

// Получаем координаты элемента
function getCoords(elem) {
    const rect = elem.getBoundingClientRect();
    return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset,
        width: rect.width,
        height: rect.height
    };
}

// Функция для перемещения ползунка
function moveRange(elem) {
    const parent = {
        element: elem.parentElement,
        coords: getCoords(elem.parentElement)
    };

    const block2 = elem.classList.contains('block-min') ? {
        element: blockMax,
        coords: getCoords(blockMax)
    } : {
        element: blockMin,
        coords: getCoords(blockMin)
    };

    const isMin = elem.classList.contains('block-min'); // true, если это blockMin, иначе false
    const indicator = document.createElement('div');
    indicator.classList.add('indicator'); // Добавляем класс для стилизации
    if (elem.children.length) {
        elem.innerHTML = '';
    }
    elem.appendChild(indicator);

    // Обработчики событий
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onMouseMove);
    document.addEventListener('touchend', onMouseUp);

    elem.ondragstart = () => false;

    function onMouseMove(e) {
        e.preventDefault();
        const pos = e.touches === undefined ? e.clientX : e.targetTouches[0].clientX;

        // Учитываем половину ширины ползунка для корректного позиционирования
        const halfWidth = elem.offsetWidth / 2;
        let newLeft = pos - parent.coords.left - halfWidth;

        // Ограничиваем движение ползунка в пределах слайдера
        const rightEdge = parent.coords.width - elem.offsetWidth;

        if (newLeft < -halfWidth) {
            newLeft = -halfWidth; // Центральная точка доходит до левого края
        } else if (newLeft > rightEdge + halfWidth) {
            newLeft = rightEdge + halfWidth; // Центральная точка доходит до правого края
        }

        // Ограничиваем движение ползунков, чтобы они не пересекались
        if (isMin && pos > block2.coords.left) {
            newLeft = block2.coords.left - parent.coords.left - elem.offsetWidth;
        } else if (!isMin && pos < block2.coords.left + block2.coords.width) {
            newLeft = block2.coords.left - parent.coords.left + block2.coords.width;
        }

        // Устанавливаем новую позицию ползунка
        elem.style.left = `${newLeft}px`;

        // Вычисляем месяц и год
        const monthsFull = [
            "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
        ];
        const totalMonths = (rangeMax - rangeMin + 1) * 12; // Общее количество месяцев
        let monthIndex = Math.floor((newLeft / parent.coords.width) * totalMonths);

        // Ограничиваем monthIndex, чтобы он не выходил за пределы
        monthIndex = Math.min(Math.max(monthIndex, 0), totalMonths - 1);

        const year = rangeMin + Math.floor(monthIndex / 12);
        const month = monthsFull[monthIndex % 12];
        const displayValue = `${month} ${year}`;

        // Обновляем индикатор
        indicator.style.left = `${-elem.offsetWidth / 2}px`;

        // Отображаем месяц и год
        indicator.innerHTML = displayValue;

        // Обновляем цветную плашечку
        if (isMin) {
            colorRange.style.left = `${newLeft + elem.offsetWidth}px`;
            colorRange.style.width = `${block2.coords.left - parent.coords.left - newLeft - elem.offsetWidth}px`;
        } else {
            colorRange.style.left = `${block2.coords.left - parent.coords.left}px`;
            colorRange.style.width = `${newLeft - (block2.coords.left - parent.coords.left)}px`;
        }
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('touchmove', onMouseMove);
        document.removeEventListener('touchend', onMouseUp);
    }
}

// Инициализация ползунков и делений при загрузке страницы
window.addEventListener('load', () => {
    createLabels(); // Создаем деления (годы по умолчанию)
    showYearsButton.classList.add('active'); // Делаем кнопку "Все года" активной по умолчанию

    // Инициализация синей плашки
    const sliderWidth = slider.offsetWidth; // Ширина слайдера
    const blockMinLeft = blockMin.offsetLeft; // Позиция левого бегунка
    const blockMaxLeft = blockMax.offsetLeft; // Позиция правого бегунка

    // Устанавливаем начальное положение и ширину синей плашки
    colorRange.style.left = `${blockMinLeft}px`;
    colorRange.style.width = `${blockMaxLeft - blockMinLeft}px`;
});