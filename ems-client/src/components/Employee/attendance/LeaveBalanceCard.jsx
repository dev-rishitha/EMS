const Card = ({ children, className = "" }) => (
  <section className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}>
    {children}
  </section>
);

const SummaryItem = ({ label, value }) => (
  <div className="rounded-lg bg-gray-50 px-2 py-2">
    <p className="text-[11px] text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
  </div>
);

const percent = (used, total) =>
  total ? Math.round((used / total) * 100) : 0;

function LeaveBalanceCard({ summary }) {
  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Leave balance
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your annual leave.
        </p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <SummaryItem label="Total" value={summary.total} />
        <SummaryItem label="Used" value={summary.used} />
        <SummaryItem label="Remaining" value={summary.remaining} />
      </div>
      <div className="mt-3 w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-blue-500"
          style={{ width: `${percent(summary.used, summary.total)}%` }}
        />
      </div>
    </Card>
  );
}

export default LeaveBalanceCard;
