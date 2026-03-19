/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const LeaveContext = createContext(null);

export function LeaveProvider({ children }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from backend
  useEffect(() => {
    const loadLeaves = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/leaves");
        const data = await res.json();

        const mapped = data.map((l) => ({
          id: l.id,
          employeeId: l.employee_id,
          employeeName: l.employee_name,
          employeeEmail: l.employee_email,
          type: l.type, // 'casual' | 'sick' | ...
          startDate: l.start_date,
          endDate: l.end_date,
          // approximate days from dates (table doesn’t store days)
          days: l.days,
          status: l.status,
          reason: l.reason,
          requestedOn: l.requested_on,
          managerNote: l.manager_note || "", // table doesn’t have this yet
          createdAt: l.created_at,
          updatedAt: l.updated_at,
        }));

        setLeaveRequests(mapped);
      } catch (err) {
        console.error("Error fetching leave requests", err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaves();
  }, []);

  // Employee: create new request (hits backend)
  const createLeaveRequest = async (payload) => {
    const res = await fetch("http://localhost:8000/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: payload.employeeId,
      employeeName: payload.employeeName,
      employeeEmail: payload.employeeEmail,
      type: payload.type,
      startDate: payload.startDate,
      endDate: payload.endDate,
      days: payload.days,
      reason: payload.reason,
      requestedOn: payload.requestedOn,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to create leave request");
    }

    const l = await res.json();

    const now = new Date().toISOString();

    const newRequest = {
      id: l.id,
      employeeId: l.employeeId,
      employeeName: l.employeeName,
      employeeEmail: l.employeeEmail,
      type: l.type,
      startDate: l.startDate,
      endDate: l.endDate,
      days: l.days,
      status: l.status,
      reason: l.reason,
      requestedOn: l.requestedOn,
      managerNote: l.managerNote ?? "",
      createdAt: now,
      updatedAt: now,
    };

    setLeaveRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  // Admin: update status (approve/reject) via backend
  const updateLeaveStatus = async ({ id, status, managerNote }) => {
    const normalized = status.toLowerCase();
    const apiStatus =
      normalized === "approved"
        ? "Approved"
        : normalized === "rejected"
        ? "Rejected"
        : "Pending";

    const res = await fetch(
      `http://localhost:8000/api/leaves/${id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: apiStatus, managerNote }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to update leave status");
    }

    const updatedAt = new Date().toISOString();

    setLeaveRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: apiStatus,
              managerNote: managerNote ?? req.managerNote,
              updatedAt,
            }
          : req
      )
    );
  };

  const value = {
    leaveRequests,
    createLeaveRequest,
    updateLeaveStatus,
    loading,
  };

  return (
    <LeaveContext.Provider value={value}>
      {children}
    </LeaveContext.Provider>
  );
}

export const useLeave = () => useContext(LeaveContext);
