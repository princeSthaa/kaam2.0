CREATE OR ALTER PROCEDURE sp_GetInventories
    @Id NVARCHAR(MAX) = NULL,
    @SKU NVARCHAR(MAX) = NULL,
    @ItemName NVARCHAR(MAX) = NULL,
    @Type NVARCHAR(MAX) = NULL,
    @Quantity DECIMAL(18,2) = NULL,
    @Location NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [Inventories]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@SKU IS NULL OR [SKU] = @SKU)
        AND (@ItemName IS NULL OR [ItemName] = @ItemName)
        AND (@Type IS NULL OR [Type] = @Type)
        AND (@Quantity IS NULL OR [Quantity] = @Quantity)
        AND (@Location IS NULL OR [Location] = @Location)
        AND (@Status IS NULL OR [Status] = @Status)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertInventory
    @Id NVARCHAR(MAX),
    @SKU NVARCHAR(MAX),
    @ItemName NVARCHAR(MAX),
    @Type NVARCHAR(MAX),
    @Quantity DECIMAL(18,2),
    @Location NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [Inventories] (
        [Id], [SKU], [ItemName], [Type], [Quantity], [Location], [Status], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @SKU, @ItemName, @Type, @Quantity, @Location, @Status, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateInventory
    @Id NVARCHAR(MAX),
    @SKU NVARCHAR(MAX),
    @ItemName NVARCHAR(MAX),
    @Type NVARCHAR(MAX),
    @Quantity DECIMAL(18,2),
    @Location NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [Inventories]
    SET
        [SKU] = @SKU,
        [ItemName] = @ItemName,
        [Type] = @Type,
        [Quantity] = @Quantity,
        [Location] = @Location,
        [Status] = @Status,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteInventory
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [Inventories] WHERE [Id] = @Id;
END
GO
