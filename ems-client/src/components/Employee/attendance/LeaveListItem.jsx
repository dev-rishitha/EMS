import LeaveStatusBadge from "./LeaveStatusBadge";

function LeaveListItem({ r }) {
  return (
    <li className="border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-900">
          {r.type} ({r.days} day{r.days > 1 ? "s" : ""})
        </p>
        <LeaveStatusBadge status={r.status} />
      </div>
      <p className="text-[11px] text-gray-500 mt-0.5">
        {r.startDate} → {r.endDate}
      </p>
      <p className="text-[11px] text-gray-400 mt-0.5">
        Requested on {r.requestedOn}
      </p>
      {r.reason && (
        <p className="text-[11px] text-gray-600 mt-1">
          Reason: {r.reason}
        </p>
      )}
    </li>
  );
}

export default LeaveListItem;
