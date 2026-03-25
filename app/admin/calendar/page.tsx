"use client";

import { useEffect, useState, useCallback } from "react";

interface AppointmentData {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  cityname: string;
  age: number;
  address: string;
  gender: string;
  description?: string;
  createdAt: string;
}

interface ClosedDayData {
  id: string;
  cityname: string;
  date: string;
}

interface DayInfo {
  date: number;
  appointments: AppointmentData[];
  isClosed: boolean;
  closedCities: string[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

const CITY_COLORS: Record<string, string> = {
  Jaipur: "#2563eb",
  Bikaner: "#16a34a",
  Agra: "#9333ea",
  Alwar: "#0891b2",
};

const getCityColor = (city: string): string => {
  return CITY_COLORS[city] || "#6b7280";
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [closedDays, setClosedDays] = useState<ClosedDayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"month" | "day">("month");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?month=${currentMonth}&year=${currentYear}`);
      const data = await res.json();
      setAppointments(data.appointments || []);
      setClosedDays(data.closedDays || []);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
      setAppointments([]);
      setClosedDays([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setView("month");
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setView("month");
    setSelectedDay(null);
  };

  const getAppointmentsForDate = (day: number): AppointmentData[] => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointments.filter((a) => {
      if (a.date === dateStr) return true;
      // Also match date formats like "2024-01-05" or date stored as ISO string
      try {
        const apptDate = new Date(a.date);
        const apptDateStr = `${apptDate.getFullYear()}-${String(apptDate.getMonth() + 1).padStart(2, "0")}-${String(apptDate.getDate()).padStart(2, "0")}`;
        return apptDateStr === dateStr;
      } catch {
        return false;
      }
    });
  };

  const getClosedForDate = (day: number): string[] => {
    const cities: string[] = [];
    closedDays.forEach((cd) => {
      const d = new Date(cd.date);
      if (d.getDate() === day && d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear) {
        cities.push(cd.cityname);
      }
    });
    return cities;
  };

  const isToday = (day: number): boolean => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() + 1 &&
      currentYear === today.getFullYear()
    );
  };

  const buildCalendarGrid = (): DayInfo[][] => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();

    const rows: DayInfo[][] = [];
    let currentRow: DayInfo[] = [];

    // Fill in previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      currentRow.push({
        date: day,
        appointments: [],
        isClosed: false,
        closedCities: [],
        isToday: false,
        isCurrentMonth: false,
      });
    }

    // Fill in current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayAppts = getAppointmentsForDate(day);
      const closedCities = getClosedForDate(day);
      currentRow.push({
        date: day,
        appointments: dayAppts,
        isClosed: closedCities.length > 0,
        closedCities,
        isToday: isToday(day),
        isCurrentMonth: true,
      });
      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    }

    // Fill remaining cells of last row with next month days
    if (currentRow.length > 0) {
      let nextDay = 1;
      while (currentRow.length < 7) {
        currentRow.push({
          date: nextDay++,
          appointments: [],
          isClosed: false,
          closedCities: [],
          isToday: false,
          isCurrentMonth: false,
        });
      }
      rows.push(currentRow);
    }

    return rows;
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    setSelectedDay(day);
    setView("day");
  };

  const selectedDayAppointments = selectedDay ? getAppointmentsForDate(selectedDay) : [];
  const selectedDayClosedCities = selectedDay ? getClosedForDate(selectedDay) : [];

  return (
    <div style={{ padding: "24px", fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "#111827" }}>
          Appointment Calendar
        </h1>
        <button
          onClick={() => window.print()}
          style={{
            padding: "8px 20px",
            backgroundColor: "#374151",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Print
        </button>
      </div>

      {/* Month Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, background: "#f9fafb", borderRadius: 10, padding: "12px 20px" }}>
        <button
          onClick={goToPrevMonth}
          style={{
            padding: "8px 16px",
            backgroundColor: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          &larr; Prev
        </button>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: "#1f2937" }}>
          {MONTH_NAMES[currentMonth - 1]} {currentYear}
        </h2>
        <button
          onClick={goToNextMonth}
          style={{
            padding: "8px 16px",
            backgroundColor: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Next &rarr;
        </button>
      </div>

      {/* View Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => { setView("month"); setSelectedDay(null); }}
          style={{
            padding: "8px 20px",
            backgroundColor: view === "month" ? "#2563eb" : "#fff",
            color: view === "month" ? "#fff" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Month View
        </button>
        <button
          onClick={() => { if (selectedDay) setView("day"); }}
          style={{
            padding: "8px 20px",
            backgroundColor: view === "day" ? "#2563eb" : "#fff",
            color: view === "day" ? "#fff" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            opacity: selectedDay ? 1 : 0.5,
          }}
        >
          Day View
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280", fontSize: 16 }}>
          Loading calendar...
        </div>
      ) : view === "month" ? (
        /* Month View */
        <div>
          {/* Day Headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, marginBottom: 1 }}>
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  padding: "10px 0",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#6b7280",
                  backgroundColor: "#f3f4f6",
                  borderRadius: day === "Sun" ? "8px 0 0 0" : day === "Sat" ? "0 8px 0 0" : 0,
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {buildCalendarGrid().map((week, weekIdx) => (
            <div key={weekIdx} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
              {week.map((dayInfo, dayIdx) => (
                <div
                  key={dayIdx}
                  onClick={() => handleDayClick(dayInfo.date, dayInfo.isCurrentMonth)}
                  style={{
                    minHeight: 100,
                    padding: 8,
                    backgroundColor: !dayInfo.isCurrentMonth
                      ? "#f9fafb"
                      : dayInfo.isClosed
                      ? "#fef2f2"
                      : "#fff",
                    border: "1px solid #e5e7eb",
                    cursor: dayInfo.isCurrentMonth ? "pointer" : "default",
                    position: "relative",
                    transition: "background-color 0.15s",
                  }}
                >
                  {/* Day Number */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: dayInfo.isToday ? 28 : "auto",
                        height: dayInfo.isToday ? 28 : "auto",
                        borderRadius: "50%",
                        backgroundColor: dayInfo.isToday ? "#2563eb" : "transparent",
                        color: dayInfo.isToday
                          ? "#fff"
                          : !dayInfo.isCurrentMonth
                          ? "#d1d5db"
                          : "#1f2937",
                        fontWeight: dayInfo.isToday ? 700 : 500,
                        fontSize: 13,
                      }}
                    >
                      {dayInfo.date}
                    </span>
                    {dayInfo.isCurrentMonth && dayInfo.appointments.length > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          backgroundColor: "#dbeafe",
                          color: "#1e40af",
                          padding: "1px 6px",
                          borderRadius: 10,
                          fontWeight: 600,
                        }}
                      >
                        {dayInfo.appointments.length}
                      </span>
                    )}
                  </div>

                  {/* Closed Label */}
                  {dayInfo.isCurrentMonth && dayInfo.isClosed && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "#dc2626",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 2,
                      }}
                    >
                      CLOSED
                    </div>
                  )}

                  {/* Appointment Names (up to 3) */}
                  {dayInfo.isCurrentMonth &&
                    dayInfo.appointments.slice(0, 3).map((appt, i) => (
                      <div
                        key={appt.id || i}
                        style={{
                          fontSize: 11,
                          color: getCityColor(appt.cityname),
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: "16px",
                          fontWeight: 500,
                        }}
                      >
                        {appt.name}
                      </div>
                    ))}
                  {dayInfo.isCurrentMonth && dayInfo.appointments.length > 3 && (
                    <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
                      +{dayInfo.appointments.length - 3} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        /* Day View */
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => { setView("month"); setSelectedDay(null); }}
              style={{
                padding: "6px 14px",
                backgroundColor: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              &larr; Back to Month
            </button>
            <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: "#1f2937" }}>
              {MONTH_NAMES[currentMonth - 1]} {selectedDay}, {currentYear}
            </h3>
          </div>

          {selectedDayClosedCities.length > 0 && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 16,
                color: "#dc2626",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              CLOSED for: {selectedDayClosedCities.join(", ")}
            </div>
          )}

          {selectedDayAppointments.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 16 }}>
              No appointments for this day.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {selectedDayAppointments.map((appt, i) => (
                <div
                  key={appt.id || i}
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 16,
                    borderLeft: `4px solid ${getCityColor(appt.cityname)}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#111827" }}>
                      {appt.name}
                    </h4>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 10,
                        backgroundColor: getCityColor(appt.cityname) + "18",
                        color: getCityColor(appt.cityname),
                        fontWeight: 600,
                      }}
                    >
                      {appt.cityname}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280", lineHeight: "22px" }}>
                    <div><strong>Time:</strong> {appt.time}</div>
                    <div><strong>Phone:</strong> {appt.phone}</div>
                    <div><strong>Email:</strong> {appt.email}</div>
                    <div><strong>Age:</strong> {appt.age} | <strong>Gender:</strong> {appt.gender}</div>
                    <div><strong>Address:</strong> {appt.address}</div>
                    {appt.description && (
                      <div style={{ marginTop: 6, fontStyle: "italic", color: "#9ca3af" }}>
                        {appt.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
