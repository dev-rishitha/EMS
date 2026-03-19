function LeaveStatusBadge({ status }) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium";
  const s = status?.toLowerCase();

  if (s === "approved") {
    return (
      <span
        className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-100`}
      >
        Approved
      </span>
    );
  }

  if (s === "rejected") {
    return (
      <span
        className={`${base} bg-rose-50 text-rose-700 border border-rose-100`}
      >
        Rejected
      </span>
    );
  }

  return (
    <span
      className={`${base} bg-amber-50 text-amber-700 border border-amber-100`}
    >
      {status}
    </span>
  );
}

export default LeaveStatusBadge;
