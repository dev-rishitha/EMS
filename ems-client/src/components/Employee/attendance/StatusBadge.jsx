function StatusBadge({ status }) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium";

  if (status === "Present") {
    return (
      <span
        className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-100`}
      >
        Present
      </span>
    );
  }

  if (status === "Absent") {
    return (
      <span
        className={`${base} bg-rose-50 text-rose-700 border border-rose-100`}
      >
        Absent
      </span>
    );
  }

  if (status === "Not Marked") {
    return (
      <span
        className={`${base} bg-gray-50 text-gray-600 border border-gray-200`}
      >
        Not marked
      </span>
    );
  }

  return (
    <span
      className={`${base} bg-amber-50 text-amber-700 border border-amber-100`}
    >
      Late
    </span>
  );
}

export default StatusBadge;
