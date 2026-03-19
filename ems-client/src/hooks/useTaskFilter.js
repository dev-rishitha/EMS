import { useMemo, useState } from "react";

export function useTaskFilters(tasks) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredTasks = useMemo(() => {
    const term = search.toLowerCase();
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(term) ||
        t.employeeName.toLowerCase().includes(term) ||
        t.employeeEmail.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ? true : t.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ? true : t.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    filteredTasks
  };
}
