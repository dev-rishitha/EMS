import StatusBadge from "./StatusBadge";

const Card = ({ children, className = "" }) => (
  <section className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}>
    {children}
  </section>
);

const SectionHeader = ({ title, subtitle }) => (
  <header className="px-4 sm:px-5 py-3 border-b border-gray-100">
    <h2 className="text-sm sm:text-base font-semibold text-gray-800">
      {title}
    </h2>
    {subtitle && (
      <p className="text-xs text-gray-400">{subtitle}</p>
    )}
  </header>
);

function RecentAttendanceCard({ recentAttendance }) {
  return (
    <Card className="flex-1 flex flex-col">
      <SectionHeader
        title="Recent Attendance"
        subtitle="Last few days of your attendance."
      />
      <div className="flex-1 px-3 sm:px-5 py-3 overflow-y-auto max-h-[320px]">
        <table className="w-full text-xs sm:text-sm">
          <thead className="text-[11px] sm:text-xs text-gray-500 uppercase border-b border-gray-100">
            <tr>
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2 hidden sm:table-cell">Check-in</th>
              <th className="text-left py-2 hidden sm:table-cell">Check-out</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentAttendance.map((row) => (
              <tr key={row.date} className="hover:bg-gray-50">
                <td className="py-2 pr-2 text-gray-800">{row.date}</td>
                <td className="py-2 pr-2">
                  <StatusBadge status={row.status} />
                </td>
                <td className="py-2 pr-2 text-gray-700 hidden sm:table-cell">
                  {row.checkIn}
                </td>
                <td className="py-2 pr-2 text-gray-700 hidden sm:table-cell">
                  {row.checkOut}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default RecentAttendanceCard;
