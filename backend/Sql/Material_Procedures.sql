CREATE OR ALTER PROCEDURE sp_GetMaterials
    @Id UNIQUEIDENTIFIER = NULL,
    @MaterialCode NVARCHAR(MAX) = NULL,
    @Name NVARCHAR(MAX) = NULL,
    @MaterialTypeId UNIQUEIDENTIFIER = NULL,
    @MaterialCategoryId UNIQUEIDENTIFIER = NULL,
    @AvailableQty DECIMAL(18,2) = NULL,
    @Unit NVARCHAR(MAX) = NULL,
    @ImagePath NVARCHAR(MAX) = NULL,
    @CostPerUnit DECIMAL(18,2) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @UpdatedAt DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM Materials
    WHERE
        (@Id IS NULL OR Id = @Id)
        AND (@MaterialCode IS NULL OR MaterialCode = @MaterialCode)
        AND (@Name IS NULL OR Name = @Name)
        AND (@MaterialTypeId IS NULL OR MaterialTypeId = @MaterialTypeId)
        AND (@MaterialCategoryId IS NULL OR MaterialCategoryId = @MaterialCategoryId)
        AND (@AvailableQty IS NULL OR AvailableQty = @AvailableQty)
        AND (@Unit IS NULL OR Unit = @Unit)
        AND (@ImagePath IS NULL OR ImagePath = @ImagePath)
        AND (@CostPerUnit IS NULL OR CostPerUnit = @CostPerUnit)
        AND (@CreatedAt IS NULL OR CreatedAt = @CreatedAt)
        AND (@CreatedBy IS NULL OR CreatedBy = @CreatedBy)
        AND (@UpdatedAt IS NULL OR UpdatedAt = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR UpdatedBy = @UpdatedBy);
END
GO


CREATE OR ALTER PROCEDURE sp_InsertMaterial
    @Id UNIQUEIDENTIFIER = NULL,
    @MaterialCode NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @MaterialTypeId UNIQUEIDENTIFIER,
    @MaterialCategoryId UNIQUEIDENTIFIER,
    @AvailableQty DECIMAL(18,2),
    @Unit NVARCHAR(MAX),
    @ImagePath NVARCHAR(MAX),
    @CostPerUnit DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    IF @Id IS NULL OR @Id = '00000000-0000-0000-0000-000000000000'
        SET @Id = NEWID();

    INSERT INTO Materials
    (
        Id,
        MaterialCode,
        Name,
        MaterialTypeId,
        MaterialCategoryId,
        AvailableQty,
        Unit,
        ImagePath,
        CostPerUnit,
        CreatedAt,
        CreatedBy,
        UpdatedAt,
        UpdatedBy
    )
    VALUES
    (
        @Id,
        @MaterialCode,
        @Name,
        @MaterialTypeId,
        @MaterialCategoryId,
        @AvailableQty,
        @Unit,
        @ImagePath,
        @CostPerUnit,
        @CreatedAt,
        @CreatedBy,
        @UpdatedAt,
        @UpdatedBy
    );
END
GO


CREATE OR ALTER PROCEDURE sp_UpdateMaterial
    @Id UNIQUEIDENTIFIER,
    @MaterialCode NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @MaterialTypeId UNIQUEIDENTIFIER,
    @MaterialCategoryId UNIQUEIDENTIFIER,
    @AvailableQty DECIMAL(18,2),
    @Unit NVARCHAR(MAX),
    @ImagePath NVARCHAR(MAX),
    @CostPerUnit DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Materials
    SET
        MaterialCode = @MaterialCode,
        Name = @Name,
        MaterialTypeId = @MaterialTypeId,
        MaterialCategoryId = @MaterialCategoryId,
        AvailableQty = @AvailableQty,
        Unit = @Unit,
        ImagePath = @ImagePath,
        CostPerUnit = @CostPerUnit,
        CreatedAt = @CreatedAt,
        CreatedBy = @CreatedBy,
        UpdatedAt = @UpdatedAt,
        UpdatedBy = @UpdatedBy
    WHERE Id = @Id;
END
GO


CREATE OR ALTER PROCEDURE sp_DeleteMaterial
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM Materials
    WHERE Id = @Id;
END
GO