"use client";

import React, { useState } from "react";
import ReactCalendar from "react-calendar";
import "../../components/Calendar/Calendar.css";
import { formatISO, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import { toast } from "react-hot-toast";

type Props = {
  closedDays: { id: string; date: Date }[];
  city: string;
};

const ClosingDate = ({ closedDays, city }: Props) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const handleDateClick = (date: Date) => {
    // Check if the date is already selected
    const isDateSelected = selectedDates.some(
      (d) => d.toLocaleDateString() === date.toLocaleDateString()
    );

    if (!isDateSelected) {
      // Update the selectedDates array with the new date
      setSelectedDates([...selectedDates, date]);
    } else {
      // Deselect the date if it's already selected
      const updatedDates = selectedDates.filter(
        (d) => d.toLocaleDateString() !== date.toLocaleDateString()
      );
      setSelectedDates(updatedDates);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/days/closed/${city}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedDates, cityName: city }),
      });

      if (response.ok) {
        toast.success("Dates updated successfully!");
        setSelectedDates([]);
      } else {
        toast.error("Failed to update dates");
      }
    } catch (error) {
      toast.error("Error updating dates");
    }
    location.reload();
  };

  const removeDate = (dateToRemove: Date) => {
    setSelectedDates(selectedDates.filter(
      date => date.toLocaleDateString() !== dateToRemove.toLocaleDateString()
    ));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold">Closing Dates - {city}</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <ReactCalendar
            minDate={new Date()}
            className="REACT-CALENDAR p-2 mx-auto border rounded-lg shadow-sm"
            view="month"
            onClickDay={handleDateClick}
            tileDisabled={({ date, view }) =>
              (view === "month" &&
                closedDays.some(
                  (closedDay) =>
                    date.getFullYear() === closedDay.date.getFullYear() &&
                    date.getMonth() === closedDay.date.getMonth() &&
                    date.getDate() === closedDay.date.getDate()
                )) ||
              isToday(date)
            }
          />
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Selected Dates</h3>
            {selectedDates.length === 0 ? (
              <p className="text-gray-500">No dates selected</p>
            ) : (
              <ul className="space-y-2">
                {selectedDates.map((date) => (
                  <li
                    key={date.toLocaleDateString()}
                    className="flex items-center justify-between bg-white p-2 rounded border"
                  >
                    <span>{date.toLocaleDateString()}</span>
                    <button 
                      onClick={() => removeDate(date)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-base font-medium"
            disabled={selectedDates.length === 0}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClosingDate;
