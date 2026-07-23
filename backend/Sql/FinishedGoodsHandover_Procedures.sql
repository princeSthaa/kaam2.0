CREATE OR ALTER PROCEDURE sp_GetFinishedGoodsHandovers
    @Id UNIQUEIDENTIFIER = NULL,
    @ProductId NVARCHAR(MAX) = NULL,
    @ProductName NVARCHAR(MAX) = NULL,
    @SKU NVARCHAR(MAX) = NULL,
    @Quantity INT = NULL,
    @SourceFactoryLine NVARCHAR(MAX) = NULL,
    @Location NVARCHAR(MAX) = NULL,
    @AcceptedBy NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [FinishedGoodsHandovers]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@ProductId IS NULL OR [ProductId] = @ProductId)
        AND (@ProductName IS NULL OR [ProductName] = @ProductName)
        AND (@SKU IS NULL OR [SKU] = @SKU)
        AND (@Quantity IS NULL OR [Quantity] = @Quantity)
        AND (@SourceFactoryLine IS NULL OR [SourceFactoryLine] = @SourceFactoryLine)
        AND (@Location IS NULL OR [Location] = @Location)
        AND (@AcceptedBy IS NULL OR [AcceptedBy] = @AcceptedBy)
        AND (@Status IS NULL OR [Status] = @Status)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertFinishedGoodsHandover
    @Id UNIQUEIDENTIFIER,
    @ProductId NVARCHAR(MAX),
    @ProductName NVARCHAR(MAX),
    @SKU NVARCHAR(MAX),
    @Quantity INT,
    @SourceFactoryLine NVARCHAR(MAX),
    @Location NVARCHAR(MAX),
    @AcceptedBy NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [FinishedGoodsHandovers] (
        [Id], [ProductId], [ProductName], [SKU], [Quantity], [SourceFactoryLine], [Location], [AcceptedBy], [Status], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @ProductId, @ProductName, @SKU, @Quantity, @SourceFactoryLine, @Location, @AcceptedBy, @Status, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateFinishedGoodsHandover
    @Id UNIQUEIDENTIFIER,
    @ProductId NVARCHAR(MAX),
    @ProductName NVARCHAR(MAX),
    @SKU NVARCHAR(MAX),
    @Quantity INT,
    @SourceFactoryLine NVARCHAR(MAX),
    @Location NVARCHAR(MAX),
    @AcceptedBy NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [FinishedGoodsHandovers]
    SET
        [ProductId] = @ProductId,
        [ProductName] = @ProductName,
        [SKU] = @SKU,
        [Quantity] = @Quantity,
        [SourceFactoryLine] = @SourceFactoryLine,
        [Location] = @Location,
        [AcceptedBy] = @AcceptedBy,
        [Status] = @Status,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteFinishedGoodsHandover
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [FinishedGoodsHandovers] WHERE [Id] = @Id;
END
GO
