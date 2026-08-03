-- Add missing columns to Products table if not present
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Products]') AND name = 'SKU')
BEGIN
    ALTER TABLE [Products] ADD [SKU] NVARCHAR(50) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Products]') AND name = 'isActive')
BEGIN
    ALTER TABLE [Products] ADD [isActive] BIT NOT NULL DEFAULT 1;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Products]') AND name = 'ProductCategoryId')
BEGIN
    ALTER TABLE [Products] ADD [ProductCategoryId] UNIQUEIDENTIFIER NULL;
END
GO

CREATE OR ALTER PROCEDURE sp_GetProducts
    @Id UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(MAX) = NULL,
    @SKU NVARCHAR(50) = NULL,
    @ProductCategoryId UNIQUEIDENTIFIER = NULL,
    @ImagePath NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        [Id], 
        ISNULL([SKU], CAST([Id] AS NVARCHAR(50))) AS [SKU], 
        [Name], 
        ISNULL([ImagePath], '') AS [ImagePath], 
        ISNULL([isActive], 1) AS [isActive], 
        [ProductCategoryId],
        ISNULL([CreatedAt], SYSDATETIME()) AS [CreatedAt], 
        ISNULL([UpdatedAt], SYSDATETIME()) AS [UpdatedAt]
    FROM [Products]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Name IS NULL OR [Name] = @Name)
        AND (@SKU IS NULL OR [SKU] = @SKU)
        AND (@ProductCategoryId IS NULL OR [ProductCategoryId] = @ProductCategoryId)
        AND (@ImagePath IS NULL OR [ImagePath] = @ImagePath)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertProduct
    @Id UNIQUEIDENTIFIER,
    @SKU NVARCHAR(50) = NULL,
    @Name NVARCHAR(MAX),
    @ProductCategoryId UNIQUEIDENTIFIER = NULL,
    @isActive BIT = 1,
    @ImagePath NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL,
    @SizesJson NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [Products] (
        [Id], [SKU], [Name], [ProductCategoryId], [isActive], [ImagePath], [CreatedAt], [UpdatedAt]
    )
    VALUES (
        @Id, COALESCE(@SKU, CAST(@Id AS NVARCHAR(50))), @Name, @ProductCategoryId, @isActive, @ImagePath, COALESCE(@CreatedAt, SYSDATETIME()), COALESCE(@UpdatedAt, SYSDATETIME())
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateProduct
    @Id UNIQUEIDENTIFIER,
    @SKU NVARCHAR(50) = NULL,
    @Name NVARCHAR(MAX),
    @ProductCategoryId UNIQUEIDENTIFIER = NULL,
    @isActive BIT = 1,
    @ImagePath NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL,
    @SizesJson NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [Products]
    SET
        [SKU] = COALESCE(@SKU, [SKU]),
        [Name] = @Name,
        [ProductCategoryId] = COALESCE(@ProductCategoryId, [ProductCategoryId]),
        [isActive] = @isActive,
        [ImagePath] = @ImagePath,
        [UpdatedAt] = COALESCE(@UpdatedAt, SYSDATETIME())
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteProduct
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [Products] WHERE [Id] = @Id;
END
GO
