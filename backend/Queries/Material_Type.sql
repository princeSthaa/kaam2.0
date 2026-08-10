CREATE OR ALTER PROCEDURE sp_GetMaterialTypes
    @Id UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(MAX) = NULL,
    @MaterialCode NVARCHAR(MAX) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @IsActive BIT = NULL,
    @Unit NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @UpdatedAt DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM [MaterialTypes]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Name IS NULL OR [Name] = @Name)
        AND (@MaterialCode IS NULL OR [MaterialCode] = @MaterialCode)
        AND (@Description IS NULL OR [Description] = @Description)
        AND (@IsActive IS NULL OR [IsActive] = @IsActive)
        AND (@Unit IS NULL OR [Unit] = @Unit)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt);
END
GO


CREATE OR ALTER PROCEDURE sp_InsertMaterialType
    @Id UNIQUEIDENTIFIER,
    @Name NVARCHAR(MAX),
    @MaterialCode NVARCHAR(MAX),
    @Description NVARCHAR(MAX),
    @IsActive BIT,
    @Unit NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    IF @Id IS NULL OR @Id = '00000000-0000-0000-0000-000000000000'
        SET @Id = NEWID();

    INSERT INTO MaterialTypes
    (
        Id,
        Name,
        MaterialCode,
        Description,
        IsActive,
        Unit,
        CreatedAt,
        UpdatedAt
    )
    VALUES
    (
        @Id,
        @Name,
        @MaterialCode,
        @Description,
        @IsActive,
        @Unit,
        @CreatedAt,
        @UpdatedAt
    );
END
GO


CREATE OR ALTER PROCEDURE sp_UpdateMaterialType
    @Id UNIQUEIDENTIFIER,
    @Name NVARCHAR(MAX),
    @MaterialCode NVARCHAR(MAX),
    @Description NVARCHAR(MAX),
    @IsActive BIT,
    @Unit NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE MaterialTypes
    SET
        Name = @Name,
        MaterialCode = @MaterialCode,
        Description = @Description,
        IsActive = @IsActive,
        Unit = @Unit,
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

    DELETE FROM MaterialTypes
    WHERE Id = @Id;
END
GO