"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Save } from "lucide-react";
import { toast } from "react-hot-toast";

const EditableTable = ({ days }: any) => {
  const [editableDays, setEditableDays] = useState([...days]);

  const handleFieldChange = (index: any, field: any, value: any) => {
    const updatedDays = [...editableDays];
    updatedDays[index][field] = value;
    setEditableDays(updatedDays);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch("/api/days/updatemultiple", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editableDays),
      });

      if (!response.ok) {
        throw new Error("Failed to update data");
      }

      const updatedData = await response.json();
      setEditableDays([...updatedData]);
      toast.success("Times updated successfully!");
    } catch (error) {
      toast.error("Failed to update times");
    }
    location.reload();
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-bold">Opening Hours</h2>
        </div>
        <Button
          onClick={handleUpdate}
          className="h-10 px-6 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Day</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Day No.</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Open Time</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Close Time</th>
            </tr>
          </thead>
          <tbody>
            {editableDays.map((day, index) => (
              <tr
                key={day.id}
                className={`border-b last:border-b-0 ${
                  index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                }`}
              >
                <td className="py-3 px-4">
                  <Input
                    className="bg-transparent border-0 px-0"
                    type="text"
                    value={day.name}
                    disabled
                  />
                </td>
                <td className="py-3 px-4">
                  <Input
                    className="bg-transparent border-0 px-0"
                    type="number"
                    value={day.dayOfWeek}
                    disabled
                  />
                </td>
                <td className="py-3 px-4">
                  <Input
                    className="hover:border-primary focus-visible:ring-primary"
                    type="text"
                    value={day.openTime}
                    onChange={(e) =>
                      handleFieldChange(index, "openTime", e.target.value)
                    }
                    placeholder="e.g. 9:00 AM"
                  />
                </td>
                <td className="py-3 px-4">
                  <Input
                    className="hover:border-primary focus-visible:ring-primary"
                    type="text"
                    value={day.closeTime}
                    onChange={(e) =>
                      handleFieldChange(index, "closeTime", e.target.value)
                    }
                    placeholder="e.g. 5:00 PM"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditableTable;
