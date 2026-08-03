CREATE OR ALTER PROCEDURE sp_GetMaterialCategories
    @Id UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @MaterialTypeId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [MaterialCategories]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Name IS NULL OR [Name] = @Name)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@MaterialTypeId IS NULL OR [MaterialTypeId] = @MaterialTypeId)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertMaterialCategory
    @Id UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2,
    @MaterialTypeId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    IF @Id IS NULL OR @Id = '00000000-0000-0000-0000-000000000000'
        SET @Id = NEWID();

    INSERT INTO [MaterialCategories] (
        [Id], [Name], [CreatedAt], [UpdatedAt], [MaterialTypeId]
    )
    VALUES (
        @Id, @Name, @CreatedAt, @UpdatedAt, @MaterialTypeId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateMaterialCategory
    @Id UNIQUEIDENTIFIER,
    @Name NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2,
    @MaterialTypeId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [MaterialCategories]
    SET
        [Name] = @Name,
        [CreatedAt] = @CreatedAt,
        [UpdatedAt] = @UpdatedAt,
        [MaterialTypeId] = @MaterialTypeId
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteMaterialCategory
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [MaterialCategories] WHERE [Id] = @Id;
END
GO
