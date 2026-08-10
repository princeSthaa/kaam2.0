CREATE OR ALTER PROCEDURE sp_GetMaterialInspections
    @Id UNIQUEIDENTIFIER = NULL,
    @PurchaseOrderReceiptId UNIQUEIDENTIFIER = NULL,
    @InspectionStatus NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Inspections
    SELECT 
        mi.[Id],
        mi.[PurchaseOrderReceiptId],
        mi.[SupplierId],
        mi.[InspectionStatus],
        mi.[Notes],
        mi.[InspectorName],
        mi.[CreatedAt],
        mi.[CreatedBy],
        mi.[UpdatedAt],
        mi.[UpdatedBy],
        r.[ReceiptNumber],
        po.[OrderNumber],
        po.[Id] AS [PurchaseOrderId],
        s.[SupplierCode],
        s.[Name] AS [SupplierName]
    FROM [MaterialInspections] mi
    LEFT JOIN [PurchaseOrderReceipts] r ON mi.[PurchaseOrderReceiptId] = r.[Id]
    LEFT JOIN [PurchaseOrders] po ON r.[PurchaseOrderId] = po.[Id]
    LEFT JOIN [Suppliers] s ON po.[SupplierId] = s.[Id]
    WHERE
        (@Id IS NULL OR mi.[Id] = @Id)
        AND (@PurchaseOrderReceiptId IS NULL OR mi.[PurchaseOrderReceiptId] = @PurchaseOrderReceiptId)
        AND (@InspectionStatus IS NULL OR mi.[InspectionStatus] = @InspectionStatus);

    -- 2. Inspection Items
    SELECT 
        mii.[Id],
        mii.[MaterialInspectionId],
        mii.[PurchaseOrderReceiptItemId],
        mii.[MaterialId],
        m.[MaterialCode],
        m.[Name] AS [MaterialName],
        mii.[ReceivedQuantity],
        mii.[AcceptedQuantity],
        mii.[RejectedQuantity],
        mii.[InspectionStatus],
        mii.[Notes],
        mii.[CreatedAt],
        mii.[CreatedBy],
        mii.[UpdatedAt],
        mii.[UpdatedBy]
    FROM [MaterialInspectionItems] mii
    INNER JOIN [MaterialInspections] mi ON mi.[Id] = mii.[MaterialInspectionId]
    LEFT JOIN [Materials] m ON mii.[MaterialId] = m.[Id]
    WHERE
        (@Id IS NULL OR mi.[Id] = @Id)
        AND (@PurchaseOrderReceiptId IS NULL OR mi.[PurchaseOrderReceiptId] = @PurchaseOrderReceiptId)
        AND (@InspectionStatus IS NULL OR mi.[InspectionStatus] = @InspectionStatus);

END
GO

CREATE OR ALTER PROCEDURE sp_InsertMaterialInspection
    @Id UNIQUEIDENTIFIER,
    @PurchaseOrderReceiptId UNIQUEIDENTIFIER,
    @SupplierId UNIQUEIDENTIFIER = NULL,
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
        [Id], [PurchaseOrderReceiptId], [SupplierId], [InspectionStatus], [Notes], [InspectorName], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @PurchaseOrderReceiptId, @SupplierId, @InspectionStatus, @Notes, @InspectorName, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateMaterialInspection
    @Id UNIQUEIDENTIFIER,
    @PurchaseOrderReceiptId UNIQUEIDENTIFIER,
    @SupplierId UNIQUEIDENTIFIER = NULL,
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
        [PurchaseOrderReceiptId] = @PurchaseOrderReceiptId,
        [SupplierId] = @SupplierId,
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


