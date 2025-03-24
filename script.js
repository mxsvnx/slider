const monthsShort = [
    "янв", "фев", "мар", "апр", "май", "июн",
    "июл", "авг", "сен", "окт", "ноя", "дек"
];

const monthsFull = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

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
let isDragging = false;

function createLabels() {
    labelsContainer.innerHTML = '';
    const sliderWidth = slider.offsetWidth;

    if (currentMode === 'months') {
        const totalMonths = (rangeMax - rangeMin + 1) * 12;

        for (let i = 0; i < totalMonths; i++) {
            const monthElement = document.createElement('span');
            const year = rangeMin + Math.floor(i / 12);
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

        const lastYear = document.createElement('span');
        lastYear.textContent = rangeMax + 1;
        lastYear.classList.add('year');
        lastYear.style.left = `${sliderWidth}px`;
        labelsContainer.appendChild(lastYear);
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
    showInitialTooltip(blockMin);
    showInitialTooltip(blockMax);
}

function showInitialTooltip(sliderThumb) {
    const track = slider.offsetWidth;
    const left = parseFloat(sliderThumb.style.left) || 0;
    const totalMonths = (rangeMax - rangeMin + 1) * 12;
    let monthIndex = Math.floor((left / track) * totalMonths);
    monthIndex = Math.min(Math.max(monthIndex, 0), totalMonths - 1);

    const year = rangeMin + Math.floor(monthIndex / 12);
    const month = monthsFull[monthIndex % 12];
    const displayValue = `${month} ${year}`;

    let indicator = sliderThumb.querySelector('.indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.classList.add('indicator');
            if (sliderThumb.classList.contains('block-max')) {
                indicator.classList.add('bottom');
            }
        sliderThumb.appendChild(indicator);
    }
    indicator.style.left = "50%";
    indicator.style.transform = "translateX(-50%)";
    indicator.innerHTML = displayValue;

    if (sliderThumb.classList.contains('block-min')) {
        indicator.style.top = "-60px";
    } else {
        indicator.style.top = "28px";
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

function moveRange(sliderThumb) {
    sliderThumb.addEventListener('mousedown', startDrag);
    sliderThumb.addEventListener('touchstart', startDrag);

    function startDrag() {
        isDragging = true;

        const sliderTrack = {
            element: sliderThumb.parentElement,
            coords: getCoords(sliderThumb.parentElement)
        };

        const oppositeThumb = sliderThumb.classList.contains('block-min') ? {
            element: blockMax,
            coords: getCoords(blockMax)
        } : {
            element: blockMin,
            coords: getCoords(blockMin)
        };

        const isMin = sliderThumb.classList.contains('block-min');
        let indicator = sliderThumb.querySelector('.indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.classList.add('indicator');
            sliderThumb.appendChild(indicator);
        }

        const updateIndicator = (newLeft) => {
    const totalMonths = (rangeMax - rangeMin + 1) * 12;
    let monthIndex = Math.floor((newLeft / sliderTrack.coords.width) * totalMonths);
    monthIndex = Math.min(Math.max(monthIndex, 0), totalMonths - 1);

    const year = rangeMin + Math.floor(monthIndex / 12);
    const month = monthsFull[monthIndex % 12];
    const displayValue = `${month} ${year}`;

    indicator.style.left = "50%";
    indicator.style.transform = "translateX(-50%)";
    indicator.innerHTML = displayValue;

    if (isMin) {
        indicator.style.top = "-60px";
    } else {
        indicator.style.top = "28px";
    }
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;

            e.preventDefault();
            const pos = e.touches === undefined ? e.clientX : e.targetTouches[0].clientX;
            const halfWidth = sliderThumb.offsetWidth / 2;
            let newLeft = pos - sliderTrack.coords.left - halfWidth;
            const rightEdge = sliderTrack.coords.width - sliderThumb.offsetWidth;

            if (newLeft < -halfWidth) newLeft = -halfWidth;
            else if (newLeft > rightEdge + halfWidth) newLeft = rightEdge + halfWidth;

            if (isMin && pos > oppositeThumb.coords.left) {
                newLeft = oppositeThumb.coords.left - sliderTrack.coords.left - sliderThumb.offsetWidth;
            } else if (!isMin && pos < oppositeThumb.coords.left + oppositeThumb.coords.width) {
                newLeft = oppositeThumb.coords.left - sliderTrack.coords.left + oppositeThumb.coords.width;
            }

            sliderThumb.style.left = `${newLeft}px`;
            updateIndicator(newLeft);

            if (isMin) {
                colorRange.style.left = `${newLeft + sliderThumb.offsetWidth}px`;
                colorRange.style.width = `${oppositeThumb.coords.left - sliderTrack.coords.left - newLeft - sliderThumb.offsetWidth}px`;
            } else {
                colorRange.style.left = `${oppositeThumb.coords.left - sliderTrack.coords.left}px`;
                colorRange.style.width = `${newLeft - (oppositeThumb.coords.left - sliderTrack.coords.left)}px`;
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove);
        document.addEventListener('touchend', onMouseUp);

        sliderThumb.ondragstart = () => false;
    }
}

window.addEventListener('load', () => {
    createLabels();
    showYearsButton.classList.add('active');

    const sliderWidth = slider.offsetWidth;
    const thumbWidth = blockMin.offsetWidth;
    const leftInitial = 0;
    const rightInitial = sliderWidth - thumbWidth;

    blockMin.style.left = `${leftInitial}px`;
    blockMax.style.left = `${rightInitial}px`;

    colorRange.style.left = `${leftInitial + thumbWidth}px`;
    colorRange.style.width = `${rightInitial - leftInitial - thumbWidth}px`;

    moveRange(blockMin);
    moveRange(blockMax);
    showInitialTooltip(blockMin);
    showInitialTooltip(blockMax);
});
