import React from "react";
import { useRouter } from "next/navigation";

interface CalendarCardProps {
  month: string;
  year: number;
  selectedDate: number;
  days: { date: number; weekday: string }[];
}

const CalendarCard: React.FC<CalendarCardProps> = ({
  month,
  year,
  selectedDate,
  days,
}) => {
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const router = useRouter();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg h-full transform transition-all duration-300 hover:shadow-2xl">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          {month} {year}
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <button
            key={day.date}
            className={`aspect-square rounded-xl flex items-center justify-center font-semibold text-sm transition-all ${
              day.date === selectedDate
                ? "bg-[#FF8A00] text-white shadow-lg scale-105"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            {day.date}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button className="w-full bg-[#FF8A00] text-white font-semibold py-3 rounded-full hover:bg-[#FF7700] transition-colors shadow-md">
          Apply Now
        </button>
        <button
          onClick={() => router.push("/dashboard/add-session")}
          className="w-full bg-white text-[#FF8A00] font-semibold py-3 rounded-full border-2 border-[#FF8A00] hover:bg-[#FFF3E0] transition-colors"
        >
          + Add Session
        </button>
      </div>
    </div>
  );
};

export default CalendarCard;