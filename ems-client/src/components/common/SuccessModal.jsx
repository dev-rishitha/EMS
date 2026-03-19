function SuccessModal({ open, title, message, onClose, variant = "success" }) {
  if (!open) return null;

  const isSuccess = variant === "success";
  const iconBg = isSuccess ? "bg-emerald-50" : "bg-amber-50";
  const iconColor = isSuccess ? "text-emerald-600" : "text-amber-600";
  const buttonBg = isSuccess ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-5">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>
            <svg
              className={`h-5 w-5 ${iconColor}`}
              viewBox="0 0 20 20"
              fill="none"
            >
              <circle cx="10" cy="10" r="9" className="stroke-current" strokeWidth="1.5" fill="white" />
              {isSuccess ? (
                <path
                  d="M6 10.5L8.5 13L14 7.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                strokeLinejoin="round"
              />
              ) : (
                <path
                  d="M10 5v6m0 4h.01"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-900">
              {title || (isSuccess ? "Leave request submitted" : "Notice")}
            </h2>
            <p className="mt-1 text-xs text-gray-600">
              {message ||
                (isSuccess
                  ? "Your leave request has been submitted successfully. You can track its status under “My leave requests”."
                  : "")}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium text-white ${buttonBg}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;
