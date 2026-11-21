import { useEffect, useRef, useState } from "react";
import { fetchToday, fetchSlots } from "./api";

const MONTHS = [
    "ЯНВАРЬ", "ФЕВРАЛЬ", "МАРТ", "АПРЕЛЬ",
    "МАЙ", "ИЮНЬ", "ИЮЛЬ", "АВГУСТ",
    "СЕНТЯБРЬ", "ОКТЯБРЬ", "НОЯБРЬ", "ДЕКАБРЬ"
];

const MONTHS_GENITIVE = [
    "января", "февраля", "марта", "апреля",
    "мая", "июня", "июля", "августа",
    "сентября", "октября", "ноября", "декабря"
];

const DAYS_OF_WEEK = [
    "Воскресенье", "Понедельник", "Вторник", "Среда",
    "Четверг", "Пятница", "Суббота"
];

function buildCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay.getDay() + 6) % 7;
    const cells = [];

    for (let i = 0; i < offset; i++) {
        cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        cells.push(day);
    }

    return cells;
}

function compareDates(first, second) {
    return new Date(first.year, first.month, first.day) -
        new Date(second.year, second.month, second.day);
}

function App() {
    const [today, setToday] = useState(null);
    const [loadingToday, setLoadingToday] = useState(true);
    const [errorToday, setErrorToday] = useState(null);

    const [currentMonth, setCurrentMonth] = useState(null);
    const [currentYear, setCurrentYear] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [errorSlots, setErrorSlots] = useState(null);

    const latestDate = useRef(null);

    // Получаем сегодняшнюю дату с сервера при открытии страницы.
    useEffect(() => {
        async function loadToday() {
            try {
                const data = await fetchToday();
                setToday(data);
                setCurrentMonth(data.month);
                setCurrentYear(data.year);
                setSelectedDay(data.day);
            } catch (error) {
                setErrorToday(error.message);
            } finally {
                setLoadingToday(false);
            }
        }

        loadToday();
    }, []);

    // Запрашиваем слоты при первой загрузке и при смене даты.
    useEffect(() => {
        if (selectedDay === null || currentMonth === null || currentYear === null) {
            latestDate.current = null;
            setSlots([]);
            setLoadingSlots(false);
            return;
        }

        const date = {
            day: selectedDay,
            month: currentMonth,
            year: currentYear
        };

        latestDate.current = date;
        setLoadingSlots(true);
        setErrorSlots(null);
        setSelectedTime(null);

        async function loadSlots() {
            try {
                const data = await fetchSlots(date);

                // Не показываем ответ от предыдущей даты,
                // если пользователь успел выбрать другой день.
                const current = latestDate.current;
                if (
                    current &&
                    data.date.day === current.day &&
                    data.date.month === current.month &&
                    data.date.year === current.year
                ) {
                    setSlots(data.slots);
                }
            } catch (error) {
                const current = latestDate.current;
                if (
                    current &&
                    current.day === date.day &&
                    current.month === date.month &&
                    current.year === date.year
                ) {
                    setErrorSlots(error.message);
                }
            } finally {
                const current = latestDate.current;
                if (
                    current &&
                    current.day === date.day &&
                    current.month === date.month &&
                    current.year === date.year
                ) {
                    setLoadingSlots(false);
                }
            }
        }

        loadSlots();
    }, [selectedDay, currentMonth, currentYear]);

    function handleDayClick(day) {
        setSelectedDay(day);
        setSelectedTime(null);
    }

    function changeMonth(step) {
        let month = currentMonth + step;
        let year = currentYear;

        if (month < 0) {
            month = 11;
            year -= 1;
        } else if (month > 11) {
            month = 0;
            year += 1;
        }

        setCurrentMonth(month);
        setCurrentYear(year);
        setSelectedTime(null);

        if (year === today.year && month === today.month) {
            setSelectedDay(today.day);
        } else if (compareDates({ day: 1, month, year }, today) >= 0) {
            setSelectedDay(1);
        } else {
            setSelectedDay(null);
        }
    }

    function handleTimeClick(time) {
        setSelectedTime(time);
    }

    const dateTitle = selectedDay === null
        ? "ВЫБЕРИТЕ ДАТУ"
        : selectedDay + " " +
          MONTHS_GENITIVE[currentMonth].toUpperCase() +
          " · " +
          DAYS_OF_WEEK[new Date(currentYear, currentMonth, selectedDay).getDay()].toUpperCase();

    if (loadingToday) {
        return (
            <div className="page">
                <div className="page-message">Загрузка...</div>
            </div>
        );
    }

    if (errorToday) {
        return (
            <div className="page">
                <div className="page-message error-message">
                    Не удалось загрузить календарь: {errorToday}
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <header className="header">
                <a className="logo" href="#">
                    <span className="logo-name">ХТОНЬ</span>
                    <span className="logo-caption">BARBER • BOTANICAL RITUALS</span>
                </a>

                <nav className="navigation">
                    <a href="#">УСЛУГИ</a>
                    <a href="#">МАСТЕРА</a>
                    <a href="#">АТМОСФЕРА</a>
                    <a href="#">КОНТАКТЫ</a>
                </nav>

                <a className="header-button" href="#">ЗАПИСАТЬСЯ</a>
            </header>

            <main>
                <section className="intro">
                    <p className="overline">ЗАПИСЬ / ШАГ 3</p>
                    <h1>Найди своё время</h1>
                    <p>Выбери удобный день и свободный слот.</p>
                </section>

                <section className="booking">
                    <ol className="steps">
                        <li className="step done">
                            <span className="step-number">1</span>
                            <span>МАСТЕР</span>
                        </li>
                        <li className="step done">
                            <span className="step-number">2</span>
                            <span>УСЛУГА</span>
                        </li>
                        <li className="step current">
                            <span className="step-number">3</span>
                            <span>ВРЕМЯ</span>
                        </li>
                        <li className="step">
                            <span className="step-number">4</span>
                            <span>КОНТАКТЫ</span>
                        </li>
                        <li className="step">
                            <span className="step-number">5</span>
                            <span>ГОТОВО</span>
                        </li>
                    </ol>

                    <div className="booking-content">
                        <section className="calendar">
                            <div className="calendar-header">
                                <h2 className="month-year">
                                    {MONTHS[currentMonth]} {currentYear}
                                </h2>

                                <div className="month-buttons">
                                    <button
                                        type="button"
                                        aria-label="Предыдущий месяц"
                                        onClick={() => changeMonth(-1)}
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Следующий месяц"
                                        onClick={() => changeMonth(1)}
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>

                            <div className="weekdays">
                                <span>ПН</span>
                                <span>ВТ</span>
                                <span>СР</span>
                                <span>ЧТ</span>
                                <span>ПТ</span>
                                <span>СБ</span>
                                <span>ВС</span>
                            </div>

                            <div className="days">
                                {buildCalendar(currentYear, currentMonth).map((day, index) => {
                                    if (day === null) {
                                        return <span className="empty" key={index}></span>;
                                    }

                                    const date = {
                                        day,
                                        month: currentMonth,
                                        year: currentYear
                                    };
                                    const selectable = compareDates(date, today) >= 0;
                                    const isToday =
                                        day === today.day &&
                                        currentMonth === today.month &&
                                        currentYear === today.year;

                                    return (
                                        <button
                                            type="button"
                                            key={day}
                                            className={[
                                                isToday ? "today" : "",
                                                day === selectedDay ? "selected" : "",
                                                selectable ? "" : "disabled"
                                            ].join(" ")}
                                            disabled={!selectable}
                                            onClick={() => handleDayClick(day)}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="calendar-note">
                                Выбранная дата отмечена цветом.
                            </p>
                        </section>

                        <section className="time">
                            <h2 className="time-date">{dateTitle}</h2>
                            <p className="time-description">Доступное время</p>

                            {loadingSlots && (
                                <p className="slots-message">Загрузка слотов...</p>
                            )}

                            {!loadingSlots && errorSlots && (
                                <p className="slots-message error-message">
                                    Не удалось загрузить время: {errorSlots}
                                </p>
                            )}

                            {!loadingSlots && !errorSlots && selectedDay !== null && (
                                <div className="time-slots" aria-label="Доступное время">
                                    {slots.map((slot) => (
                                        <button
                                            type="button"
                                            key={slot.time}
                                            className={[
                                                slot.available ? "" : "unavailable",
                                                selectedTime === slot.time ? "selected" : ""
                                            ].join(" ")}
                                            disabled={!slot.available}
                                            onClick={() => handleTimeClick(slot.time)}
                                        >
                                            {slot.time}
                                            {!slot.available && (
                                                <span className="busy-label">ЗАНЯТО</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!loadingSlots && !errorSlots && selectedDay === null && (
                                <p className="slots-message">В этом месяце нет доступных дат.</p>
                            )}

                            <div className="time-bottom">
                                <p>
                                    ВЫБРАНО:{" "}
                                    <strong>
                                        {selectedDay === null
                                            ? "ВЫБЕРИТЕ ДАТУ"
                                            : DAYS_OF_WEEK[new Date(currentYear, currentMonth, selectedDay).getDay()] +
                                              ", " + selectedDay + " " +
                                              MONTHS_GENITIVE[currentMonth] + " " + currentYear}
                                        {" • "}
                                        {selectedTime || "время не выбрано"}
                                    </strong>
                                </p>
                                <button
                                    className="continue-button"
                                    type="button"
                                    disabled={!selectedTime}
                                >
                                    ПРОДОЛЖИТЬ
                                </button>
                                <a className="alternative" href="#">
                                    НЕТ ВРЕМЕНИ? ПОСМОТРИ АЛЬТЕРНАТИВУ →
                                </a>
                            </div>
                        </section>
                    </div>

                    <a className="back-link" href="#">← НАЗАД</a>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-brand">
                    <span className="footer-logo">ХТОНЬ</span>
                    <p>Лесная тишина. Живой стиль.</p>
                </div>

                <p>МЫ ЗДЕСЬ · ул. Лесная, 18 · Москва</p>
                <p>ЕЖЕДНЕВНО · 10:00–22:00</p>
            </footer>
        </div>
    );
}

export default App;
