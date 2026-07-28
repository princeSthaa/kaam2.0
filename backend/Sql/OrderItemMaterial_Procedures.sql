CREATE OR ALTER PROCEDURE sp_GetOrderItemMaterials
    @Id UNIQUEIDENTIFIER = NULL,
    @RequiredQuantity DECIMAL(18,2) = NULL,
    @Unit NVARCHAR(100) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL,
    @MaterialId UNIQUEIDENTIFIER = NULL,
    @OrderItemId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM OrderItemMaterials
    WHERE
        (@Id IS NULL OR Id = @Id)
        AND (@RequiredQuantity IS NULL OR RequiredQuantity = @RequiredQuantity)
        AND (@Unit IS NULL OR Unit = @Unit)
        AND (@CreatedAt IS NULL OR CreatedAt = @CreatedAt)
        AND (@CreatedBy IS NULL OR CreatedBy = @CreatedBy)
        AND (@UpdatedAt IS NULL OR UpdatedAt = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR UpdatedBy = @UpdatedBy)
        AND (@MaterialId IS NULL OR MaterialId = @MaterialId)
        AND (@OrderItemId IS NULL OR OrderItemId = @OrderItemId);
END
GO


CREATE OR ALTER PROCEDURE sp_InsertOrderItemMaterial
    @Id UNIQUEIDENTIFIER = NULL,
    @RequiredQuantity DECIMAL(18,2),
    @Unit NVARCHAR(100),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @MaterialId UNIQUEIDENTIFIER,
    @OrderItemId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    IF @Id IS NULL OR @Id = '00000000-0000-0000-0000-000000000000'
        SET @Id = NEWID();

    INSERT INTO OrderItemMaterials
    (
        Id,
        RequiredQuantity,
        Unit,
        CreatedAt,
        CreatedBy,
        UpdatedAt,
        UpdatedBy,
        MaterialId,
        OrderItemId
    )
    VALUES
    (
        @Id,
        @RequiredQuantity,
        @Unit,
        @CreatedAt,
        @CreatedBy,
        @UpdatedAt,
        @UpdatedBy,
        @MaterialId,
        @OrderItemId
    );
END
GO


CREATE OR ALTER PROCEDURE sp_UpdateOrderItemMaterial
    @Id UNIQUEIDENTIFIER,
    @RequiredQuantity DECIMAL(18,2),
    @Unit NVARCHAR(100),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @MaterialId UNIQUEIDENTIFIER,
    @OrderItemId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE OrderItemMaterials
    SET
        RequiredQuantity = @RequiredQuantity,
        Unit = @Unit,
        CreatedAt = @CreatedAt,
        CreatedBy = @CreatedBy,
        UpdatedAt = @UpdatedAt,
        UpdatedBy = @UpdatedBy,
        MaterialId = @MaterialId,
        OrderItemId = @OrderItemId
    WHERE Id = @Id;
END
GO


CREATE OR ALTER PROCEDURE sp_DeleteOrderItemMaterial
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM OrderItemMaterials
    WHERE Id = @Id;
END
GO