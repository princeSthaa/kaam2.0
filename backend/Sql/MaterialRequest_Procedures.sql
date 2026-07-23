CREATE OR ALTER PROCEDURE sp_GetMaterialRequests
    @Id UNIQUEIDENTIFIER = NULL,
    @MaterialId NVARCHAR(MAX) = NULL,
    @MaterialName NVARCHAR(MAX) = NULL,
    @RequestedQuantity DECIMAL(18,2) = NULL,
    @SupplierName NVARCHAR(MAX) = NULL,
    @Urgency NVARCHAR(MAX) = NULL,
    @RequiredDate DATETIME2 = NULL,
    @Notes NVARCHAR(MAX) = NULL,
    @RequestedBy NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(MAX) = NULL,
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
        AND (@MaterialId IS NULL OR [MaterialId] = @MaterialId)
        AND (@MaterialName IS NULL OR [MaterialName] = @MaterialName)
        AND (@RequestedQuantity IS NULL OR [RequestedQuantity] = @RequestedQuantity)
        AND (@SupplierName IS NULL OR [SupplierName] = @SupplierName)
        AND (@Urgency IS NULL OR [Urgency] = @Urgency)
        AND (@RequiredDate IS NULL OR [RequiredDate] = @RequiredDate)
        AND (@Notes IS NULL OR [Notes] = @Notes)
        AND (@RequestedBy IS NULL OR [RequestedBy] = @RequestedBy)
        AND (@Status IS NULL OR [Status] = @Status)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertMaterialRequest
    @Id UNIQUEIDENTIFIER,
    @MaterialId NVARCHAR(MAX),
    @MaterialName NVARCHAR(MAX),
    @RequestedQuantity DECIMAL(18,2),
    @SupplierName NVARCHAR(MAX),
    @Urgency NVARCHAR(MAX),
    @RequiredDate DATETIME2,
    @Notes NVARCHAR(MAX),
    @RequestedBy NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [MaterialRequests] (
        [Id], [MaterialId], [MaterialName], [RequestedQuantity], [SupplierName], [Urgency], [RequiredDate], [Notes], [RequestedBy], [Status], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @MaterialId, @MaterialName, @RequestedQuantity, @SupplierName, @Urgency, @RequiredDate, @Notes, @RequestedBy, @Status, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateMaterialRequest
    @Id UNIQUEIDENTIFIER,
    @MaterialId NVARCHAR(MAX),
    @MaterialName NVARCHAR(MAX),
    @RequestedQuantity DECIMAL(18,2),
    @SupplierName NVARCHAR(MAX),
    @Urgency NVARCHAR(MAX),
    @RequiredDate DATETIME2,
    @Notes NVARCHAR(MAX),
    @RequestedBy NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [MaterialRequests]
    SET
        [MaterialId] = @MaterialId,
        [MaterialName] = @MaterialName,
        [RequestedQuantity] = @RequestedQuantity,
        [SupplierName] = @SupplierName,
        [Urgency] = @Urgency,
        [RequiredDate] = @RequiredDate,
        [Notes] = @Notes,
        [RequestedBy] = @RequestedBy,
        [Status] = @Status,
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
