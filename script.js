// Инициализация переменных
const blockMin = document.getElementById('blockMin');
const blockMax = document.getElementById('blockMax');
const colorRange = document.getElementById('colorRange');
const slider = document.querySelector('.slider');
const labelsContainer = document.querySelector('.labels-container'); 
const showYearsButton = document.getElementById('showYears'); 
const showMonthsButton = document.getElementById('showMonths'); 
let rangeMin = 2014; 
let rangeMax = 2021; 

let currentMode = 'years'; 

function createLabels() {
    labelsContainer.innerHTML = ''; 

    const sliderWidth = slider.offsetWidth; 

    if (currentMode === 'months') {
        const monthsShort = [
            "янв", "фев", "мар", "апр", "май", "июн",
            "июл", "авг", "сен", "окт", "ноя", "дек"
        ];
        const totalMonths = (2016 - 2015 + 1) * 12;

        for (let i = 0; i < totalMonths; i++) {
            const monthElement = document.createElement('span');
            const year = 2015 + Math.floor(i / 12);
            const month = monthsShort[i % 12];
            monthElement.textContent = month;

            if (i % 12 === 0) {
                monthElement.classList.add('year'); 
                monthElement.textContent = year; 
            } else {
                monthElement.classList.add('month'); 
            }

            const monthPosition = (i / (totalMonths - 1)) * sliderWidth;
            monthElement.style.left = `${monthPosition}px`;

            labelsContainer.appendChild(monthElement);
        }

        const year2017 = document.createElement('span');
        year2017.textContent = 2017;
        year2017.classList.add('year'); 
        year2017.style.left = `${sliderWidth}px`; 
        labelsContainer.appendChild(year2017);
    } else {
        const totalYears = rangeMax - rangeMin + 1; 

        for (let year = rangeMin; year <= rangeMax; year++) {
            const yearElement = document.createElement('span');
            yearElement.textContent = year;
            yearElement.classList.add('year'); 

            const yearPosition = ((year - rangeMin) / (totalYears - 1)) * sliderWidth;
            yearElement.style.left = `${yearPosition}px`;

            labelsContainer.appendChild(yearElement);
        }
    }
}

showYearsButton.addEventListener('click', () => {
    currentMode = 'years'; 
    rangeMin = 2014;
    rangeMax = 2021;
    showYearsButton.classList.add('active'); 
    showMonthsButton.classList.remove('active'); 
    createLabels();
});

showMonthsButton.addEventListener('click', () => {
    currentMode = 'months';
    rangeMin = 2015; 
    rangeMax = 2016;
    showMonthsButton.classList.add('active'); 
    showYearsButton.classList.remove('active');
    createLabels(); 
});

function getCoords(elem) {
    const rect = elem.getBoundingClientRect();
    return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset,
        width: rect.width,
        height: rect.height
    };
}

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

    const isMin = elem.classList.contains('block-min');
    const indicator = document.createElement('div');
    indicator.classList.add('indicator'); 
    if (elem.children.length) {
        elem.innerHTML = '';
    }
    elem.appendChild(indicator);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onMouseMove);
    document.addEventListener('touchend', onMouseUp);

    elem.ondragstart = () => false;

    function onMouseMove(e) {
        e.preventDefault();
        const pos = e.touches === undefined ? e.clientX : e.targetTouches[0].clientX;

        const halfWidth = elem.offsetWidth / 2;
        let newLeft = pos - parent.coords.left - halfWidth;

        const rightEdge = parent.coords.width - elem.offsetWidth;

        if (newLeft < -halfWidth) {
            newLeft = -halfWidth; 
        } else if (newLeft > rightEdge + halfWidth) {
            newLeft = rightEdge + halfWidth;
        }

        if (isMin && pos > block2.coords.left) {
            newLeft = block2.coords.left - parent.coords.left - elem.offsetWidth;
        } else if (!isMin && pos < block2.coords.left + block2.coords.width) {
            newLeft = block2.coords.left - parent.coords.left + block2.coords.width;
        }

        elem.style.left = `${newLeft}px`;

        const monthsFull = [
            "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
        ];
        const totalMonths = (rangeMax - rangeMin + 1) * 12; 
        let monthIndex = Math.floor((newLeft / parent.coords.width) * totalMonths);

        monthIndex = Math.min(Math.max(monthIndex, 0), totalMonths - 1);

        const year = rangeMin + Math.floor(monthIndex / 12);
        const month = monthsFull[monthIndex % 12];
        const displayValue = `${month} ${year}`;

        indicator.style.left = `${-elem.offsetWidth / 2}px`;

        indicator.innerHTML = displayValue;

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

window.addEventListener('load', () => {
    createLabels(); 
    showYearsButton.classList.add('active'); 


    const sliderWidth = slider.offsetWidth; 
    const blockMinLeft = blockMin.offsetLeft;
    const blockMaxLeft = blockMax.offsetLeft; 


    colorRange.style.left = `${blockMinLeft}px`;
    colorRange.style.width = `${blockMaxLeft - blockMinLeft}px`;
});
