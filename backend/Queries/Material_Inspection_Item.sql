CREATE OR ALTER PROCEDURE sp_GetMaterialInspectionItems
    @Id UNIQUEIDENTIFIER = NULL,
    @MaterialInspectionId UNIQUEIDENTIFIER = NULL,
    @MaterialId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

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
    LEFT JOIN [Materials] m ON mii.[MaterialId] = m.[Id]
    WHERE
        (@Id IS NULL OR mii.[Id] = @Id)
        AND (@MaterialInspectionId IS NULL OR mii.[MaterialInspectionId] = @MaterialInspectionId)
        AND (@MaterialId IS NULL OR mii.[MaterialId] = @MaterialId);
END
GO

CREATE OR ALTER PROCEDURE sp_InsertMaterialInspectionItem
    @Id UNIQUEIDENTIFIER,
    @MaterialInspectionId UNIQUEIDENTIFIER,
    @PurchaseOrderReceiptItemId UNIQUEIDENTIFIER,
    @MaterialId UNIQUEIDENTIFIER,
    @ReceivedQuantity DECIMAL(18,2),
    @AcceptedQuantity DECIMAL(18,2),
    @RejectedQuantity DECIMAL(18,2),
    @InspectionStatus INT,
    @Notes NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [MaterialInspectionItems] (
        [Id], [MaterialInspectionId], [PurchaseOrderReceiptItemId], [MaterialId], 
        [ReceivedQuantity], [AcceptedQuantity], [RejectedQuantity], [InspectionStatus], 
        [Notes], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @MaterialInspectionId, @PurchaseOrderReceiptItemId, @MaterialId, 
        @ReceivedQuantity, @AcceptedQuantity, @RejectedQuantity, @InspectionStatus, 
        @Notes, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateMaterialInspectionItem
    @Id UNIQUEIDENTIFIER,
    @AcceptedQuantity DECIMAL(18,2),
    @RejectedQuantity DECIMAL(18,2),
    @InspectionStatus INT,
    @Notes NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [MaterialInspectionItems]
    SET
        [AcceptedQuantity] = @AcceptedQuantity,
        [RejectedQuantity] = @RejectedQuantity,
        [InspectionStatus] = @InspectionStatus,
        [Notes] = @Notes,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteMaterialInspectionItem
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [MaterialInspectionItems] WHERE [Id] = @Id;
END
GO
