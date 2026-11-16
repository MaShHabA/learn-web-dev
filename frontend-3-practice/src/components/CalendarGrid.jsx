import { buildCalendarGrid, isDateSelectable } from "../data/date";

function CalendarGrid({ year, month, selectedDay, today, onDayClick }) {
    const weeks = buildCalendarGrid(year, month);

    return (
        <div className="days" aria-label="Дни месяца">
            {weeks.map((week, weekIndex) => (
                week.map((cell, dayIndex) => {
                    if (cell.otherMonth) {
                        return (
                            <span className="empty" key={weekIndex + "-" + dayIndex}></span>
                        );
                    }

                    const selectable = isDateSelectable(
                        cell.day,
                        month,
                        year,
                        today
                    );

                    const isToday =
                        cell.day === today.day &&
                        month === today.month &&
                        year === today.year;

                    const classes = [
                        isToday ? "today" : "",
                        cell.day === selectedDay ? "selected" : "",
                        selectable ? "" : "disabled"
                    ].join(" ");

                    return (
                        <button
                            type="button"
                            key={weekIndex + "-" + dayIndex}
                            className={classes}
                            disabled={!selectable}
                            onClick={() => onDayClick(cell.day)}
                        >
                            {cell.day}
                        </button>
                    );
                })
            ))}
        </div>
    );
}

export default CalendarGrid;