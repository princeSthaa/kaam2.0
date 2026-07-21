CREATE OR ALTER PROCEDURE sp_GetProductionPlanProducts
    @Id NVARCHAR(MAX) = NULL,
    @LineId NVARCHAR(MAX) = NULL,
    @OrderNo NVARCHAR(MAX) = NULL,
    @ProductId NVARCHAR(MAX) = NULL,
    @ProductCode NVARCHAR(MAX) = NULL,
    @ProductName NVARCHAR(MAX) = NULL,
    @Category NVARCHAR(MAX) = NULL,
    @Variant NVARCHAR(MAX) = NULL,
    @Quantity INT = NULL,
    @RequiredDate DATETIME2 = NULL,
    @Status INT = NULL,
    @ProductImage NVARCHAR(MAX) = NULL,
    @PlannedStartDate DATETIME2 = NULL,
    @PlannedCompletionDate DATETIME2 = NULL,
    @Priority INT = NULL,
    @ProductionNotes NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL,
    @ProductionPlanId NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [ProductionPlanProducts]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@LineId IS NULL OR [LineId] = @LineId)
        AND (@OrderNo IS NULL OR [OrderNo] = @OrderNo)
        AND (@ProductId IS NULL OR [ProductId] = @ProductId)
        AND (@ProductCode IS NULL OR [ProductCode] = @ProductCode)
        AND (@ProductName IS NULL OR [ProductName] = @ProductName)
        AND (@Category IS NULL OR [Category] = @Category)
        AND (@Variant IS NULL OR [Variant] = @Variant)
        AND (@Quantity IS NULL OR [Quantity] = @Quantity)
        AND (@RequiredDate IS NULL OR [RequiredDate] = @RequiredDate)
        AND (@Status IS NULL OR [Status] = @Status)
        AND (@ProductImage IS NULL OR [ProductImage] = @ProductImage)
        AND (@PlannedStartDate IS NULL OR [PlannedStartDate] = @PlannedStartDate)
        AND (@PlannedCompletionDate IS NULL OR [PlannedCompletionDate] = @PlannedCompletionDate)
        AND (@Priority IS NULL OR [Priority] = @Priority)
        AND (@ProductionNotes IS NULL OR [ProductionNotes] = @ProductionNotes)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
        AND (@ProductionPlanId IS NULL OR [ProductionPlanId] = @ProductionPlanId)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertProductionPlanProduct
    @Id NVARCHAR(MAX),
    @LineId NVARCHAR(MAX),
    @OrderNo NVARCHAR(MAX),
    @ProductId NVARCHAR(MAX),
    @ProductCode NVARCHAR(MAX),
    @ProductName NVARCHAR(MAX),
    @Category NVARCHAR(MAX),
    @Variant NVARCHAR(MAX),
    @Quantity INT,
    @RequiredDate DATETIME2,
    @Status INT,
    @ProductImage NVARCHAR(MAX),
    @PlannedStartDate DATETIME2,
    @PlannedCompletionDate DATETIME2,
    @Priority INT,
    @ProductionNotes NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @ProductionPlanId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [ProductionPlanProducts] (
        [Id], [LineId], [OrderNo], [ProductId], [ProductCode], [ProductName], [Category], [Variant], [Quantity], [RequiredDate], [Status], [ProductImage], [PlannedStartDate], [PlannedCompletionDate], [Priority], [ProductionNotes], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy], [ProductionPlanId]
    )
    VALUES (
        @Id, @LineId, @OrderNo, @ProductId, @ProductCode, @ProductName, @Category, @Variant, @Quantity, @RequiredDate, @Status, @ProductImage, @PlannedStartDate, @PlannedCompletionDate, @Priority, @ProductionNotes, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy, @ProductionPlanId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateProductionPlanProduct
    @Id NVARCHAR(MAX),
    @LineId NVARCHAR(MAX),
    @OrderNo NVARCHAR(MAX),
    @ProductId NVARCHAR(MAX),
    @ProductCode NVARCHAR(MAX),
    @ProductName NVARCHAR(MAX),
    @Category NVARCHAR(MAX),
    @Variant NVARCHAR(MAX),
    @Quantity INT,
    @RequiredDate DATETIME2,
    @Status INT,
    @ProductImage NVARCHAR(MAX),
    @PlannedStartDate DATETIME2,
    @PlannedCompletionDate DATETIME2,
    @Priority INT,
    @ProductionNotes NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @ProductionPlanId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [ProductionPlanProducts]
    SET
        [LineId] = @LineId,
        [OrderNo] = @OrderNo,
        [ProductId] = @ProductId,
        [ProductCode] = @ProductCode,
        [ProductName] = @ProductName,
        [Category] = @Category,
        [Variant] = @Variant,
        [Quantity] = @Quantity,
        [RequiredDate] = @RequiredDate,
        [Status] = @Status,
        [ProductImage] = @ProductImage,
        [PlannedStartDate] = @PlannedStartDate,
        [PlannedCompletionDate] = @PlannedCompletionDate,
        [Priority] = @Priority,
        [ProductionNotes] = @ProductionNotes,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy,
        [ProductionPlanId] = @ProductionPlanId
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteProductionPlanProduct
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [ProductionPlanProducts] WHERE [Id] = @Id;
END
GO

