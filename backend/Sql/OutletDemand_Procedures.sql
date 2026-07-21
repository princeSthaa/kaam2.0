CREATE OR ALTER PROCEDURE sp_GetOutletDemands
    @Id NVARCHAR(MAX) = NULL,
    @DemandNumber NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(MAX) = NULL,
    @DueDate DATETIME2 = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL,
    @OutletId NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [OutletDemands]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@DemandNumber IS NULL OR [DemandNumber] = @DemandNumber)
        AND (@Status IS NULL OR [Status] = @Status)
        AND (@DueDate IS NULL OR [DueDate] = @DueDate)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
        AND (@OutletId IS NULL OR [OutletId] = @OutletId)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertOutletDemand
    @Id NVARCHAR(MAX),
    @DemandNumber NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @DueDate DATETIME2,
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @OutletId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [OutletDemands] (
        [Id], [DemandNumber], [Status], [DueDate], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy], [OutletId]
    )
    VALUES (
        @Id, @DemandNumber, @Status, @DueDate, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy, @OutletId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateOutletDemand
    @Id NVARCHAR(MAX),
    @DemandNumber NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @DueDate DATETIME2,
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @OutletId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [OutletDemands]
    SET
        [DemandNumber] = @DemandNumber,
        [Status] = @Status,
        [DueDate] = @DueDate,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy,
        [OutletId] = @OutletId
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteOutletDemand
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [OutletDemands] WHERE [Id] = @Id;
END
GO

