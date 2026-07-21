CREATE OR ALTER PROCEDURE sp_GetMaterials
    @Id NVARCHAR(MAX) = NULL,
    @MaterialCode NVARCHAR(MAX) = NULL,
    @Name NVARCHAR(MAX) = NULL,
    @Type NVARCHAR(MAX) = NULL,
    @AvailableQty DECIMAL(18,2) = NULL,
    @Unit NVARCHAR(MAX) = NULL,
    @CostPerUnit DECIMAL(18,2) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [Materials]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@MaterialCode IS NULL OR [MaterialCode] = @MaterialCode)
        AND (@Name IS NULL OR [Name] = @Name)
        AND (@Type IS NULL OR [Type] = @Type)
        AND (@AvailableQty IS NULL OR [AvailableQty] = @AvailableQty)
        AND (@Unit IS NULL OR [Unit] = @Unit)
        AND (@CostPerUnit IS NULL OR [CostPerUnit] = @CostPerUnit)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertMaterial
    @Id NVARCHAR(MAX),
    @MaterialCode NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @Type NVARCHAR(MAX),
    @AvailableQty DECIMAL(18,2),
    @Unit NVARCHAR(MAX),
    @CostPerUnit DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [Materials] (
        [Id], [MaterialCode], [Name], [Type], [AvailableQty], [Unit], [CostPerUnit], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @MaterialCode, @Name, @Type, @AvailableQty, @Unit, @CostPerUnit, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateMaterial
    @Id NVARCHAR(MAX),
    @MaterialCode NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @Type NVARCHAR(MAX),
    @AvailableQty DECIMAL(18,2),
    @Unit NVARCHAR(MAX),
    @CostPerUnit DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [Materials]
    SET
        [MaterialCode] = @MaterialCode,
        [Name] = @Name,
        [Type] = @Type,
        [AvailableQty] = @AvailableQty,
        [Unit] = @Unit,
        [CostPerUnit] = @CostPerUnit,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteMaterial
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [Materials] WHERE [Id] = @Id;
END
GO
