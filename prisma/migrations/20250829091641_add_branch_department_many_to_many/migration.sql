/*
  Warnings:

  - You are about to drop the column `departmentId` on the `Branch` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Department` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Branch] DROP CONSTRAINT [Branch_departmentId_fkey];

-- AlterTable
ALTER TABLE [dbo].[Branch] DROP COLUMN [departmentId];
ALTER TABLE [dbo].[Branch] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [Branch_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[location] NVARCHAR(1000),
[updatedAt] DATETIME2 NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Department] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [Department_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[BranchDepartment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [branchId] INT NOT NULL,
    [departmentId] INT NOT NULL,
    CONSTRAINT [BranchDepartment_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [BranchDepartment_branchId_departmentId_key] UNIQUE NONCLUSTERED ([branchId],[departmentId])
);

-- AddForeignKey
ALTER TABLE [dbo].[BranchDepartment] ADD CONSTRAINT [BranchDepartment_branchId_fkey] FOREIGN KEY ([branchId]) REFERENCES [dbo].[Branch]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[BranchDepartment] ADD CONSTRAINT [BranchDepartment_departmentId_fkey] FOREIGN KEY ([departmentId]) REFERENCES [dbo].[Department]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
