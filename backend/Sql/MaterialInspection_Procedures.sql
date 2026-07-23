CREATE OR ALTER PROCEDURE sp_GetMaterialInspections
    @Id UNIQUEIDENTIFIER = NULL,
    @MaterialId NVARCHAR(MAX) = NULL,
    @MaterialName NVARCHAR(MAX) = NULL,
    @SupplierName NVARCHAR(MAX) = NULL,
    @ReceivedQuantity DECIMAL(18,2) = NULL,
    @InspectionStatus NVARCHAR(MAX) = NULL,
    @Notes NVARCHAR(MAX) = NULL,
    @InspectorName NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [MaterialInspections]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@MaterialId IS NULL OR [MaterialId] = @MaterialId)
        AND (@MaterialName IS NULL OR [MaterialName] = @MaterialName)
        AND (@SupplierName IS NULL OR [SupplierName] = @SupplierName)
        AND (@ReceivedQuantity IS NULL OR [ReceivedQuantity] = @ReceivedQuantity)
        AND (@InspectionStatus IS NULL OR [InspectionStatus] = @InspectionStatus)
        AND (@Notes IS NULL OR [Notes] = @Notes)
        AND (@InspectorName IS NULL OR [InspectorName] = @InspectorName)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertMaterialInspection
    @Id UNIQUEIDENTIFIER,
    @MaterialId NVARCHAR(MAX),
    @MaterialName NVARCHAR(MAX),
    @SupplierName NVARCHAR(MAX),
    @ReceivedQuantity DECIMAL(18,2),
    @InspectionStatus NVARCHAR(MAX),
    @Notes NVARCHAR(MAX),
    @InspectorName NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [MaterialInspections] (
        [Id], [MaterialId], [MaterialName], [SupplierName], [ReceivedQuantity], [InspectionStatus], [Notes], [InspectorName], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @MaterialId, @MaterialName, @SupplierName, @ReceivedQuantity, @InspectionStatus, @Notes, @InspectorName, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateMaterialInspection
    @Id UNIQUEIDENTIFIER,
    @MaterialId NVARCHAR(MAX),
    @MaterialName NVARCHAR(MAX),
    @SupplierName NVARCHAR(MAX),
    @ReceivedQuantity DECIMAL(18,2),
    @InspectionStatus NVARCHAR(MAX),
    @Notes NVARCHAR(MAX),
    @InspectorName NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [MaterialInspections]
    SET
        [MaterialId] = @MaterialId,
        [MaterialName] = @MaterialName,
        [SupplierName] = @SupplierName,
        [ReceivedQuantity] = @ReceivedQuantity,
        [InspectionStatus] = @InspectionStatus,
        [Notes] = @Notes,
        [InspectorName] = @InspectorName,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteMaterialInspection
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [MaterialInspections] WHERE [Id] = @Id;
END
GO
