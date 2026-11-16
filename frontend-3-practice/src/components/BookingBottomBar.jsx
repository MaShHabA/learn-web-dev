import { DAYS_OF_WEEK, MONTHS_GENITIVE } from "../data/date";

function BookingBottomBar({ selectedDay, selectedMonth, selectedYear, selectedTime }) {
    if (selectedDay === null) {
        return (
            <div className="time-bottom">
                <p>ВЫБРАНО: <strong className="selected-value">ВЫБЕРИТЕ ДАТУ</strong></p>
            </div>
        );
    }

    const date = new Date(selectedYear, selectedMonth, selectedDay);
    const dateText =
        DAYS_OF_WEEK[date.getDay()] + ", " +
        selectedDay + " " +
        MONTHS_GENITIVE[selectedMonth] + " " +
        selectedYear;

    const timeText = selectedTime || "время не выбрано";

    return (
        <div className="time-bottom">
            <p>
                ВЫБРАНО:{" "}
                <strong className="selected-value">
                    {dateText} • {timeText}
                </strong>
            </p>
            <a className="continue-button" href="#">ПРОДОЛЖИТЬ</a>
            <a className="alternative" href="#">НЕТ ВРЕМЕНИ? ПОСМОТРИ АЛЬТЕРНАТИВУ →</a>
        </div>
    );
}

export default BookingBottomBar;