"use client";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Briefcase,
  UserCheck,
  AlertCircle,
  Award,
  Target,
  BarChart3,
  Activity,
  Cake,
  Bell,
  ArrowRight,
  TrendingDown,
  ListTodo,
  Timer,
  FileText
} from "lucide-react";

type Attendance = {
  id: number;
  employeeId: number;
  date: string;
  checkIn: string;
  checkOut: string | null;
  hoursWorked: number | null;
  employee: {
    firstName: string;
    lastName: string;
  };
};

type TaskDetailed = {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  projectName: string;
};

type LeaveRequest = {
  id: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  status: string;
  employee: {
    firstName: string;
    lastName: string;
  };
};

type DashboardStats = {
  totalEmployees?: number;
  pendingLeaves?: number;
  todayCheckIns?: number;
  pendingCheckOuts?: number;
  activeProjects?: number;
  completedTasks?: number;
  totalTasks?: number;
  taskCompletionRate?: number;
  myTasks?: number;
  myProjects?: number;
  myLeaveBalance?: number;
  myPendingLeaves?: number;
  weeklyHours?: string;
  myTodayStatus?: {
    checkedIn: boolean;
    checkInTime?: string;
    checkOutTime?: string;
    hoursWorked?: number;
  };
  recentLeaves?: LeaveRequest[];
  upcomingBirthdays?: Array<{ firstName: string; lastName: string; email: string }>;
  myTasksDetailed?: TaskDetailed[];
  departmentStats?: Array<{ name: string; employeeCount: number }>;
  myWeeklyAttendance?: Array<{ date: string; hoursWorked: number | null }>;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
   const router = useRouter();

  const isAdminOrHR = user?.role === "ADMIN" || user?.role === "HR";

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = user?.token;
      if (!token) return;

      const [attendanceRes, statsRes] = await Promise.all([
        fetch("/api/attendance?limit=10", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (user?.token) {
      fetchDashboardData();
    }
  }, [user?.token, fetchDashboardData]);

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const token = user?.token;
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (res.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Check-in error:", error);
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckInLoading(true);
    try {
      const token = user?.token;
      const res = await fetch("/api/attendance/checkout", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (res.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Check-out error:", error);
    } finally {
      setCheckInLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "text-red-600 bg-red-100";
      case "MEDIUM": return "text-amber-600 bg-amber-100";
      case "LOW": return "text-green-600 bg-green-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "text-green-600 bg-green-100";
      case "IN_PROGRESS": return "text-blue-600 bg-blue-100";
      case "PENDING": return "text-amber-600 bg-amber-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  // Admin/HR Dashboard
  if (isAdminOrHR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.email?.split('@')[0]}
              </h1>
              <p className="text-slate-600 mt-1">Here&apos;s what&apos;s happening with your team today</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-white rounded-lg transition-colors"
              >
                <Bell className="w-6 h-6 text-slate-600" />
                {(stats.pendingLeaves || 0) > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.pendingLeaves}
                  </span>
                )}
              </button>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                <p className="text-sm text-slate-600">Today</p>
                <p className="text-lg font-semibold text-slate-900">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Employees</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading ? "..." : stats.totalEmployees || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">Active staff</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending Leaves</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {loading ? "..." : stats.pendingLeaves || 0}
                  </p>
                </div>
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600 mr-1" />
                <span className="text-amber-600 font-medium">Needs review</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Today&apos;s Check-ins</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {loading ? "..." : stats.todayCheckIns || 0}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <UserCheck className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">Present today</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending Check-out</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {loading ? "..." : stats.pendingCheckOuts || 0}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Activity className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-red-600 font-medium">Still working</span>
              </div>
            </div>
          </div>

          {/* Task Completion & Department Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Completion Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                <ListTodo className="w-5 h-5 mr-2 text-blue-600" />
                Task Completion Rate
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-slate-900">
                    {stats.taskCompletionRate || 0}%
                  </span>
                  <span className="text-sm text-slate-600">
                    {stats.completedTasks || 0} / {stats.totalTasks || 0} tasks
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.taskCompletionRate || 0}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-slate-600">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.completedTasks || 0}</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-sm text-slate-600">In Progress</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {(stats.totalTasks || 0) - (stats.completedTasks || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Department Overview
              </h2>
              <div className="space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse h-12 bg-slate-100 rounded-lg"></div>
                    ))}
                  </div>
                ) : stats.departmentStats && stats.departmentStats.length > 0 ? (
                  stats.departmentStats.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <span className="font-medium text-slate-900">{dept.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">{dept.employeeCount} employees</span>
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min((dept.employeeCount / (stats.totalEmployees || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">No department data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Attendance */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Attendance
                </h2>
                <button
      onClick={() => router.push("/attendance")}
      className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center"
    >
      View All <ArrowRight className="w-4 h-4 ml-1" />
    </button>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : attendance.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No attendance records yet</p>
              ) : (
                <div className="space-y-3">
                  {attendance.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {record.employee.firstName[0]}{record.employee.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {record.employee.firstName} {record.employee.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{formatDate(record.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">
                          {formatTime(record.checkIn)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {record.checkOut ? formatTime(record.checkOut) : (
                            <span className="text-green-600 font-medium">● Active</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Leave Requests & Birthdays */}
            <div className="space-y-6">
              {/* Recent Leave Requests */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-amber-600" />
                  Recent Leaves
                </h2>
                <div className="space-y-3">
                  {loading ? (
                    <div className="space-y-2">
                      {[1, 2].map(i => (
                        <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-lg"></div>
                      ))}
                    </div>
                  ) : stats.recentLeaves && stats.recentLeaves.length > 0 ? (
                    stats.recentLeaves.slice(0, 3).map((leave) => (
                      <div key={leave.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="font-medium text-slate-900 text-sm">
                          {leave.employee.firstName} {leave.employee.lastName}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">{leave.leaveType}</p>
                        <p className="text-xs text-amber-600 mt-1">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-4">No recent leaves</p>
                  )}
                </div>
              </div>

              {/* Upcoming Birthdays */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <Cake className="w-5 h-5 mr-2 text-pink-600" />
                  Upcoming Birthdays
                </h2>
                <div className="space-y-3">
                  {loading ? (
                    <div className="space-y-2">
                      {[1, 2].map(i => (
                        <div key={i} className="animate-pulse h-12 bg-slate-100 rounded-lg"></div>
                      ))}
                    </div>
                  ) : stats.upcomingBirthdays && stats.upcomingBirthdays.length > 0 ? (
                    stats.upcomingBirthdays.slice(0, 3).map((person, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {person.firstName[0]}{person.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {person.firstName} {person.lastName}
                          </p>
                          <p className="text-xs text-slate-500">Coming soon</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-4">No upcoming birthdays</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Employee Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Hello, {user?.email?.split('@')[0]}!
            </h1>
            <p className="text-slate-600 mt-1">Ready to make today productive?</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
            <p className="text-sm text-slate-600">Today</p>
            <p className="text-lg font-semibold text-slate-900">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Today's Status Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Today&apos;s Status</h2>
              {stats.myTodayStatus?.checkedIn ? (
                <div className="space-y-2">
                  <p className="text-purple-100">
                    ✓ Checked in at {stats.myTodayStatus.checkInTime && formatTime(stats.myTodayStatus.checkInTime)}
                  </p>
                  {stats.myTodayStatus.checkOutTime ? (
                    <p className="text-purple-100">
                      ✓ Checked out at {formatTime(stats.myTodayStatus.checkOutTime)}
                    </p>
                  ) : (
                    <p className="text-purple-100">● Currently working</p>
                  )}
                  {stats.myTodayStatus.hoursWorked && (
                    <p className="text-xl font-bold mt-2">
                      {stats.myTodayStatus.hoursWorked.toFixed(2)} hours today
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-purple-100">You haven&apos;t checked in today</p>
              )}
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleCheckIn}
                disabled={checkInLoading || stats.myTodayStatus?.checkedIn}
                className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Check In
              </button>
              <button
                onClick={handleCheckOut}
                disabled={checkInLoading || !stats.myTodayStatus?.checkedIn || !!stats.myTodayStatus?.checkOutTime}
                className="px-6 py-3 bg-white text-pink-600 rounded-lg hover:bg-pink-50 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <XCircle className="w-5 h-5 inline mr-2" />
                Check Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">My Tasks</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {loading ? "..." : stats.myTasks || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600 font-medium">Active assignments</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">My Projects</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {loading ? "..." : stats.myProjects || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 font-medium">In progress</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Leave Balance</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {loading ? "..." : stats.myLeaveBalance || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">Days available</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Weekly Hours</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {loading ? "..." : stats.weeklyHours || "0"}
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Timer className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-indigo-600 font-medium">This week</span>
            </div>
          </div>
        </div>

        {/* My Tasks & Weekly Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                <ListTodo className="w-5 h-5 mr-2 text-purple-600" />
                My Tasks
              </h2>
              <button className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse h-20 bg-slate-100 rounded-lg"></div>
                ))}
              </div>
            ) : stats.myTasksDetailed && stats.myTasksDetailed.length > 0 ? (
              <div className="space-y-3">
                {stats.myTasksDetailed.map((task) => (
                  <div key={task.id} className="p-4 border border-slate-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-slate-900 flex-1">{task.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{task.projectName}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-slate-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Due {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No tasks assigned yet</p>
                <p className="text-sm text-slate-400 mt-1">Tasks will appear here when assigned</p>
              </div>
            )}
          </div>

          {/* Weekly Attendance Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
              This Week&apos;s Activity
            </h2>
            {loading ? (
              <div className="animate-pulse h-48 bg-slate-100 rounded-lg"></div>
            ) : stats.myWeeklyAttendance && stats.myWeeklyAttendance.length > 0 ? (
              <div className="space-y-3">
                {stats.myWeeklyAttendance.map((day, index) => {
                  const date = new Date(day.date);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const hours = day.hoursWorked || 0;
                  const maxHours = 10;
                  const percentage = (hours / maxHours) * 100;
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-slate-600 w-12">{dayName}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-600 h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        >
                          {hours > 0 && (
                            <span className="text-white text-xs font-medium">
                              {hours.toFixed(1)}h
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-slate-600 w-16 text-right">
                        {hours > 0 ? `${hours.toFixed(1)} hrs` : '-'}
                      </span>
                    </div>
                  );
                })}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Total This Week</span>
                    <span className="text-lg font-bold text-purple-600">{stats.weeklyHours || 0} hours</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No activity this week</p>
                <p className="text-sm text-slate-400 mt-1">Start checking in to track your hours</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              My Recent Attendance
            </h2>
            <button className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center">
              View Full History <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-lg"></div>
              ))}
            </div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No attendance records yet</p>
              <p className="text-sm text-slate-400 mt-1">Check in to start tracking your time</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Check In</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Check Out</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Hours Worked</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-purple-50 transition-colors">
                      <td className="py-4 px-4 text-sm font-medium text-slate-900">{formatDate(record.date)}</td>
                      <td className="py-4 px-4 text-sm text-slate-900">{formatTime(record.checkIn)}</td>
                      <td className="py-4 px-4 text-sm">
                        {record.checkOut ? (
                          <span className="text-slate-900">{formatTime(record.checkOut)}</span>
                        ) : (
                          <span className="text-amber-600 font-medium">Not checked out</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-900">
                        {record.hoursWorked ? `${record.hoursWorked.toFixed(2)} hrs` : "-"}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {record.checkOut ? (
                          <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium flex items-center w-fit">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-1 animate-pulse"></span>
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-purple-300 transition-all flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-900">Request Leave</p>
              <p className="text-sm text-slate-500">Apply for time off</p>
            </div>
          </button>

          <button className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition-all flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-900">My Projects</p>
              <p className="text-sm text-slate-500">View all projects</p>
            </div>
          </button>

          <button className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-green-300 transition-all flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-900">Performance</p>
              <p className="text-sm text-slate-500">View my stats</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}