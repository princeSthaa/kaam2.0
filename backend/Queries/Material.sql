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

    SELECT 
    m.Id,
    m.MaterialCode,
    m.Name,
    m.MaterialTypeId,
    mt.Name AS MaterialTypeName,
    m.MaterialCategoryId,
    mc.Name AS MaterialCategoryName,
    ISNULL((SELECT SUM(Quantity) FROM Inventories i WHERE i.MaterialId = m.Id), 0) AS AvailableQty,
    mt.Unit,
    m.ImagePath,
    m.CostPerUnit
    FROM Materials m
    LEFT JOIN MaterialCategories mc
       ON mc.Id = m.MaterialCategoryId
    LEFT JOIN MaterialTypes mt
        ON mt.Id = m.MaterialTypeId
    WHERE
        (@Id IS NULL OR m.Id = @Id)
        AND (@MaterialCode IS NULL OR m.MaterialCode = @MaterialCode)
        AND (@Name IS NULL OR m.Name = @Name)
        AND (@MaterialTypeId IS NULL OR m.MaterialTypeId = @MaterialTypeId)
        AND (@MaterialCategoryId IS NULL OR m.MaterialCategoryId = @MaterialCategoryId)
        AND (@AvailableQty IS NULL OR ISNULL((SELECT SUM(Quantity) FROM Inventories i WHERE i.MaterialId = m.Id), 0) = @AvailableQty)
        AND (@ImagePath IS NULL OR m.ImagePath = @ImagePath)
        AND (@CostPerUnit IS NULL OR m.CostPerUnit = @CostPerUnit)
        AND (@CreatedAt IS NULL OR m.CreatedAt = @CreatedAt)
        AND (@UpdatedAt IS NULL OR m.UpdatedAt = @UpdatedAt)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertMaterial
    @Id UNIQUEIDENTIFIER = NULL,
    @MaterialCode NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @MaterialTypeId UNIQUEIDENTIFIER,
    @MaterialCategoryId UNIQUEIDENTIFIER,
    @AvailableQty DECIMAL(18,2),
    @ImagePath NVARCHAR(MAX),
    @CostPerUnit DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2
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
        ImagePath,
        CostPerUnit,
        CreatedAt,
        UpdatedAt
    )
    VALUES
    (
        @Id,
        @MaterialCode,
        @Name,
        @MaterialTypeId,
        @MaterialCategoryId,
        @AvailableQty,
        @ImagePath,
        @CostPerUnit,
        @CreatedAt,
        @UpdatedAt
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
    @ImagePath NVARCHAR(MAX),
    @CostPerUnit DECIMAL(18,2),
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2
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
        ImagePath = @ImagePath,
        CostPerUnit = @CostPerUnit,
        CreatedAt = @CreatedAt,
        UpdatedAt = @UpdatedAt
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