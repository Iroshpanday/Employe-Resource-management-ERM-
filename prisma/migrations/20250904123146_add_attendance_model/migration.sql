BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Attendance] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employeeId] INT NOT NULL,
    [date] DATETIME2 NOT NULL,
    [checkIn] DATETIME2 NOT NULL,
    [checkOut] DATETIME2,
    [hoursWorked] FLOAT(53),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Attendance_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Attendance_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Attendance_employeeId_date_key] UNIQUE NONCLUSTERED ([employeeId],[date])
);

-- AddForeignKey
ALTER TABLE [dbo].[Attendance] ADD CONSTRAINT [Attendance_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[Employee]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
