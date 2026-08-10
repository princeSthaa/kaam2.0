CREATE OR ALTER PROCEDURE sp_GetPurchaseOrderReceiptItems
    @Id UNIQUEIDENTIFIER = NULL,
    @PurchaseOrderReceiptId UNIQUEIDENTIFIER = NULL,
    @PurchaseOrderItemId UNIQUEIDENTIFIER = NULL,
    @MaterialId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        pori.[Id],
        pori.[PurchaseOrderReceiptId],
        pori.[PurchaseOrderItemId],
        pori.[MaterialId],
        m.[MaterialCode],
        m.[Name] AS [MaterialName],
        pori.[ReceivedQuantity],
        pori.[CreatedAt],
        pori.[UpdatedAt]
    FROM [PurchaseOrderReceiptItems] pori
    LEFT JOIN [Materials] m ON pori.[MaterialId] = m.[Id]
    WHERE
        (@Id IS NULL OR pori.[Id] = @Id)
        AND (@PurchaseOrderReceiptId IS NULL OR pori.[PurchaseOrderReceiptId] = @PurchaseOrderReceiptId)
        AND (@PurchaseOrderItemId IS NULL OR pori.[PurchaseOrderItemId] = @PurchaseOrderItemId)
        AND (@MaterialId IS NULL OR pori.[MaterialId] = @MaterialId);
END
GO

CREATE OR ALTER PROCEDURE sp_InsertPurchaseOrderReceiptItem
    @Id UNIQUEIDENTIFIER,
    @PurchaseOrderReceiptId UNIQUEIDENTIFIER,
    @PurchaseOrderItemId UNIQUEIDENTIFIER,
    @MaterialId UNIQUEIDENTIFIER,
    @ReceivedQuantity DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [PurchaseOrderReceiptItems] (
        [Id], [PurchaseOrderReceiptId], [PurchaseOrderItemId], [MaterialId], [ReceivedQuantity], [CreatedAt], [UpdatedAt]
    )
    VALUES (
        @Id, @PurchaseOrderReceiptId, @PurchaseOrderItemId, @MaterialId, @ReceivedQuantity, @CreatedAt, @UpdatedAt
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdatePurchaseOrderReceiptItem
    @Id UNIQUEIDENTIFIER,
    @ReceivedQuantity DECIMAL(18,2),
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [PurchaseOrderReceiptItems]
    SET
        [ReceivedQuantity] = @ReceivedQuantity,
        [UpdatedAt] = @UpdatedAt
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeletePurchaseOrderReceiptItem
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [PurchaseOrderReceiptItems] WHERE [Id] = @Id;
END
GO
