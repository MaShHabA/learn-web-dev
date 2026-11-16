function TimeSlots({ slots, selectedTime, onTimeClick }) {
    return (
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
                    onClick={() => onTimeClick(slot.time)}
                >
                    {slot.time}
                    {!slot.available && <span className="busy-label">ЗАНЯТО</span>}
                </button>
            ))}
        </div>
    );
}

export default TimeSlots;