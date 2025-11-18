// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  

  try {

    // 🔹 Get authenticated user
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    const { role, employeeId } = user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Admin/HR Dashboard Stats
    if (role === "ADMIN" || role === "HR") {
      const [
        totalEmployees,
        pendingLeaves,
        todayAttendance,
        activeProjects,
        completedTasks,
        totalTasks,
        recentLeaves,
        upcomingBirthdays,
        departmentStats
      ] = await Promise.all([
        // Total active employees
        prisma.employee.count({
          where: { deletedAt: null }
        }),

        // Pending leave requests
        prisma.leaveRequest.count({
          where: { status: "PENDING" }
        }),

        // Today's attendance
        prisma.attendance.findMany({
          where: {
            date: {
              gte: today
            }
          },
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }),

        // Active projects
        prisma.project.count({
          where: { status: "ACTIVE" }
        }),

        // Completed tasks
        prisma.task.count({
          where: { status: "COMPLETED" }
        }),

        // Total tasks
        prisma.task.count(),

        // Recent leave requests (last 5)
        prisma.leaveRequest.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }),

        // Upcoming birthdays (mock data - you'll need to add birthDate to schema)
        prisma.employee.findMany({
          take: 5,
          where: { deletedAt: null },
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }),

        // Department-wise employee count
        prisma.department.findMany({
          include: {
            branches: {
              include: {
                _count: {
                  select: { employees: true }
                }
              }
            }
          }
        })
      ]);

      const todayCheckIns = todayAttendance.length;
      const pendingCheckOuts = todayAttendance.filter(a => !a.checkOut).length;

      return NextResponse.json({
        totalEmployees,
        pendingLeaves,
        todayCheckIns,
        pendingCheckOuts,
        activeProjects,
        completedTasks,
        totalTasks,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        recentLeaves,
        upcomingBirthdays,
        departmentStats: departmentStats.map(dept => ({
          name: dept.name,
          employeeCount: dept.branches.reduce((sum, b) => sum + b._count.employees, 0)
        })),
        todayAttendanceDetails: todayAttendance.map(a => ({
          employeeName: `${a.employee.firstName} ${a.employee.lastName}`,
          checkIn: a.checkIn,
          checkOut: a.checkOut,
          status: a.checkOut ? "completed" : "active"
        }))
      });
    }

    // Employee Dashboard Stats
    if (role === "EMPLOYEE" && employeeId) {
      const [
        myTasks,
        myProjects,
        myPendingLeaves,
        myApprovedLeaves,
        myTodayAttendance,
        myWeekAttendance,
        myTasksDetailed
      ] = await Promise.all([
        // My tasks count
        prisma.task.count({
          where: {
            assignedTo: employeeId,
            status: { not: "COMPLETED" }
          }
        }),

        // My projects count
        prisma.projectEmployee.count({
          where: { employeeId }
        }),

        // My pending leave requests
        prisma.leaveRequest.count({
          where: {
            employeeId,
            status: "PENDING"
          }
        }),

        // My approved leaves (to calculate balance)
        prisma.leaveRequest.findMany({
          where: {
            employeeId,
            status: "APPROVED",
            startDate: {
              gte: new Date(new Date().getFullYear(), 0, 1) // This year
            }
          }
        }),

        // Today's attendance
        prisma.attendance.findFirst({
          where: {
            employeeId,
            date: {
              gte: today
            }
          }
        }),

        // This week's attendance
        prisma.attendance.findMany({
          where: {
            employeeId,
            date: {
              gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            }
          },
          orderBy: { date: "desc" }
        }),

        // My tasks with details
        prisma.task.findMany({
          where: {
            assignedTo: employeeId
          },
          include: {
            project: {
              select: {
                title: true
              }
            }
          },
          orderBy: { dueDate: "asc" },
          take: 5
        })
      ]);

      // Calculate leave balance (assuming 20 days per year)
      const usedLeaveDays = myApprovedLeaves.reduce((sum, leave) => sum + leave.numberOfDays, 0);
      const myLeaveBalance = 20 - usedLeaveDays;

      // Calculate weekly hours
      const weeklyHours = myWeekAttendance.reduce((sum, att) => sum + (att.hoursWorked || 0), 0);

      return NextResponse.json({
        myTasks,
        myProjects,
        myPendingLeaves,
        myLeaveBalance: Math.max(0, myLeaveBalance),
        myTodayStatus: myTodayAttendance ? {
          checkedIn: true,
          checkInTime: myTodayAttendance.checkIn,
          checkOutTime: myTodayAttendance.checkOut,
          hoursWorked: myTodayAttendance.hoursWorked
        } : {
          checkedIn: false
        },
        weeklyHours: weeklyHours.toFixed(2),
        myTasksDetailed: myTasksDetailed.map(task => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          projectName: task.project.title
        })),
        myWeeklyAttendance: myWeekAttendance.map(att => ({
          date: att.date,
          hoursWorked: att.hoursWorked
        }))
      });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}