CREATE OR ALTER PROCEDURE sp_GetProducts
    @Id UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(MAX) = NULL,
    @ImagePath NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [Products]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Name IS NULL OR [Name] = @Name)
        AND (@ImagePath IS NULL OR [ImagePath] = @ImagePath)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertProduct
    @Id UNIQUEIDENTIFIER,
    @Name NVARCHAR(MAX),
    @ImagePath NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @SizesJson NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [Products] (
        [Id], [Name], [ImagePath], [Sizes], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @Name, @ImagePath, COALESCE(@SizesJson, '[]'), @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateProduct
    @Id UNIQUEIDENTIFIER,
    @Name NVARCHAR(MAX),
    @ImagePath NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @SizesJson NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [Products]
    SET
        [Name] = @Name,
        [ImagePath] = @ImagePath,
        [Sizes] = COALESCE(@SizesJson, [Sizes]),
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
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
