import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLeave } from "../../context/LeaveContext";
import SuccessModal from "../../components/common/SuccessModal";
import TodayAttendanceCard from "../../components/Employee/attendance/TodayAttendanceCard";
import RecentAttendanceCard from "../../components/Employee/attendance/RecentAttendanceCard";
import LeaveBalanceCard from "../../components/Employee/attendance/LeaveBalanceCard";
import RequestLeaveCard from "../../components/Employee/attendance/RequestLeaveCard";

const getTodayKey = () => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

function EmployeeAttendanceLeave() {
  const { user } = useAuth();
  const { leaveRequests, createLeaveRequest } = useLeave();
  const todayKey = getTodayKey();

  const [attendanceByDate, setAttendanceByDate] = useState({});
  const [leaveForm, setLeaveForm] = useState({
    type: "Casual",
    startDate: "",
    endDate: "", 
   reason: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [showAllLeaves, setShowAllLeaves] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [infoModal, setInfoModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `http://localhost:8000/api/attendance?employeeId=${user.employeeId}`
        );
        const data = await res.json();

        const byDate = {};
        data.forEach((rec) => {
          const d = new Date(rec.date); // works for Date or ISO string
          const dateStr = [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, "0"),
            String(d.getDate()).padStart(2, "0"),
          ].join("-"); // "YYYY-MM-DD"

          byDate[dateStr] = {
            date: dateStr,
            status: rec.status,
            checkIn: rec.checkIn,
            checkOut: rec.checkOut,
          };
        });

        setAttendanceByDate(byDate);
      } catch (err) {
        console.error("Failed to load attendance", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.employeeId) {
      fetchAttendance();
    }
  }, [user?.employeeId]);

  const attendanceToday = useMemo(() => {
    const record = attendanceByDate[todayKey];
    return (
      record || {
        date: todayKey,
        status: "Not Marked",
        checkIn: "-",
        checkOut: "-",
      }
    );
  }, [attendanceByDate, todayKey]);

  const recentAttendance = useMemo(
    () =>
      Object.values(attendanceByDate)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10),
    [attendanceByDate]
  );

  const myLeaveRequests = useMemo(
    () => leaveRequests.filter((r) => r.employeeEmail === user?.email),
    [leaveRequests, user?.email]
  );

  const recentMyLeaveRequests = useMemo(
    () => myLeaveRequests.slice(0, 1),
    [myLeaveRequests]
  );

  const leaveSummary = useMemo(() => {
    const total = 24;
    const used = myLeaveRequests
      .filter((r) => r.status === "Approved" || r.status === "Pending")
      .reduce((sum, r) => sum + r.days, 0);
    return { total, used, remaining: total - used };
  }, [myLeaveRequests]);

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm((prev) => ({ ...prev, [name]: value }));
  };

  const markAttendance = async (type) => {
  const time = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const existing = attendanceByDate[todayKey];

  // 1) Frontend validation (no state change, no API)
  if (type === "check-in") {
    if (existing?.checkIn && existing.checkIn !== "-") {
      setInfoModal({
        open: true,
        title: "Check-in already recorded",
        message: "You have already marked your check-in for today.",
      });
      return;
    }
  } else {
    if (!existing || existing.checkIn === "-") {
      setInfoModal({
        open: true,
        title: "Check-in required",
        message: "Please mark your check-in before checking out.",
      });
      return;
    }
    if (existing.checkOut && existing.checkOut !== "-") {
      setInfoModal({
        open: true,
        title: "Check-out already recorded",
        message: "You have already marked your check-out for today.",
      });
      return;
    }
  }

  // 2) Optimistic update
  setAttendanceByDate((prev) => {
    const prevExisting = prev[todayKey];
    if (type === "check-in") {
      return {
        ...prev,
        [todayKey]: {
          date: todayKey,
          status: "Present",
          checkIn: time,
          checkOut: prevExisting?.checkOut || "-",
        },
      };
    }
    return {
      ...prev,
      [todayKey]: { ...prevExisting, checkOut: time },
    };
  });

  // 3) Call API
  const payload = {
    employeeId: user.employeeId,
    date: todayKey,
    type,
    time,
  };

  const res = await fetch("http://localhost:8000/api/attendance/mark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to persist attendance", res.status, errorText);
    setInfoModal({
      open: true,
      title: "Failed to mark attendance",
      message: "Something went wrong while saving your attendance. Please refresh and try again.",
    });
  }
};

  const handleCheck = async (type) => {
    try {
      setIsMarkingAttendance(true);
      await markAttendance(type);
    } catch (err) {
      console.error("Failed to mark attendance", err);
      alert("Failed to mark attendance. Please try again.");
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    const { startDate, endDate, reason, type } = leaveForm;

    if (!startDate || !endDate || !reason.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      alert("End date cannot be before start date.");
      return;
    }

    const days =
      Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    const payload = {
      type,
      startDate,
      endDate,
      reason: reason.trim(),
      days,
      requestedOn: todayKey,
      employeeName: user.name,
      employeeEmail: user.email,
      employeeId: user.employeeId,  
    };

    try {
      setIsSubmittingLeave(true);
      createLeaveRequest(payload);
      setLeaveForm({ type: "Casual", startDate: "", endDate: "", reason: "" });
      setShowSuccessModal(true); // open modal
    } catch (err) {
      console.error("Failed to submit leave request", err);
      alert("Failed to submit leave request. Please try again.");
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-10 text-sm text-gray-500">
        Loading attendance &amp; leave...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
          Attendance &amp; Leave
        </h1>
        <p className="text-sm text-gray-500">
          View your attendance and request leave.
        </p>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TodayAttendanceCard
          attendanceToday={attendanceToday}
          isMarkingAttendance={isMarkingAttendance}
          onCheckIn={() => handleCheck("check-in")}
          onCheckOut={() => handleCheck("check-out")}
        />
        <LeaveBalanceCard summary={leaveSummary} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch">
        <RecentAttendanceCard recentAttendance={recentAttendance} />
        <RequestLeaveCard
          leaveForm={leaveForm}
          onChange={handleLeaveChange}
          onSubmit={handleLeaveSubmit}
          isSubmittingLeave={isSubmittingLeave}
          myLeaveRequests={myLeaveRequests}
          recentMyLeaveRequests={recentMyLeaveRequests}
          showAllLeaves={showAllLeaves}
          setShowAllLeaves={setShowAllLeaves}
        />
      </div>
      <SuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Leave request submitted"
        message="Your leave request has been sent to your manager. You will be notified once it is approved or rejected."
      />
      <SuccessModal
        open={infoModal.open}
        onClose={() => setInfoModal(m => ({ ...m, open: false }))}
        title={infoModal.title}
        message={infoModal.message}
        variant="warning"
      />
    </div>
  );
}

export default EmployeeAttendanceLeave;
