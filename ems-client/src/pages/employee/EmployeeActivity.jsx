import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TaskContext";

function EmployeeActivity() {
  const { user } = useAuth();
  const { tasks } = useTasks();

  const activity = useMemo(() => {
    const myTasks = tasks.filter(
      (t) => t.employeeEmail === user?.email
    );

    const events = [];

    myTasks.forEach((t) => {
      // Created event
      events.push({
        id: `${t.id}-created`,
        type: "created",
        taskTitle: t.title,
        at: t.createdAt,
        message: `Task "${t.title}" assigned to you`
      });

      // Updated event (if not equal to created)
      if (t.updatedAt && t.updatedAt !== t.createdAt) {
        events.push({
          id: `${t.id}-updated`,
          type: "updated",
          taskTitle: t.title,
          at: t.updatedAt,
          message: `Status changed to ${t.status.replace("_", " ")}`
        });
      }
    });

    // sort newest first
    return events
      .filter((e) => e.at)
      .sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [tasks, user?.email]);

  return (
    // <div className="h-screen bg-gray-100 flex">
      <>
        <div className="mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
            Activity / History
          </h1>
          <p className="text-sm text-gray-500">
            Timeline of your task assignments and updates.
          </p>
        </div>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
          {activity.length === 0 && (
            <p className="text-sm text-gray-500">
              No activity yet.
            </p>
          )}

          <ol className="relative border-l border-gray-200 space-y-4 ml-2">
            {activity.map((event) => (
              <li key={event.id} className="ml-4">
                <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-blue-500 border border-white" />
                <p className="text-xs text-gray-400">
                  {event.at
                    ? new Date(event.at).toLocaleString()
                    : ""}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {event.message}
                </p>
                <p className="text-xs text-gray-500">
                  Task: {event.taskTitle}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </>
    // </div>
  );
}

export default EmployeeActivity;
