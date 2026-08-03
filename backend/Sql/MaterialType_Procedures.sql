CREATE OR ALTER PROCEDURE sp_GetMaterialTypes
    @Id UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @UpdatedAt DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [MaterialTypes]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Name IS NULL OR [Name] = @Name)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertMaterialType
    @Id UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    IF @Id IS NULL OR @Id = '00000000-0000-0000-0000-000000000000'
        SET @Id = NEWID();

    INSERT INTO MaterialTypes (
        Id, Name, CreatedAt, UpdatedAt
    )
    VALUES (
        @Id, @Name, @CreatedAt, @UpdatedAt
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateMaterialType
    @Id UNIQUEIDENTIFIER,
    @Name NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE MaterialTypes
    SET
        Name = @Name,
        CreatedAt = @CreatedAt,
        UpdatedAt = @UpdatedAt
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteMaterialType
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [MaterialTypes] WHERE [Id] = @Id;
END
GO
