CREATE OR ALTER PROCEDURE sp_GetPurchaseOrderItems
    @Id UNIQUEIDENTIFIER = NULL,
    @PurchaseOrderId UNIQUEIDENTIFIER = NULL,
    @MaterialId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        poi.[Id],
        poi.[PurchaseOrderId],
        poi.[MaterialId],
        m.[MaterialCode],
        m.[Name] AS [MaterialName],
        poi.[OrderedQuantity],
        poi.[UnitPrice],
        poi.[TotalPrice],
        poi.[CreatedAt],
        poi.[UpdatedAt]
    FROM [PurchaseOrderItems] poi
    LEFT JOIN [Materials] m ON poi.[MaterialId] = m.[Id]
    WHERE
        (@Id IS NULL OR poi.[Id] = @Id)
        AND (@PurchaseOrderId IS NULL OR poi.[PurchaseOrderId] = @PurchaseOrderId)
        AND (@MaterialId IS NULL OR poi.[MaterialId] = @MaterialId);
END
GO

CREATE OR ALTER PROCEDURE sp_InsertPurchaseOrderItem
    @Id UNIQUEIDENTIFIER,
    @PurchaseOrderId UNIQUEIDENTIFIER,
    @MaterialId UNIQUEIDENTIFIER,
    @OrderedQuantity DECIMAL(18,2),
    @UnitPrice DECIMAL(18,2),
    @TotalPrice DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [PurchaseOrderItems] (
        [Id], [PurchaseOrderId], [MaterialId], [OrderedQuantity], [UnitPrice], [TotalPrice], [CreatedAt], [UpdatedAt]
    )
    VALUES (
        @Id, @PurchaseOrderId, @MaterialId, @OrderedQuantity, @UnitPrice, @TotalPrice, @CreatedAt, @UpdatedAt
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdatePurchaseOrderItem
    @Id UNIQUEIDENTIFIER,
    @OrderedQuantity DECIMAL(18,2),
    @UnitPrice DECIMAL(18,2),
    @TotalPrice DECIMAL(18,2),
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [PurchaseOrderItems]
    SET
        [OrderedQuantity] = @OrderedQuantity,
        [UnitPrice] = @UnitPrice,
        [TotalPrice] = @TotalPrice,
        [UpdatedAt] = @UpdatedAt
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeletePurchaseOrderItem
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [PurchaseOrderItems] WHERE [Id] = @Id;
END
GO
