CREATE OR ALTER PROCEDURE sp_GetProductionPlans
    @Id NVARCHAR(MAX) = NULL,
    @PlanId NVARCHAR(MAX) = NULL,
    @BatchId NVARCHAR(MAX) = NULL,
    @PlanName NVARCHAR(MAX) = NULL,
    @DemandType NVARCHAR(MAX) = NULL,
    @SourceId NVARCHAR(MAX) = NULL,
    @SourceName NVARCHAR(MAX) = NULL,
    @Priority INT = NULL,
    @Status INT = NULL,
    @PlannedStartDate DATETIME2 = NULL,
    @PlannedCompletionDate DATETIME2 = NULL,
    @Quantity INT = NULL,
    @EstimatedCost DECIMAL(18,2) = NULL,
    @Supervisor NVARCHAR(MAX) = NULL,
    @ProductionLine NVARCHAR(MAX) = NULL,
    @MaterialWarehouse NVARCHAR(MAX) = NULL,
    @ProductionNotes NVARCHAR(MAX) = NULL,
    @PlanDate DATETIME2 = NULL,
    @OutputDestination NVARCHAR(MAX) = NULL,
    @RequiredDate DATETIME2 = NULL,
    @Progress DECIMAL(18,2) = NULL,
    @Blocked BIT = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [ProductionPlans]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@PlanId IS NULL OR [PlanId] = @PlanId)
        AND (@BatchId IS NULL OR [BatchId] = @BatchId)
        AND (@PlanName IS NULL OR [PlanName] = @PlanName)
        AND (@DemandType IS NULL OR [DemandType] = @DemandType)
        AND (@SourceId IS NULL OR [SourceId] = @SourceId)
        AND (@SourceName IS NULL OR [SourceName] = @SourceName)
        AND (@Priority IS NULL OR [Priority] = @Priority)
        AND (@Status IS NULL OR [Status] = @Status)
        AND (@PlannedStartDate IS NULL OR [PlannedStartDate] = @PlannedStartDate)
        AND (@PlannedCompletionDate IS NULL OR [PlannedCompletionDate] = @PlannedCompletionDate)
        AND (@Quantity IS NULL OR [Quantity] = @Quantity)
        AND (@EstimatedCost IS NULL OR [EstimatedCost] = @EstimatedCost)
        AND (@Supervisor IS NULL OR [Supervisor] = @Supervisor)
        AND (@ProductionLine IS NULL OR [ProductionLine] = @ProductionLine)
        AND (@MaterialWarehouse IS NULL OR [MaterialWarehouse] = @MaterialWarehouse)
        AND (@ProductionNotes IS NULL OR [ProductionNotes] = @ProductionNotes)
        AND (@PlanDate IS NULL OR [PlanDate] = @PlanDate)
        AND (@OutputDestination IS NULL OR [OutputDestination] = @OutputDestination)
        AND (@RequiredDate IS NULL OR [RequiredDate] = @RequiredDate)
        AND (@Progress IS NULL OR [Progress] = @Progress)
        AND (@Blocked IS NULL OR [Blocked] = @Blocked)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertProductionPlan
    @Id NVARCHAR(MAX),
    @PlanId NVARCHAR(MAX),
    @BatchId NVARCHAR(MAX),
    @PlanName NVARCHAR(MAX),
    @DemandType NVARCHAR(MAX),
    @SourceId NVARCHAR(MAX),
    @SourceName NVARCHAR(MAX),
    @Priority INT,
    @Status INT,
    @PlannedStartDate DATETIME2,
    @PlannedCompletionDate DATETIME2,
    @Quantity INT,
    @EstimatedCost DECIMAL(18,2),
    @Supervisor NVARCHAR(MAX),
    @ProductionLine NVARCHAR(MAX),
    @MaterialWarehouse NVARCHAR(MAX),
    @ProductionNotes NVARCHAR(MAX),
    @PlanDate DATETIME2,
    @OutputDestination NVARCHAR(MAX),
    @RequiredDate DATETIME2,
    @Progress DECIMAL(18,2),
    @Blocked BIT,
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [ProductionPlans] (
        [Id], [PlanId], [BatchId], [PlanName], [DemandType], [SourceId], [SourceName], [Priority], [Status], [PlannedStartDate], [PlannedCompletionDate], [Quantity], [EstimatedCost], [Supervisor], [ProductionLine], [MaterialWarehouse], [ProductionNotes], [PlanDate], [OutputDestination], [RequiredDate], [Progress], [Blocked], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @PlanId, @BatchId, @PlanName, @DemandType, @SourceId, @SourceName, @Priority, @Status, @PlannedStartDate, @PlannedCompletionDate, @Quantity, @EstimatedCost, @Supervisor, @ProductionLine, @MaterialWarehouse, @ProductionNotes, @PlanDate, @OutputDestination, @RequiredDate, @Progress, @Blocked, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateProductionPlan
    @Id NVARCHAR(MAX),
    @PlanId NVARCHAR(MAX),
    @BatchId NVARCHAR(MAX),
    @PlanName NVARCHAR(MAX),
    @DemandType NVARCHAR(MAX),
    @SourceId NVARCHAR(MAX),
    @SourceName NVARCHAR(MAX),
    @Priority INT,
    @Status INT,
    @PlannedStartDate DATETIME2,
    @PlannedCompletionDate DATETIME2,
    @Quantity INT,
    @EstimatedCost DECIMAL(18,2),
    @Supervisor NVARCHAR(MAX),
    @ProductionLine NVARCHAR(MAX),
    @MaterialWarehouse NVARCHAR(MAX),
    @ProductionNotes NVARCHAR(MAX),
    @PlanDate DATETIME2,
    @OutputDestination NVARCHAR(MAX),
    @RequiredDate DATETIME2,
    @Progress DECIMAL(18,2),
    @Blocked BIT,
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [ProductionPlans]
    SET
        [PlanId] = @PlanId,
        [BatchId] = @BatchId,
        [PlanName] = @PlanName,
        [DemandType] = @DemandType,
        [SourceId] = @SourceId,
        [SourceName] = @SourceName,
        [Priority] = @Priority,
        [Status] = @Status,
        [PlannedStartDate] = @PlannedStartDate,
        [PlannedCompletionDate] = @PlannedCompletionDate,
        [Quantity] = @Quantity,
        [EstimatedCost] = @EstimatedCost,
        [Supervisor] = @Supervisor,
        [ProductionLine] = @ProductionLine,
        [MaterialWarehouse] = @MaterialWarehouse,
        [ProductionNotes] = @ProductionNotes,
        [PlanDate] = @PlanDate,
        [OutputDestination] = @OutputDestination,
        [RequiredDate] = @RequiredDate,
        [Progress] = @Progress,
        [Blocked] = @Blocked,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteProductionPlan
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [ProductionPlans] WHERE [Id] = @Id;
END
GO
