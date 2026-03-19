import StatusBadge from "./StatusBadge";

const Card = ({ children, className = "" }) => (
  <section className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}>
    {children}
  </section>
);

function TodayAttendanceCard({
  attendanceToday,
  isMarkingAttendance,
  onCheckIn,
  onCheckOut,
}) {
  return (
    <Card className="p-4 sm:p-5 flex flex-col gap-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Today&apos;s attendance
      </p>
      <p className="text-sm text-gray-500">{attendanceToday.date}</p>
      <p className="text-base sm:text-lg font-semibold text-gray-900">
        {attendanceToday.status}
      </p>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">
        <div>
          <p className="font-medium text-gray-500">Check-in</p>
          <p className="mt-0.5 text-gray-900">{attendanceToday.checkIn}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Check-out</p>
          <p className="mt-0.5 text-gray-900">{attendanceToday.checkOut}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={onCheckIn}
          disabled={isMarkingAttendance}
          className="px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
        >
          Mark Check-in
        </button>
        <button
          type="button"
          onClick={onCheckOut}
          disabled={isMarkingAttendance}
          className="px-3 py-1.5 rounded-lg border border-blue-500 text-blue-700 hover:bg-blue-50 disabled:opacity-60"
        >
          Mark Check-out
        </button>
      </div>
    </Card>
  );
}

export default TodayAttendanceCard;
