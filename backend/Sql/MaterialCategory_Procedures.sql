CREATE OR ALTER PROCEDURE sp_GetMaterialCategories
    @Id UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL,
    @MaterialTypeId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [MaterialCategories]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Name IS NULL OR [Name] = @Name)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
        AND (@MaterialTypeId IS NULL OR [MaterialTypeId] = @MaterialTypeId)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertMaterialCategory
    @Id UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @MaterialTypeId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    IF @Id IS NULL OR @Id = '00000000-0000-0000-0000-000000000000'
        SET @Id = NEWID();

    INSERT INTO [MaterialCategories] (
        [Id], [Name], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy], [MaterialTypeId]
    )
    VALUES (
        @Id, @Name, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy, @MaterialTypeId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateMaterialCategory
    @Id UNIQUEIDENTIFIER,
    @Name NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @MaterialTypeId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [MaterialCategories]
    SET
        [Name] = @Name,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy,
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
