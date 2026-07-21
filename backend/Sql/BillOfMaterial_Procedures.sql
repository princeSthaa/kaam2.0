CREATE OR ALTER PROCEDURE sp_GetBillOfMaterials
    @Id NVARCHAR(MAX) = NULL,
    @QtyPerUnit DECIMAL(18,2) = NULL,
    @WastagePercent DECIMAL(18,2) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [BillOfMaterials]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@QtyPerUnit IS NULL OR [QtyPerUnit] = @QtyPerUnit)
        AND (@WastagePercent IS NULL OR [WastagePercent] = @WastagePercent)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertBillOfMaterial
    @Id NVARCHAR(MAX),
    @QtyPerUnit DECIMAL(18,2),
    @WastagePercent DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @ProductId NVARCHAR(MAX),
    @MaterialId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [BillOfMaterials] (
        [Id], [QtyPerUnit], [WastagePercent], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy], [ProductId], [MaterialId]
    )
    VALUES (
        @Id, @QtyPerUnit, @WastagePercent, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy, @ProductId, @MaterialId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateBillOfMaterial
    @Id NVARCHAR(MAX),
    @QtyPerUnit DECIMAL(18,2),
    @WastagePercent DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @ProductId NVARCHAR(MAX),
    @MaterialId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [BillOfMaterials]
    SET
        [QtyPerUnit] = @QtyPerUnit,
        [WastagePercent] = @WastagePercent,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy,
        [ProductId] = @ProductId,
        [MaterialId] = @MaterialId
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteBillOfMaterial
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [BillOfMaterials] WHERE [Id] = @Id;
END
GO

