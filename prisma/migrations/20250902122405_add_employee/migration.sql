BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Employee] (
    [id] INT NOT NULL IDENTITY(1,1),
    [firstName] NVARCHAR(1000) NOT NULL,
    [lastName] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000),
    [hireDate] DATETIME2 NOT NULL CONSTRAINT [Employee_hireDate_df] DEFAULT CURRENT_TIMESTAMP,
    [position] NVARCHAR(1000) NOT NULL,
    [cvFile] NVARCHAR(1000),
    [branchDeptId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Employee_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Employee_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Employee_email_key] UNIQUE NONCLUSTERED ([email])
);

-- AddForeignKey
ALTER TABLE [dbo].[Employee] ADD CONSTRAINT [Employee_branchDeptId_fkey] FOREIGN KEY ([branchDeptId]) REFERENCES [dbo].[BranchDepartment]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
