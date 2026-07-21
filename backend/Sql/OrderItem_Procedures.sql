CREATE OR ALTER PROCEDURE sp_GetOrderItems
    @Id NVARCHAR(MAX) = NULL,
    @Quantity INT = NULL,
    @UnitPrice DECIMAL(18,2) = NULL,
    @TotalPrice DECIMAL(18,2) = NULL,
    @Discount DECIMAL(18,2) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL,
    @OrderId NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [OrderItems]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Quantity IS NULL OR [Quantity] = @Quantity)
        AND (@UnitPrice IS NULL OR [UnitPrice] = @UnitPrice)
        AND (@TotalPrice IS NULL OR [TotalPrice] = @TotalPrice)
        AND (@Discount IS NULL OR [Discount] = @Discount)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
        AND (@OrderId IS NULL OR [OrderId] = @OrderId)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertOrderItem
    @Id NVARCHAR(MAX),
    @Quantity INT,
    @UnitPrice DECIMAL(18,2),
    @TotalPrice DECIMAL(18,2),
    @Discount DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @ProductId NVARCHAR(MAX),
    @FabricId NVARCHAR(MAX),
    @OrderId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [OrderItems] (
        [Id], [Quantity], [UnitPrice], [TotalPrice], [Discount], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy], [ProductId], [FabricId], [OrderId]
    )
    VALUES (
        @Id, @Quantity, @UnitPrice, @TotalPrice, @Discount, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy, @ProductId, @FabricId, @OrderId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateOrderItem
    @Id NVARCHAR(MAX),
    @Quantity INT,
    @UnitPrice DECIMAL(18,2),
    @TotalPrice DECIMAL(18,2),
    @Discount DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @ProductId NVARCHAR(MAX),
    @FabricId NVARCHAR(MAX),
    @OrderId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [OrderItems]
    SET
        [Quantity] = @Quantity,
        [UnitPrice] = @UnitPrice,
        [TotalPrice] = @TotalPrice,
        [Discount] = @Discount,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy,
        [ProductId] = @ProductId,
        [FabricId] = @FabricId,
        [OrderId] = @OrderId
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteOrderItem
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [OrderItems] WHERE [Id] = @Id;
END
GO

