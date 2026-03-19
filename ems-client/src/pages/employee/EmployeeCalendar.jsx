import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TaskContext";

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getMonthDays(viewDate) {
  const start = startOfMonth(viewDate);
  const end = endOfMonth(viewDate);

  const startWeekDay = start.getDay();
  const daysInMonth = end.getDate();

  const days = [];
  for (let i = 0; i < startWeekDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
  }
  return days;
}

// Format Date -> "YYYY-MM-DD" (UTC-safe)
// use LOCAL date, not UTC
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}


// Normalize t.dueDate ("2026-02-25T18:30:00.000Z") to "YYYY-MM-DD"
function normalizeDueDateToKey(dueDate) {
  if (!dueDate) return null;

  if (typeof dueDate === "string") {
    const d = new Date(dueDate);
    if (isNaN(d)) return null;
    return formatDateKey(d); // local date
  }

  if (dueDate instanceof Date) {
    return formatDateKey(dueDate); // local date
  }

  return null;
}

function EmployeeCalendar() {
  const { user } = useAuth();
  const { tasks } = useTasks();

  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // itemsByDate holds both tasks and notes added from this calendar
  // shape: { "2026-02-17": [ { id, type: "task" | "note", text } ] }
  const [itemsByDate, setItemsByDate] = useState({});
  const [draftText, setDraftText] = useState("");
  const [draftType, setDraftType] = useState("task"); // "task" or "note"

  // Group EMS tasks by normalized due date key
  const myTasksByDate = useMemo(() => {
  const grouped = {};

  tasks
    .filter((t) => t.employeeEmail === user?.email && t.dueDate)
    .forEach((t) => {
      const key = normalizeDueDateToKey(t.dueDate);
      if (!key) return;

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    });

    console.log("myTasksByDate:", grouped); // keep this for debugging

    return grouped;
  }, [tasks, user?.email]);

  const monthDays = useMemo(() => getMonthDays(viewDate), [viewDate]);

  const selectedKey = formatDateKey(selectedDate);
  const selectedSystemTasks = myTasksByDate[selectedKey] || [];
  const selectedItems = itemsByDate[selectedKey] || [];
  const selectedUserTasks = selectedItems.filter((i) => i.type === "task");
  const selectedNotes = selectedItems.filter((i) => i.type === "note");

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDate(today);
  };

  const handleDayClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const handleSaveItem = () => {
    const trimmed = draftText.trim();
    if (!trimmed) return;

    setItemsByDate((prev) => {
      const existing = prev[selectedKey] || [];
      const newItem = {
        id: Date.now(),
        type: draftType, // "task" or "note"
        text: trimmed,
      };
      return {
        ...prev,
        [selectedKey]: [...existing, newItem],
      };
    });

    setDraftText("");
  };

  const handleDeleteItem = (dateKey, id) => {
    setItemsByDate((prev) => {
      const existing = prev[dateKey] || [];
      return {
        ...prev,
        [dateKey]: existing.filter((item) => item.id !== id),
      };
    });
  };

  const monthLabel = viewDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    // <div className="h-screen bg-gray-100 flex">
    <>
        <div className="mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
            Calendar
          </h1>
          <p className="text-sm text-gray-500">
            See everything scheduled on each date and add your own tasks or notes.
          </p>
        </div>

        <section className="grid gap-4 lg:grid-cols-3">
          {/* Calendar panel */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Prev
                </button>
                <button
                  onClick={handleToday}
                  className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <p className="text-sm font-medium text-gray-900">{monthLabel}</p>
            </div>

            <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-2">
              <div className="text-center">Sun</div>
              <div className="text-center">Mon</div>
              <div className="text-center">Tue</div>
              <div className="text-center">Wed</div>
              <div className="text-center">Thu</div>
              <div className="text-center">Fri</div>
              <div className="text-center">Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs">
              {monthDays.map((date, idx) => {
                if (!date) {
                  return <div key={idx} className="h-16 rounded-lg" />;
                }

                const key = formatDateKey(date);
                const hasSystemTasks = !!myTasksByDate[key];
                const userItems = itemsByDate[key] || [];
                const hasUserItems = userItems.length > 0;
                const hasAny = hasSystemTasks || hasUserItems;

                const isSelected = selectedKey === key;
                const isToday =
                  new Date().toDateString() === date.toDateString();

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => handleDayClick(date)}
                    className={`h-16 w-full rounded-lg border text-left px-1.5 py-1 transition
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-xs ${
                          isToday ? "font-bold text-blue-600" : "text-gray-700"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    {hasAny && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />
                        {hasSystemTasks && (
                          <span className="text-[10px] text-gray-500">
                            {myTasksByDate[key].length} task
                            {myTasksByDate[key].length > 1 ? "s" : ""}
                          </span>
                        )}
                        {hasUserItems && (
                          <span className="text-[10px] text-gray-400">
                            + {userItems.length} item
                            {userItems.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side panel: tasks + notes */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              {selectedKey}
            </p>

            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Items on this date
            </h2>

            {/* System tasks */}
            <h3 className="text-xs font-semibold text-gray-700 mb-1">
              Assigned tasks (from EMS)
            </h3>
            {selectedSystemTasks.length === 0 ? (
              <p className="text-xs text-gray-500 mb-2">
                No system tasks scheduled for this date.
              </p>
            ) : (
              <ul className="space-y-1 mb-2">
                {selectedSystemTasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-2 py-1.5"
                  >
                    <span className="font-medium text-gray-900">
                      {t.title}
                    </span>
                    <span className="text-[11px] text-gray-500 capitalize">
                      {t.status.replace("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* User tasks added from this calendar */}
            <h3 className="text-xs font-semibold text-gray-700 mb-1 mt-3">
              Tasks you added here
            </h3>
            {selectedUserTasks.length === 0 ? (
              <p className="text-xs text-gray-500 mb-2">
                No personal tasks added for this date.
              </p>
            ) : (
              <ul className="space-y-1 mb-2">
                {selectedUserTasks.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-2 py-1.5"
                  >
                    <span className="text-gray-900">{item.text}</span>
                    <button
                      onClick={() => handleDeleteItem(selectedKey, item.id)}
                      className="text-[10px] text-red-500 hover:underline ml-2"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Notes added from this calendar */}
            <h3 className="text-xs font-semibold text-gray-700 mb-1 mt-3">
              Notes / reminders you added
            </h3>
            {selectedNotes.length === 0 ? (
              <p className="text-xs text-gray-500 mb-2">
                No notes saved for this date.
              </p>
            ) : (
              <ul className="space-y-1 mb-2">
                {selectedNotes.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-2 py-1.5"
                  >
                    <span className="text-gray-900">{item.text}</span>
                    <button
                      onClick={() => handleDeleteItem(selectedKey, item.id)}
                      className="text-[10px] text-red-500 hover:underline ml-2"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Form to add new item */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Add a task or note
              </label>

              <div className="flex items-center gap-2 mb-2">
                <select
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value)}
                  className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="task">Task</option>
                  <option value="note">Note</option>
                </select>
                <span className="text-[11px] text-gray-500">
                  Choose what you are adding.
                </span>
              </div>

              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder={
                  draftType === "task"
                    ? "E.g. Complete timesheet, submit daily report..."
                    : "E.g. Reminder: check with manager..."
                }
                className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[70px]"
              />

              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveItem}
                  className="px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={!draftText.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    // </div>
  );
}

export default EmployeeCalendar;
