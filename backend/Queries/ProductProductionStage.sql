CREATE OR ALTER PROCEDURE sp_GetProductProductionStages
    @Id UNIQUEIDENTIFIER = NULL,
    @ProductId UNIQUEIDENTIFIER = NULL,
    @ProductionStageId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pps.Id,
        pps.ProductId,
        pps.ProductionStageId,
        ps.Name AS ProductionStageName,
        pps.Sequence
    FROM ProductProductionStage pps
    INNER JOIN ProductionStages ps
        ON ps.Id = pps.ProductionStageId
    WHERE
        (@Id IS NULL OR pps.Id = @Id)
        AND (@ProductId IS NULL OR pps.ProductId = @ProductId)
        AND (@ProductionStageId IS NULL OR pps.ProductionStageId = @ProductionStageId)
    ORDER BY pps.Sequence;
END
GO

CREATE OR ALTER PROCEDURE sp_InsertProductProductionStage
    @Id UNIQUEIDENTIFIER = NULL,
    @ProductId UNIQUEIDENTIFIER,
    @ProductionStageId UNIQUEIDENTIFIER,
    @Sequence INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @Id IS NULL
        SET @Id = NEWID();

    INSERT INTO ProductProductionStage
    (
        Id,
        ProductId,
        ProductionStageId,
        Sequence
    )
    VALUES
    (
        @Id,
        @ProductId,
        @ProductionStageId,
        @Sequence
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateProductProductionStage
    @Id UNIQUEIDENTIFIER,
    @ProductId UNIQUEIDENTIFIER,
    @ProductionStageId UNIQUEIDENTIFIER,
    @Sequence INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE ProductProductionStage
    SET
        ProductId = @ProductId,
        ProductionStageId = @ProductionStageId,
        Sequence = @Sequence
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteProductProductionStage
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM ProductProductionStage
    WHERE Id = @Id;
END
GO