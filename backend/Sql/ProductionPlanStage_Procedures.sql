CREATE OR ALTER PROCEDURE sp_GetProductionPlanStages
    @Id NVARCHAR(MAX) = NULL,
    @StageId NVARCHAR(MAX) = NULL,
    @StageName NVARCHAR(MAX) = NULL,
    @OperatorName NVARCHAR(MAX) = NULL,
    @PlannedStartDate DATETIME2 = NULL,
    @PlannedEndDate DATETIME2 = NULL,
    @Status INT = NULL,
    @CompletedQty INT = NULL,
    @RejectedQty INT = NULL,
    @ActualStartDate DATETIME2 = NULL,
    @ActualEndDate DATETIME2 = NULL,
    @Remarks NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL,
    @ProductionPlanId NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [ProductionPlanStages]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@StageId IS NULL OR [StageId] = @StageId)
        AND (@StageName IS NULL OR [StageName] = @StageName)
        AND (@OperatorName IS NULL OR [OperatorName] = @OperatorName)
        AND (@PlannedStartDate IS NULL OR [PlannedStartDate] = @PlannedStartDate)
        AND (@PlannedEndDate IS NULL OR [PlannedEndDate] = @PlannedEndDate)
        AND (@Status IS NULL OR [Status] = @Status)
        AND (@CompletedQty IS NULL OR [CompletedQty] = @CompletedQty)
        AND (@RejectedQty IS NULL OR [RejectedQty] = @RejectedQty)
        AND (@ActualStartDate IS NULL OR [ActualStartDate] = @ActualStartDate)
        AND (@ActualEndDate IS NULL OR [ActualEndDate] = @ActualEndDate)
        AND (@Remarks IS NULL OR [Remarks] = @Remarks)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
        AND (@ProductionPlanId IS NULL OR [ProductionPlanId] = @ProductionPlanId)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertProductionPlanStage
    @Id NVARCHAR(MAX),
    @StageId NVARCHAR(MAX),
    @StageName NVARCHAR(MAX),
    @OperatorName NVARCHAR(MAX),
    @PlannedStartDate DATETIME2,
    @PlannedEndDate DATETIME2,
    @Status INT,
    @CompletedQty INT,
    @RejectedQty INT,
    @ActualStartDate DATETIME2,
    @ActualEndDate DATETIME2,
    @Remarks NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @WorkCenterId NVARCHAR(MAX),
    @ProductionPlanId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [ProductionPlanStages] (
        [Id], [StageId], [StageName], [OperatorName], [PlannedStartDate], [PlannedEndDate], [Status], [CompletedQty], [RejectedQty], [ActualStartDate], [ActualEndDate], [Remarks], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy], [WorkCenterId], [ProductionPlanId]
    )
    VALUES (
        @Id, @StageId, @StageName, @OperatorName, @PlannedStartDate, @PlannedEndDate, @Status, @CompletedQty, @RejectedQty, @ActualStartDate, @ActualEndDate, @Remarks, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy, @WorkCenterId, @ProductionPlanId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateProductionPlanStage
    @Id NVARCHAR(MAX),
    @StageId NVARCHAR(MAX),
    @StageName NVARCHAR(MAX),
    @OperatorName NVARCHAR(MAX),
    @PlannedStartDate DATETIME2,
    @PlannedEndDate DATETIME2,
    @Status INT,
    @CompletedQty INT,
    @RejectedQty INT,
    @ActualStartDate DATETIME2,
    @ActualEndDate DATETIME2,
    @Remarks NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @WorkCenterId NVARCHAR(MAX),
    @ProductionPlanId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [ProductionPlanStages]
    SET
        [StageId] = @StageId,
        [StageName] = @StageName,
        [OperatorName] = @OperatorName,
        [PlannedStartDate] = @PlannedStartDate,
        [PlannedEndDate] = @PlannedEndDate,
        [Status] = @Status,
        [CompletedQty] = @CompletedQty,
        [RejectedQty] = @RejectedQty,
        [ActualStartDate] = @ActualStartDate,
        [ActualEndDate] = @ActualEndDate,
        [Remarks] = @Remarks,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy,
        [WorkCenterId] = @WorkCenterId,
        [ProductionPlanId] = @ProductionPlanId
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteProductionPlanStage
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [ProductionPlanStages] WHERE [Id] = @Id;
END
GO

