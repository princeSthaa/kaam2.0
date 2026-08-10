CREATE OR ALTER PROCEDURE sp_GetProductMaterialRequirements
    @Id UNIQUEIDENTIFIER = NULL,
    @ProductId UNIQUEIDENTIFIER = NULL,
    @MaterialTypeId UNIQUEIDENTIFIER = NULL,
    @ProductSize INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pmr.Id,
        pmr.ProductId,
        pmr.MaterialTypeId,
        mt.Name AS MaterialTypeName,
        pmr.ProductSize,
        pmr.Quantity
    FROM ProductMaterialRequirements pmr
    INNER JOIN MaterialTypes mt
        ON mt.Id = pmr.MaterialTypeId
    WHERE
        (@Id IS NULL OR pmr.Id = @Id)
        AND (@ProductId IS NULL OR pmr.ProductId = @ProductId)
        AND (@MaterialTypeId IS NULL OR pmr.MaterialTypeId = @MaterialTypeId)
        AND (@ProductSize IS NULL OR pmr.ProductSize = @ProductSize);
END
GO

CREATE OR ALTER PROCEDURE sp_InsertProductMaterialRequirement
    @Id UNIQUEIDENTIFIER = NULL,
    @ProductId UNIQUEIDENTIFIER,
    @MaterialTypeId UNIQUEIDENTIFIER,
    @ProductSize INT,
    @Quantity DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;

    IF @Id IS NULL
        SET @Id = NEWID();

    INSERT INTO ProductMaterialRequirements
    (
        Id,
        ProductId,
        MaterialTypeId,
        ProductSize,
        Quantity
    )
    VALUES
    (
        @Id,
        @ProductId,
        @MaterialTypeId,
        @ProductSize,
        @Quantity
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateProductMaterialRequirement
    @Id UNIQUEIDENTIFIER,
    @ProductId UNIQUEIDENTIFIER,
    @MaterialTypeId UNIQUEIDENTIFIER,
    @ProductSize INT,
    @Quantity DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE ProductMaterialRequirements
    SET
        ProductId = @ProductId,
        MaterialTypeId = @MaterialTypeId,
        ProductSize = @ProductSize,
        Quantity = @Quantity
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteProductMaterialRequirement
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM ProductMaterialRequirements
    WHERE Id = @Id;
END
GO