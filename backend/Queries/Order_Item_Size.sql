IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderItemSizes')
CREATE TABLE OrderItemSizes (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Size INT NOT NULL,
    Quantity INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL,
    CreatedBy NVARCHAR(MAX) NULL,
    UpdatedAt DATETIME2 NOT NULL,
    UpdatedBy NVARCHAR(MAX) NULL,
    OrderItemId UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT FK_OrderItemSizes_OrderItems_OrderItemId FOREIGN KEY (OrderItemId) REFERENCES OrderItems(Id) ON DELETE CASCADE
);
GO

CREATE OR ALTER PROCEDURE sp_GetOrderItemSizes
    @Id UNIQUEIDENTIFIER = NULL,
    @OrderItemId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [OrderItemSizes]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@OrderItemId IS NULL OR [OrderItemId] = @OrderItemId)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertOrderItemSize
    @Id UNIQUEIDENTIFIER,
    @Size INT,
    @Quantity INT,
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @OrderItemId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [OrderItemSizes] (
        [Id], [Size], [Quantity], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy], [OrderItemId]
    )
    VALUES (
        @Id, @Size, @Quantity, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy, @OrderItemId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateOrderItemSize
    @Id UNIQUEIDENTIFIER,
    @Size INT,
    @Quantity INT,
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @OrderItemId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [OrderItemSizes]
    SET
        [Size] = @Size,
        [Quantity] = @Quantity,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy,
        [OrderItemId] = @OrderItemId
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteOrderItemSize
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [OrderItemSizes] WHERE [Id] = @Id;
END
GO
