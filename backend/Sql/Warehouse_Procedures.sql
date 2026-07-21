CREATE OR ALTER PROCEDURE sp_GetWarehouses
    @Id NVARCHAR(MAX) = NULL,
    @Code NVARCHAR(MAX) = NULL,
    @Name NVARCHAR(MAX) = NULL,
    @Location NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [Warehouses]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Code IS NULL OR [Code] = @Code)
        AND (@Name IS NULL OR [Name] = @Name)
        AND (@Location IS NULL OR [Location] = @Location)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertWarehouse
    @Id NVARCHAR(MAX),
    @Code NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @Location NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [Warehouses] (
        [Id], [Code], [Name], [Location], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @Code, @Name, @Location, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateWarehouse
    @Id NVARCHAR(MAX),
    @Code NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @Location NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [Warehouses]
    SET
        [Code] = @Code,
        [Name] = @Name,
        [Location] = @Location,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteWarehouse
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [Warehouses] WHERE [Id] = @Id;
END
GO
