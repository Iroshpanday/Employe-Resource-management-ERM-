import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const adminPassword = await bcrypt.hash("admin@123", 10);
  const kapilPassword = await bcrypt.hash("kapil@123", 10);
  const kisuPassword = await bcrypt.hash("kisu@123", 10);

  // Create Admin User + Employee
  const adminEmployee = await prisma.employee.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@gmail.com",
      originalEmail: "admin@gmail.com",
      phone: "1234567890",
      position: "Administrator",
      status: "Active",
      branchDept: {
        create: {
          branch: { create: { name: "Head Office" } },
          department: { create: { name: "Admin Department" } },
        },
      },
      user: {
        create: {
          email: "admin@gmail.com",
          originalEmail: "admin@gmail.com",
          password: adminPassword,
          role: "ADMIN",
        },
      },
    },
  });

  // Create Employee: Kapil
  const kapilEmployee = await prisma.employee.create({
    data: {
      firstName: "Kapil",
      lastName: "Sharma",
      email: "kapil@gmail.com",
      originalEmail: "kapil@gmail.com",
      phone: "9876543210",
      position: "Employee",
      status: "Active",
      branchDept: {
        create: {
          branch: { create: { name: "Main Branch" } },
          department: { create: { name: "Engineering" } },
        },
      },
      user: {
        create: {
          email: "kapil@gmail.com",
          originalEmail: "kapil@gmail.com",
          password: kapilPassword,
          role: "EMPLOYEE",
        },
      },
    },
  });

  // Create HR: Kisu
  const kisuEmployee = await prisma.employee.create({
    data: {
      firstName: "Kisu",
      lastName: "Patel",
      email: "kisu@gmail.com",
      originalEmail: "kisu@gmail.com",
      phone: "9123456780",
      position: "HR",
      status: "Active",
      branchDept: {
        create: {
          branch: { create: { name: "HR Branch" } },
          department: { create: { name: "Human Resources" } },
        },
      },
      user: {
        create: {
          email: "kisu@gmail.com",
          originalEmail: "kisu@gmail.com",
          password: kisuPassword,
          role: "HR",
        },
      },
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
