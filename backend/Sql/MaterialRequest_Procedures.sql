CREATE OR ALTER PROCEDURE sp_GetMaterialRequests
    @Id UNIQUEIDENTIFIER = NULL,
    @RequestNumber NVARCHAR(50) = NULL,
    @SupplierId UNIQUEIDENTIFIER = NULL,
    @Status INT = NULL,
    @RequiredDate DATETIME2 = NULL,
    @Notes NVARCHAR(MAX) = NULL,
    @RequestedBy NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [MaterialRequests]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@RequestNumber IS NULL OR [RequestNumber] = @RequestNumber)
        AND (@SupplierId IS NULL OR [SupplierId] = @SupplierId)
        AND (@Status IS NULL OR [Status] = @Status)
        AND (@RequiredDate IS NULL OR [RequiredDate] = @RequiredDate)
        AND (@Notes IS NULL OR [Notes] = @Notes)
        AND (@RequestedBy IS NULL OR [RequestedBy] = @RequestedBy)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertMaterialRequest
    @Id UNIQUEIDENTIFIER,
    @RequestNumber NVARCHAR(50),
    @SupplierId UNIQUEIDENTIFIER = NULL,
    @Status INT = 0,
    @RequiredDate DATETIME2,
    @Notes NVARCHAR(MAX),
    @RequestedBy NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [MaterialRequests] (
        [Id], [RequestNumber], [SupplierId], [Status], [RequiredDate], [Notes], [RequestedBy], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @RequestNumber, @SupplierId, @Status, @RequiredDate, @Notes, @RequestedBy, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateMaterialRequest
    @Id UNIQUEIDENTIFIER,
    @RequestNumber NVARCHAR(50),
    @SupplierId UNIQUEIDENTIFIER = NULL,
    @Status INT = 0,
    @RequiredDate DATETIME2,
    @Notes NVARCHAR(MAX),
    @RequestedBy NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [MaterialRequests]
    SET
        [RequestNumber] = @RequestNumber,
        [SupplierId] = @SupplierId,
        [Status] = @Status,
        [RequiredDate] = @RequiredDate,
        [Notes] = @Notes,
        [RequestedBy] = @RequestedBy,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteMaterialRequest
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [MaterialRequests] WHERE [Id] = @Id;
END
GO
