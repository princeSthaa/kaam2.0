CREATE OR ALTER PROCEDURE sp_GetPurchaseOrderReceipts
    @Id UNIQUEIDENTIFIER = NULL,
    @PurchaseOrderId UNIQUEIDENTIFIER = NULL,
    @ReceiptNumber NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Receipts
    SELECT 
        por.[Id],
        por.[PurchaseOrderId],
        po.[OrderNumber],
        por.[ReceiptNumber],
        por.[ReceivedDate],
        por.[ReceivedBy],
        por.[DeliveryNoteNumber],
        por.[Remarks],
        por.[Status],
        por.[CreatedAt],
        por.[UpdatedAt]
    FROM [PurchaseOrderReceipts] por
    LEFT JOIN [PurchaseOrders] po ON por.[PurchaseOrderId] = po.[Id]
    WHERE
        (@Id IS NULL OR por.[Id] = @Id)
        AND (@PurchaseOrderId IS NULL OR por.[PurchaseOrderId] = @PurchaseOrderId)
        AND (@ReceiptNumber IS NULL OR por.[ReceiptNumber] = @ReceiptNumber);

    -- 2. Receipt Items
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
    INNER JOIN [PurchaseOrderReceipts] por ON por.[Id] = pori.[PurchaseOrderReceiptId]
    LEFT JOIN [Materials] m ON pori.[MaterialId] = m.[Id]
    WHERE
        (@Id IS NULL OR por.[Id] = @Id)
        AND (@PurchaseOrderId IS NULL OR por.[PurchaseOrderId] = @PurchaseOrderId)
        AND (@ReceiptNumber IS NULL OR por.[ReceiptNumber] = @ReceiptNumber);

END
GO

CREATE OR ALTER PROCEDURE sp_InsertPurchaseOrderReceipt
    @Id UNIQUEIDENTIFIER,
    @PurchaseOrderId UNIQUEIDENTIFIER,
    @ReceiptNumber NVARCHAR(MAX),
    @ReceivedDate DATETIME2,
    @ReceivedBy NVARCHAR(MAX),
    @DeliveryNoteNumber NVARCHAR(MAX),
    @Remarks NVARCHAR(MAX),
    @Status INT,
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [PurchaseOrderReceipts] (
        [Id], [PurchaseOrderId], [ReceiptNumber], [ReceivedDate], [ReceivedBy], [DeliveryNoteNumber], [Remarks], [Status], [CreatedAt], [UpdatedAt]
    )
    VALUES (
        @Id, @PurchaseOrderId, @ReceiptNumber, @ReceivedDate, @ReceivedBy, @DeliveryNoteNumber, @Remarks, @Status, @CreatedAt, @UpdatedAt
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdatePurchaseOrderReceipt
    @Id UNIQUEIDENTIFIER,
    @ReceiptNumber NVARCHAR(MAX),
    @ReceivedDate DATETIME2,
    @ReceivedBy NVARCHAR(MAX),
    @DeliveryNoteNumber NVARCHAR(MAX),
    @Remarks NVARCHAR(MAX),
    @Status INT,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [PurchaseOrderReceipts]
    SET
        [ReceiptNumber] = @ReceiptNumber,
        [ReceivedDate] = @ReceivedDate,
        [ReceivedBy] = @ReceivedBy,
        [DeliveryNoteNumber] = @DeliveryNoteNumber,
        [Remarks] = @Remarks,
        [Status] = @Status,
        [UpdatedAt] = @UpdatedAt
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeletePurchaseOrderReceipt
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [PurchaseOrderReceipts] WHERE [Id] = @Id;
END
GO

