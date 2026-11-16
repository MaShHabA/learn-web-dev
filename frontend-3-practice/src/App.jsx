import { useState } from "react";
import CalendarGrid from "./components/CalendarGrid";
import TimeSlots from "./components/TimeSlots";
import BookingBottomBar from "./components/BookingBottomBar";
import { MONTHS, MONTHS_GENITIVE, DAYS_OF_WEEK, compareDates } from "./data/date";

// Учебные данные слотов. В реальном проекте они приходили бы с сервера.
const SLOTS_ODD_DAY = [
    { time: "10:00", available: true },
    { time: "11:30", available: true },
    { time: "13:00", available: true },
    { time: "14:30", available: true },
    { time: "16:00", available: false },
    { time: "18:30", available: true }
];

const SLOTS_EVEN_DAY = [
    { time: "10:00", available: true },
    { time: "11:30", available: false },
    { time: "13:00", available: true },
    { time: "14:30", available: true },
    { time: "16:00", available: true },
    { time: "18:30", available: true }
];

function getSlotsForDay(day) {
    return day % 2 === 0 ? SLOTS_EVEN_DAY : SLOTS_ODD_DAY;
}

function App() {
    const now = new Date();

    const today = {
        day: now.getDate(),
        month: now.getMonth(),
        year: now.getFullYear()
    };

    // Состояние страницы.
    const [currentMonth, setCurrentMonth] = useState(today.month);
    const [currentYear, setCurrentYear] = useState(today.year);
    const [selectedDay, setSelectedDay] = useState(today.day);
    const [selectedTime, setSelectedTime] = useState(null);
    const [slots, setSlots] = useState(getSlotsForDay(today.day));

    // При выборе другого дня время сбрасывается.
    function handleDayClick(day) {
        setSelectedDay(day);
        setSelectedTime(null);
        setSlots(getSlotsForDay(day));
    }

    function handleTimeClick(time) {
        setSelectedTime(time);
    }

    // Переключение месяца и года.
    function changeMonth(step) {
        let newMonth = currentMonth + step;
        let newYear = currentYear;

        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }

        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
        setSelectedTime(null);

        if (newYear === today.year && newMonth === today.month) {
            setSelectedDay(today.day);
            setSlots(getSlotsForDay(today.day));
        } else if (compareDates(
            { day: 1, month: newMonth, year: newYear },
            today
        ) >= 0) {
            setSelectedDay(1);
            setSlots(getSlotsForDay(1));
        } else {
            setSelectedDay(null);
            setSlots([]);
        }
    }

    const dateTitle = selectedDay === null
        ? "ВЫБЕРИТЕ ДАТУ"
        : selectedDay + " " +
          MONTHS_GENITIVE[currentMonth].toUpperCase() +
          " · " +
          DAYS_OF_WEEK[new Date(currentYear, currentMonth, selectedDay).getDay()].toUpperCase();

    return (
        <div className="page">
            {/* Шапка сайта */}
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
                {/* Заголовок страницы */}
                <section className="intro">
                    <p className="overline">ЗАПИСЬ / ШАГ 3</p>
                    <h1>Найди своё время</h1>
                    <p>Выбери удобный день и свободный слот.</p>
                </section>

                {/* Выбор даты и времени */}
                <section className="booking">
                    <ol className="steps">
                        <li className="step done">
                            <span className="step-number">1</span>
                            <span>МАСТЕР</span>
                        </li>
                        <li className="step-line"></li>
                        <li className="step done">
                            <span className="step-number">2</span>
                            <span>УСЛУГА</span>
                        </li>
                        <li className="step-line"></li>
                        <li className="step current">
                            <span className="step-number">3</span>
                            <span>ВРЕМЯ</span>
                        </li>
                        <li className="step-line"></li>
                        <li className="step">
                            <span className="step-number">4</span>
                            <span>КОНТАКТЫ</span>
                        </li>
                        <li className="step-line"></li>
                        <li className="step">
                            <span className="step-number">5</span>
                            <span>ГОТОВО</span>
                        </li>
                    </ol>

                    <div className="booking-content">
                        {/* Календарь */}
                        <section className="calendar">
                            <div className="calendar-header">
                                <h2 className="month-year">
                                    {MONTHS[currentMonth]} {currentYear}
                                </h2>

                                <div className="month-buttons">
                                    <button
                                        className="month-prev"
                                        type="button"
                                        aria-label="Предыдущий месяц"
                                        onClick={() => changeMonth(-1)}
                                    >
                                        ‹
                                    </button>
                                    <button
                                        className="month-next"
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

                            <CalendarGrid
                                year={currentYear}
                                month={currentMonth}
                                selectedDay={selectedDay}
                                today={today}
                                onDayClick={handleDayClick}
                            />

                            <p className="calendar-note">
                                Выбранная дата отмечена цветом.
                            </p>
                        </section>

                        {/* Доступное время */}
                        <section className="time">
                            <h2 className="time-date">{dateTitle}</h2>
                            <p className="time-description">Доступное время</p>

                            <TimeSlots
                                slots={slots}
                                selectedTime={selectedTime}
                                onTimeClick={handleTimeClick}
                            />

                            <BookingBottomBar
                                selectedDay={selectedDay}
                                selectedMonth={currentMonth}
                                selectedYear={currentYear}
                                selectedTime={selectedTime}
                            />
                        </section>
                    </div>

                    <a className="back-link" href="#">← НАЗАД</a>
                </section>
            </main>

            {/* Подвал сайта */}
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