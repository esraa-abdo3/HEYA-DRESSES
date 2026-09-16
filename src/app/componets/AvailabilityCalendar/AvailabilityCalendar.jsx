"use client";

import { useState, useEffect } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaCircle,
} from "react-icons/fa";
import "./AvailabilityCalendar.css";

// Helper to format any date input (string, Date object, ISO string) to "YYYY-MM-DD" consistently
function formatDateKey(rawDate) {
  if (!rawDate) return "";
  const str = String(rawDate).trim();
  // Extract YYYY-MM-DD directly if string starts with it (e.g. "2026-09-20T..." or "2026-09-20")
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AvailabilityCalendar({ productId, bookedDates = [] }) {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [apiBookedDates, setApiBookedDates] = useState([]);
  const [hoveredDate, setHoveredDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch live active bookings (pending/paid) for current month from API if productId is provided
  useEffect(() => {
    if (!productId) return;

    const fetchActiveBookings = async () => {
      try {
        const monthParam = `${year}-${String(month + 1).padStart(2, "0")}`;
        const res = await fetch(`/api/Bookings?month=${monthParam}`);
        if (res.ok) {
          const data = await res.json();
          const prodBooked = data.bookedDates?.[productId] || [];
          setApiBookedDates(prodBooked);
        }
      } catch (err) {
        console.error("Failed to fetch active bookings:", err);
      }
    };

    fetchActiveBookings();
  }, [productId, year, month]);

  // Combine product.bookedDates AND live apiBookedDates
  const combinedDates = [
    ...(bookedDates || []),
    ...(apiBookedDates || []),
  ];

  // Normalize booked dates into YYYY-MM-DD set
  const bookedSet = new Set(
    combinedDates
      .map(formatDateKey)
      .filter(Boolean)
  );

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Days calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Disable navigating to past months (before today's month)
  const isCurrentOrPastMonth =
    year < now.getFullYear() ||
    (year === now.getFullYear() && month <= now.getMonth());

  const prevMonth = () => {
    if (isCurrentOrPastMonth) return;
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  const days = [];
  // Blank days before first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateKey = `${year}-${formattedMonth}-${formattedDay}`;
    days.push({
      day,
      dateKey,
      isBooked: bookedSet.has(dateKey),
    });
  }

  // Today in local YYYY-MM-DD
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isShowingCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <div className="availability-calendar-wrapper">
      {/* Calendar Top Header */}
      <div className="calendar-header-bar">
        <div className="cal-title-wrap">
          <div className="cal-icon-badge">
            <FaCalendarAlt />
          </div>
          <div className="cal-title-meta">
            <h4 className="cal-month-title">
              {monthNames[month]} <span className="cal-year-title">{year}</span>
            </h4>
            <div className="cal-live-badge">
              <span className="live-pulse-dot" />
              <span>Real-time availability</span>
            </div>
          </div>
        </div>

        <div className="cal-nav-actions">
          {!isShowingCurrentMonth && (
            <button
              type="button"
              onClick={jumpToToday}
              className="cal-today-btn"
              title="Jump to current month"
            >
              Today
            </button>
          )}

          <div className="cal-nav-arrows">
            <button
              type="button"
              onClick={prevMonth}
              disabled={isCurrentOrPastMonth}
              className="cal-nav-btn"
              aria-label="Previous Month"
              title={isCurrentOrPastMonth ? "Cannot view past months" : "Previous Month"}
            >
              <FaChevronLeft />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="cal-nav-btn"
              aria-label="Next Month"
              title="Next Month"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="calendar-grid-box">
        {daysOfWeek.map((d) => (
          <div key={d} className="cal-day-header">
            {d}
          </div>
        ))}

        {days.map((item, index) => {
          if (!item) {
            return <div key={`empty-${index}`} className="cal-day empty" />;
          }

          const isPast = item.dateKey < todayStr;
          const isToday = item.dateKey === todayStr;
          // Only mark as booked if not in the past
          const isBookedActive = !isPast && item.isBooked;

          let statusClass = "available";
          let tooltipText = "Available for rental";

          if (isPast) {
            statusClass = "past";
            tooltipText = "Past date";
          } else if (isBookedActive) {
            statusClass = "booked";
            tooltipText = "Reserved / Booked";
          } else if (isToday) {
            statusClass = "available today";
            tooltipText = "Today • Available";
          }

          return (
            <div
              key={item.dateKey}
              className={`cal-day ${statusClass} ${isToday ? "today-cell" : ""}`}
              onMouseEnter={() => setHoveredDate(item.dateKey)}
              onMouseLeave={() => setHoveredDate(null)}
              title={tooltipText}
            >
              <span className="day-number">{item.day}</span>

              {isBookedActive && (
                <span className="cal-status-indicator booked-indicator" />
              )}

              {isToday && !isBookedActive && (
                <span className="cal-status-indicator today-indicator" />
              )}

              {hoveredDate === item.dateKey && (
                <div className="cal-cell-tooltip">
                  {tooltipText}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend and Info Bar */}
      <div className="calendar-footer-wrap">
        <div className="calendar-legend-bar">
          <div className="legend-item">
            <span className="legend-indicator available-indicator" />
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-indicator booked-indicator-legend" />
            <span>Reserved</span>
          </div>
          <div className="legend-item">
            <span className="legend-indicator today-indicator-legend" />
            <span>Today</span>
          </div>
        </div>

        <p className="calendar-helper-note">
          Dates highlighted in soft pink are already booked by other clients.
        </p>
      </div>
    </div>
  );
}
