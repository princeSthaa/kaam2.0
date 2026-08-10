CREATE OR ALTER PROCEDURE sp_GetProductionStages
    @Id UNIQUEIDENTIFIER = NULL,
    @ProductionStageCode NVARCHAR(50) = NULL,
    @IsActive BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Id,
        ProductionStageCode,
        Name,
        Description,
        Duration,
        IsActive,
        CreatedAt,
        UpdatedAt
    FROM ProductionStages
    WHERE
        (@Id IS NULL OR Id = @Id)
        AND (@ProductionStageCode IS NULL OR ProductionStageCode = @ProductionStageCode)
        AND (@IsActive IS NULL OR IsActive = @IsActive)
    ORDER BY Name;
END
GO

CREATE OR ALTER PROCEDURE sp_InsertProductionStage
    @Id UNIQUEIDENTIFIER = NULL,
    @ProductionStageCode NVARCHAR(50),
    @Name NVARCHAR(100),
    @Description NVARCHAR(MAX),
    @Duration INT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;

    IF @Id IS NULL
        SET @Id = NEWID();

    INSERT INTO ProductionStages
    (
        Id,
        ProductionStageCode,
        Name,
        Description,
        Duration,
        IsActive,
        CreatedAt,
        UpdatedAt
    )
    VALUES
    (
        @Id,
        @ProductionStageCode,
        @Name,
        @Description,
        @Duration,
        @IsActive,
        GETUTCDATE(),
        GETUTCDATE()
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateProductionStage
    @Id UNIQUEIDENTIFIER,
    @Name NVARCHAR(100),
    @Description NVARCHAR(MAX),
    @Duration INT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE ProductionStages
    SET
        Name = @Name,
        Description = @Description,
        Duration = @Duration,
        IsActive = @IsActive,
        UpdatedAt = GETUTCDATE()
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteProductionStage
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM ProductionStages
    WHERE Id = @Id;
END
GO