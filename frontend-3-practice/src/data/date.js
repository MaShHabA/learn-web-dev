export const MONTHS = [
    "ЯНВАРЬ", "ФЕВРАЛЬ", "МАРТ", "АПРЕЛЬ",
    "МАЙ", "ИЮНЬ", "ИЮЛЬ", "АВГУСТ",
    "СЕНТЯБРЬ", "ОКТЯБРЬ", "НОЯБРЬ", "ДЕКАБРЬ"
];

export const MONTHS_GENITIVE = [
    "января", "февраля", "марта", "апреля",
    "мая", "июня", "июля", "августа",
    "сентября", "октября", "ноября", "декабря"
];

export const DAYS_OF_WEEK = [
    "Воскресенье", "Понедельник", "Вторник", "Среда",
    "Четверг", "Пятница", "Суббота"
];

// Строит календарную сетку из недель по семь дней.
export function buildCalendarGrid(year, month) {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay.getDay() + 6) % 7;
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = offset - 1; i >= 0; i--) {
        cells.push({ day: prevMonthLastDay - i, otherMonth: true });
    }

    for (let day = 1; day <= daysInMonth; day++) {
        cells.push({ day: day, otherMonth: false });
    }

    const totalCells = Math.ceil(cells.length / 7) * 7;
    let nextDay = 1;

    while (cells.length < totalCells) {
        cells.push({ day: nextDay, otherMonth: true });
        nextDay++;
    }

    const weeks = [];

    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }

    return weeks;
}

// Сравнивает две даты: -1 — первая раньше, 0 — равны, 1 — позже.
export function compareDates(date1, date2) {
    const first = new Date(date1.year, date1.month, date1.day);
    const second = new Date(date2.year, date2.month, date2.day);

    if (first < second) return -1;
    if (first > second) return 1;

    return 0;
}

// Проверяет, можно ли выбрать дату.
export function isDateSelectable(day, month, year, today) {
    return compareDates(
        { day: day, month: month, year: year },
        today
    ) >= 0;
}