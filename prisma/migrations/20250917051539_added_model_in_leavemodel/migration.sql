/*
  Warnings:

  - Added the required column `durationType` to the `LeaveRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leaveType` to the `LeaveRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfDays` to the `LeaveRequest` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[LeaveRequest] DROP CONSTRAINT [LeaveRequest_employeeId_fkey];

-- AlterTable
ALTER TABLE [dbo].[LeaveRequest] ADD [approvalDate] DATETIME2,
[approvedById] INT,
[durationType] NVARCHAR(1000) NOT NULL,
[leaveType] NVARCHAR(1000) NOT NULL,
[numberOfDays] INT NOT NULL;

-- AddForeignKey
ALTER TABLE [dbo].[LeaveRequest] ADD CONSTRAINT [LeaveRequest_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[Employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[LeaveRequest] ADD CONSTRAINT [LeaveRequest_approvedById_fkey] FOREIGN KEY ([approvedById]) REFERENCES [dbo].[Employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
