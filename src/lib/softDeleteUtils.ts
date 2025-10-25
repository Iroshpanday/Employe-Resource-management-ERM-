import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function softDeleteEmployee(employeeId: number) {
  return await prisma.$transaction(async (tx) => {
    // 1. First get the employee with user relation
    const employee = await tx.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: true // Include the user relation
      }
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    // 2. Soft delete employee
    const updatedEmployee = await tx.employee.update({
      where: { id: employeeId },
      data: {
        status: "Inactive",
        deletedAt: new Date(),
        email: `deleted_${Date.now()}_${employeeId}@deleted.com`,
        phone: null
      }
    });

    // 3. Soft delete user account if it exists
    if (employee.user) {
      await tx.user.update({
        where: { id: employee.user.id },
        data: {
          // Remove the 'status' field since User model doesn't have it
          deletedAt: new Date(),
          email: `deleted_user_${Date.now()}_${employee.user.id}@deleted.com`
        }
      });
    }

    return updatedEmployee;
  });
}

export async function restoreEmployee(employeeId: number) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get employee with user relation
    const employee = await tx.employee.findUnique({
      where: { id: employeeId },
      include: { 
        user: true 
      }
    });

    if (!employee) throw new Error("Employee not found");

    // Extract original email before it was modified
    const originalEmail = employee.email.includes('@deleted.com') 
      ? employee.email.split('@')[0].replace(/^deleted_\d+_/, '') + '@original.com' // You'll need to store original email separately
      : employee.email;

    // 2. Restore employee
    const restoredEmployee = await tx.employee.update({
      where: { id: employeeId },
      data: {
        status: "Active",
        deletedAt: null,
        email: originalEmail,
        phone: employee.phone // Restore original phone if needed
      }
    });

    // 3. Restore user if exists
    if (employee.user) {
      const originalUserEmail = employee.user.email.includes('@deleted.com')
        ? employee.user.email.split('@')[0].replace(/^deleted_user_\d+_/, '') + '@original.com'
        : employee.user.email;

      await tx.user.update({
        where: { id: employee.user.id },
        data: {
          deletedAt: null,
          email: originalUserEmail
        }
      });
    }

    return restoredEmployee;
  });
}