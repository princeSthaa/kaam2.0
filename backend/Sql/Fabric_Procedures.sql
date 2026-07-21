CREATE OR ALTER PROCEDURE sp_GetFabrics
    @Id NVARCHAR(MAX) = NULL,
    @Name NVARCHAR(MAX) = NULL,
    @Category NVARCHAR(MAX) = NULL,
    @ImagePath NVARCHAR(MAX) = NULL,
    @UnitPrice DECIMAL(18,2) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [Fabrics]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Name IS NULL OR [Name] = @Name)
        AND (@Category IS NULL OR [Category] = @Category)
        AND (@ImagePath IS NULL OR [ImagePath] = @ImagePath)
        AND (@UnitPrice IS NULL OR [UnitPrice] = @UnitPrice)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertFabric
    @Id NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @Category NVARCHAR(MAX),
    @ImagePath NVARCHAR(MAX),
    @UnitPrice DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [Fabrics] (
        [Id], [Name], [Category], [ImagePath], [UnitPrice], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @Name, @Category, @ImagePath, @UnitPrice, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateFabric
    @Id NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @Category NVARCHAR(MAX),
    @ImagePath NVARCHAR(MAX),
    @UnitPrice DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [Fabrics]
    SET
        [Name] = @Name,
        [Category] = @Category,
        [ImagePath] = @ImagePath,
        [UnitPrice] = @UnitPrice,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteFabric
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [Fabrics] WHERE [Id] = @Id;
END
GO
