CREATE OR ALTER PROCEDURE sp_GetProductionPlanProductSizes
    @Id NVARCHAR(MAX) = NULL,
    @Size INT = NULL,
    @Quantity INT = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL,
    @ProductionPlanProductId NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [ProductionPlanProductSizes]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Size IS NULL OR [Size] = @Size)
        AND (@Quantity IS NULL OR [Quantity] = @Quantity)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
        AND (@ProductionPlanProductId IS NULL OR [ProductionPlanProductId] = @ProductionPlanProductId)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertProductionPlanProductSize
    @Id NVARCHAR(MAX),
    @Size INT,
    @Quantity INT,
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @ProductionPlanProductId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [ProductionPlanProductSizes] (
        [Id], [Size], [Quantity], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy], [ProductionPlanProductId]
    )
    VALUES (
        @Id, @Size, @Quantity, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy, @ProductionPlanProductId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateProductionPlanProductSize
    @Id NVARCHAR(MAX),
    @Size INT,
    @Quantity INT,
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @ProductionPlanProductId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [ProductionPlanProductSizes]
    SET
        [Size] = @Size,
        [Quantity] = @Quantity,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy,
        [ProductionPlanProductId] = @ProductionPlanProductId
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteProductionPlanProductSize
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [ProductionPlanProductSizes] WHERE [Id] = @Id;
END
GO

