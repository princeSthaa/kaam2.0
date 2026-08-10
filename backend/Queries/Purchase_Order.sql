CREATE OR ALTER PROCEDURE sp_GetPurchaseOrders
    @Id UNIQUEIDENTIFIER = NULL,
    @OrderNumber NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(MAX) = NULL,
    @SupplierId UNIQUEIDENTIFIER = NULL,
    @MaterialCategoryId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Purchase Orders
    SELECT 
        po.[Id],
        po.[OrderNumber],
        po.[Status],
        po.[TotalAmount],
        po.[SupplierId],
        s.[SupplierCode],
        s.[Name] AS [SupplierName],
        po.[MaterialCategoryId],
        mc.[Name] AS [MaterialCategoryName],
        po.[ShippingMethod],
        po.[ShippingAddress],
        po.[PaymentTerms],
        po.[ExpectedDeliveryDate],
        po.[CreatedAt],
        po.[UpdatedAt]
    FROM [PurchaseOrders] po
    LEFT JOIN [Suppliers] s ON po.[SupplierId] = s.[Id]
    LEFT JOIN [MaterialCategories] mc ON po.[MaterialCategoryId] = mc.[Id]
    WHERE
        (@Id IS NULL OR po.[Id] = @Id)
        AND (@OrderNumber IS NULL OR po.[OrderNumber] = @OrderNumber)
        AND (@Status IS NULL OR CAST(po.[Status] AS NVARCHAR(MAX)) = @Status)
        AND (@SupplierId IS NULL OR po.[SupplierId] = @SupplierId)
        AND (@MaterialCategoryId IS NULL OR po.[MaterialCategoryId] = @MaterialCategoryId);

    -- 2. Purchase Order Items
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
    INNER JOIN [PurchaseOrders] po ON po.Id = poi.PurchaseOrderId
    LEFT JOIN [Materials] m ON poi.[MaterialId] = m.[Id]
    WHERE
        (@Id IS NULL OR po.[Id] = @Id)
        AND (@OrderNumber IS NULL OR po.[OrderNumber] = @OrderNumber)
        AND (@Status IS NULL OR CAST(po.[Status] AS NVARCHAR(MAX)) = @Status)
        AND (@SupplierId IS NULL OR po.[SupplierId] = @SupplierId)
        AND (@MaterialCategoryId IS NULL OR po.[MaterialCategoryId] = @MaterialCategoryId);

    -- 3. Purchase Order Receipts
    SELECT 
        por.[Id],
        por.[PurchaseOrderId],
        po.[OrderNumber],
        por.[ReceiptNumber],
        por.[ReceivedDate],
        por.[ReceivedBy],
        por.[DeliveryNoteNumber],
        por.[Remarks],
        por.[CreatedAt],
        por.[UpdatedAt]
    FROM [PurchaseOrderReceipts] por
    INNER JOIN [PurchaseOrders] po ON po.Id = por.PurchaseOrderId
    WHERE
        (@Id IS NULL OR po.[Id] = @Id)
        AND (@OrderNumber IS NULL OR po.[OrderNumber] = @OrderNumber)
        AND (@Status IS NULL OR CAST(po.[Status] AS NVARCHAR(MAX)) = @Status)
        AND (@SupplierId IS NULL OR po.[SupplierId] = @SupplierId)
        AND (@MaterialCategoryId IS NULL OR po.[MaterialCategoryId] = @MaterialCategoryId);

    -- 4. Purchase Order Receipt Items
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
    INNER JOIN [PurchaseOrderReceipts] por ON por.Id = pori.PurchaseOrderReceiptId
    INNER JOIN [PurchaseOrders] po ON po.Id = por.PurchaseOrderId
    LEFT JOIN [Materials] m ON pori.[MaterialId] = m.[Id]
    WHERE
        (@Id IS NULL OR po.[Id] = @Id)
        AND (@OrderNumber IS NULL OR po.[OrderNumber] = @OrderNumber)
        AND (@Status IS NULL OR CAST(po.[Status] AS NVARCHAR(MAX)) = @Status)
        AND (@SupplierId IS NULL OR po.[SupplierId] = @SupplierId)
        AND (@MaterialCategoryId IS NULL OR po.[MaterialCategoryId] = @MaterialCategoryId);

END
GO

CREATE OR ALTER PROCEDURE sp_InsertPurchaseOrder
    @Id UNIQUEIDENTIFIER,
    @OrderNumber NVARCHAR(MAX),
    @Status INT,
    @TotalAmount DECIMAL(18,2),
    @SupplierId UNIQUEIDENTIFIER,
    @MaterialCategoryId UNIQUEIDENTIFIER = NULL,
    @ShippingMethod NVARCHAR(MAX),
    @ShippingAddress NVARCHAR(MAX),
    @PaymentTerms NVARCHAR(MAX),
    @ExpectedDeliveryDate DATETIME2,
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [PurchaseOrders] (
        [Id], [OrderNumber], [Status], [TotalAmount], [SupplierId], [MaterialCategoryId],
        [ShippingMethod], [ShippingAddress], [PaymentTerms], [ExpectedDeliveryDate], [CreatedAt], [UpdatedAt]
    )
    VALUES (
        @Id, @OrderNumber, @Status, @TotalAmount, @SupplierId, @MaterialCategoryId,
        @ShippingMethod, @ShippingAddress, @PaymentTerms, @ExpectedDeliveryDate, @CreatedAt, @UpdatedAt
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdatePurchaseOrder
    @Id UNIQUEIDENTIFIER,
    @OrderNumber NVARCHAR(MAX),
    @Status INT,
    @TotalAmount DECIMAL(18,2),
    @SupplierId UNIQUEIDENTIFIER,
    @MaterialCategoryId UNIQUEIDENTIFIER = NULL,
    @ShippingMethod NVARCHAR(MAX),
    @ShippingAddress NVARCHAR(MAX),
    @PaymentTerms NVARCHAR(MAX),
    @ExpectedDeliveryDate DATETIME2,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [PurchaseOrders]
    SET
        [OrderNumber] = @OrderNumber,
        [Status] = @Status,
        [TotalAmount] = @TotalAmount,
        [SupplierId] = @SupplierId,
        [MaterialCategoryId] = @MaterialCategoryId,
        [ShippingMethod] = @ShippingMethod,
        [ShippingAddress] = @ShippingAddress,
        [PaymentTerms] = @PaymentTerms,
        [ExpectedDeliveryDate] = @ExpectedDeliveryDate,
        [UpdatedAt] = @UpdatedAt
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeletePurchaseOrder
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [PurchaseOrders] WHERE [Id] = @Id;
END
GO

