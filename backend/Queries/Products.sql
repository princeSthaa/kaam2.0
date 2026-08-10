CREATE OR ALTER PROCEDURE sp_GetProducts
    @Id UNIQUEIDENTIFIER = NULL,
    @SKU NVARCHAR(50) = NULL,
    @Name NVARCHAR(100) = NULL,
    @ProductCategoryId UNIQUEIDENTIFIER = NULL,
    @IsActive BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -------------------------------------------------------------------------
    -- Result Set 1 : Products
    -------------------------------------------------------------------------
    SELECT
        p.Id,
        p.SKU,
        p.Name,
        p.ImagePath,
        p.isActive,
        p.CreatedAt,
        p.UpdatedAt,

        p.ProductCategoryId,
        pc.Name AS ProductCategoryName

    FROM Products p
    LEFT JOIN ProductCategories pc
        ON pc.Id = p.ProductCategoryId

    WHERE
        (@Id IS NULL OR p.Id = @Id)
        AND (@SKU IS NULL OR p.SKU = @SKU)
        AND (@Name IS NULL OR p.Name LIKE '%' + @Name + '%')
        AND (@ProductCategoryId IS NULL OR p.ProductCategoryId = @ProductCategoryId)
        AND (@IsActive IS NULL OR p.isActive = @IsActive);

    -------------------------------------------------------------------------
    -- Result Set 2 : Material Requirements
    -------------------------------------------------------------------------
    SELECT
        pmr.Id,
        pmr.ProductId,
        pmr.MaterialTypeId,
        pmr.ProductSize,
        pmr.Quantity,
        -- MaterialTypeDto
        mt.Id,
        mt.Name,
        mt.CreatedAt,
        mt.UpdatedAt

    FROM ProductMaterialRequirements pmr

    INNER JOIN MaterialTypes mt
        ON mt.Id = pmr.MaterialTypeId

    WHERE
        @Id IS NULL
        OR pmr.ProductId = @Id;

    -------------------------------------------------------------------------
    -- Result Set 3 : Production Stages
    -------------------------------------------------------------------------
    SELECT
        pps.Id,
        pps.ProductId,
        pps.ProductionStageId,
        pps.Sequence,
        -- ProductionStageDto
        ps.Id,
        ps.Name,
        ps.Description,
        ps.isActive

    FROM ProductProductionStage pps

    INNER JOIN ProductionStages ps
        ON ps.Id = pps.ProductionStageId

    WHERE
        @Id IS NULL
        OR pps.ProductId = @Id

    ORDER BY
        pps.ProductId,
        pps.Sequence;
END
GO

CREATE OR ALTER PROCEDURE sp_InsertProduct
    @Id UNIQUEIDENTIFIER,
    @SKU NVARCHAR(50),
    @Name NVARCHAR(100),
    @ProductCategoryId UNIQUEIDENTIFIER,
    @ImagePath NVARCHAR(MAX),
    @IsActive BIT,
    @CreatedAt DATETIME2,   
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Products
    (
        Id,
        SKU,
        Name,
        ProductCategoryId,
        ImagePath,
        isActive,
        CreatedAt,
        UpdatedAt
    )
    VALUES
    (
        @Id,
        @SKU,
        @Name,
        @ProductCategoryId,
        @ImagePath,
        @IsActive,
        @CreatedAt,
        @UpdatedAt
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateProduct
    @Id UNIQUEIDENTIFIER,
    @SKU NVARCHAR(50),
    @Name NVARCHAR(100),
    @ProductCategoryId UNIQUEIDENTIFIER,
    @ImagePath NVARCHAR(MAX),
    @IsActive BIT,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Products
    SET
        SKU = @SKU,
        Name = @Name,
        ProductCategoryId = @ProductCategoryId,
        ImagePath = @ImagePath,
        isActive = @IsActive,
        UpdatedAt = @UpdatedAt
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteProduct
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM Products
    WHERE Id = @Id;
END
GO
