// ============================================================
// 1. ДАННЫЕ
// ============================================================

// Названия месяцев для заголовка календаря.
const MONTHS = [
    "ЯНВАРЬ", "ФЕВРАЛЬ", "МАРТ", "АПРЕЛЬ",
    "МАЙ", "ИЮНЬ", "ИЮЛЬ", "АВГУСТ",
    "СЕНТЯБРЬ", "ОКТЯБРЬ", "НОЯБРЬ", "ДЕКАБРЬ"
];

// Названия месяцев для нижней панели.
const MONTHS_GENITIVE = [
    "января", "февраля", "марта", "апреля",
    "мая", "июня", "июля", "августа",
    "сентября", "октября", "ноября", "декабря"
];

// Дни недели в порядке, который использует getDay().
const DAYS_OF_WEEK = [
    "Воскресенье", "Понедельник", "Вторник", "Среда",
    "Четверг", "Пятница", "Суббота"
];

// Сегодня берём из компьютера пользователя.
const now = new Date();
const today = {
    day: now.getDate(),
    month: now.getMonth(),
    year: now.getFullYear()
};

// Время, которое может быть доступно для записи.
const ALL_TIMES = [
    "10:00", "11:30", "13:00",
    "14:30", "16:00", "18:30"
];

// Для каждой даты формируется свой набор свободных и занятых слотов.
// Это демонстрационные данные: в настоящем проекте их отдавал бы сервер.
function getSlotsForDay(day, month, year) {
    const date = new Date(year, month, day);
    const dayOfYear = Math.floor(
        (date - new Date(year, 0, 0)) / (24 * 60 * 60 * 1000)
    );

    // Получаем маску от 1 до 62, чтобы у даты был
    // хотя бы один свободный и один занятый слот.
    let availabilityMask = ((dayOfYear * 37 + year) % 62) + 1;

    // Оставляем минимум два свободных времени.
    if ((availabilityMask & (availabilityMask - 1)) === 0) {
        availabilityMask |= availabilityMask & 1 ? 2 : 1;
    }

    return ALL_TIMES.map(function (time, index) {
        return {
            time: time,
            available: Boolean(availabilityMask & (1 << index))
        };
    });
}

// ============================================================
// 2. СОСТОЯНИЕ
// ============================================================

// При открытии страницы сразу выбираем сегодняшний день.
const state = {
    currentMonth: today.month,
    currentYear: today.year,
    selectedDay: today.day,
    selectedTime: null,
    slots: getSlotsForDay(today.day, today.month, today.year)
};

// ============================================================
// 3. ЧИСТЫЕ ФУНКЦИИ
// ============================================================

// Строит календарь из недель по семь дней.
// month начинается с нуля: 0 — январь, 11 — декабрь.
function buildCalendarGrid(year, month) {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay.getDay() + 6) % 7;
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const cells = [];

    for (let i = offset - 1; i >= 0; i--) {
        cells.push({
            day: prevMonthLastDay - i,
            otherMonth: true
        });
    }

    for (let day = 1; day <= daysInMonth; day++) {
        cells.push({
            day: day,
            otherMonth: false
        });
    }

    const totalCells = Math.ceil(cells.length / 7) * 7;
    let nextDay = 1;

    while (cells.length < totalCells) {
        cells.push({
            day: nextDay,
            otherMonth: true
        });
        nextDay++;
    }

    const weeks = [];

    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }

    return weeks;
}

// Сравнивает две даты: -1 — первая раньше, 0 — равны, 1 — позже.
function compareDates(date1, date2) {
    const first = new Date(date1.year, date1.month, date1.day);
    const second = new Date(date2.year, date2.month, date2.day);

    if (first < second) return -1;
    if (first > second) return 1;

    return 0;
}

// Прошлые даты выбирать нельзя.
function isDateSelectable(day, month, year) {
    return compareDates(
        { day: day, month: month, year: year },
        today
    ) >= 0;
}

// ============================================================
// 4. ОТРИСОВКА И ОБРАБОТЧИКИ
// ============================================================

// Рисует календарь на текущий месяц.
function renderCalendar() {
    const monthTitle = document.querySelector(".month-year");
    const daysContainer = document.querySelector(".days");

    monthTitle.textContent = MONTHS[state.currentMonth] + " " + state.currentYear;

    const weeks = buildCalendarGrid(state.currentYear, state.currentMonth);
    let html = "";

    weeks.forEach(function (week) {
        week.forEach(function (cell) {
            if (cell.otherMonth) {
                html += '<span class="empty"></span>';
                return;
            }

            const selectable = isDateSelectable(
                cell.day,
                state.currentMonth,
                state.currentYear
            );

            let classes = "";

            if (cell.day === today.day &&
                state.currentMonth === today.month &&
                state.currentYear === today.year) {
                classes += " today";
            }

            if (cell.day === state.selectedDay && selectable) {
                classes += " selected";
            }

            html +=
                '<button type="button" class="' + classes.trim() + '"' +
                ' data-day="' + cell.day + '"' +
                (selectable ? "" : " disabled") +
                '>' + cell.day + '</button>';
        });
    });

    daysContainer.innerHTML = html;

    // После innerHTML старые кнопки удалены, поэтому обработчики
    // нужно повесить на новые кнопки.
    const dayButtons = daysContainer.querySelectorAll("button:not(:disabled)");

    dayButtons.forEach(function (button) {
        button.addEventListener("click", onDayClick);
    });
}

// Рисует доступные и занятые слоты времени.
function renderTimeSlots() {
    const slotsContainer = document.querySelector(".time-slots");
    const dateTitle = document.querySelector(".time-date");

    if (state.selectedDay === null) {
        dateTitle.textContent = "ВЫБЕРИТЕ ДАТУ";
        slotsContainer.innerHTML = "";
        return;
    }

    const date = new Date(
        state.currentYear,
        state.currentMonth,
        state.selectedDay
    );

    dateTitle.textContent =
        state.selectedDay + " " +
        MONTHS_GENITIVE[state.currentMonth].toUpperCase() +
        " · " + DAYS_OF_WEEK[date.getDay()].toUpperCase();

    let html = "";

    state.slots.forEach(function (slot) {
        let classes = "";

        if (!slot.available) {
            classes += " unavailable";
        }

        if (slot.time === state.selectedTime) {
            classes += " selected";
        }

        html +=
            '<button type="button" class="' + classes.trim() + '"' +
            ' data-time="' + slot.time + '"' +
            (slot.available ? "" : " disabled") +
            '>' + slot.time + '</button>';
    });

    slotsContainer.innerHTML = html;

    // Обработчики добавляются заново после перерисовки.
    const slotButtons = slotsContainer.querySelectorAll("button:not(:disabled)");

    slotButtons.forEach(function (button) {
        button.addEventListener("click", onTimeSlotClick);
    });
}

// Обновляет нижнюю строку с выбранной датой и временем.
function updateBottomBar() {
    const value = document.querySelector(".selected-value");

    if (state.selectedDay === null) {
        value.textContent = "ВЫБЕРИТЕ ДАТУ";
        return;
    }

    const date = new Date(
        state.currentYear,
        state.currentMonth,
        state.selectedDay
    );

    const dateText =
        DAYS_OF_WEEK[date.getDay()] + ", " +
        state.selectedDay + " " +
        MONTHS_GENITIVE[state.currentMonth] + " " +
        state.currentYear;

    const timeText = state.selectedTime
        ? state.selectedTime
        : "время не выбрано";

    value.textContent = dateText + " • " + timeText;
}

// Клик по дню календаря.
function onDayClick(event) {
    const day = Number(event.currentTarget.dataset.day);

    state.selectedDay = day;
    state.selectedTime = null;
    state.slots = getSlotsForDay(day, state.currentMonth, state.currentYear);

    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
}

// Клик по свободному времени.
function onTimeSlotClick(event) {
    state.selectedTime = event.currentTarget.dataset.time;

    renderTimeSlots();
    updateBottomBar();
}

// Переключает месяц. При переходе на другой месяц время сбрасывается.
function changeMonth(step) {
    state.currentMonth += step;

    if (state.currentMonth < 0) {
        state.currentMonth = 11;
        state.currentYear--;
    }

    if (state.currentMonth > 11) {
        state.currentMonth = 0;
        state.currentYear++;
    }

    state.selectedTime = null;

    // В текущем месяце оставляем сегодня выбранным.
    // В будущем месяце выбираем первое доступное число.
    if (state.currentYear === today.year &&
        state.currentMonth === today.month) {
        state.selectedDay = today.day;
    } else if (compareDates(
        { day: 1, month: state.currentMonth, year: state.currentYear },
        today
    ) >= 0) {
        state.selectedDay = 1;
    } else {
        state.selectedDay = null;
    }

    state.slots = state.selectedDay === null
        ? []
        : getSlotsForDay(state.selectedDay, state.currentMonth, state.currentYear);

    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
}

// ============================================================
// 5. ИНИЦИАЛИЗАЦИЯ
// ============================================================

function init() {
    document.querySelector(".month-prev").addEventListener("click", function () {
        changeMonth(-1);
    });

    document.querySelector(".month-next").addEventListener("click", function () {
        changeMonth(1);
    });

    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
}

document.addEventListener("DOMContentLoaded", init);
