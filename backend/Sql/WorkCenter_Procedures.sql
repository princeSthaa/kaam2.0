CREATE OR ALTER PROCEDURE sp_GetWorkCenters
    @Id NVARCHAR(MAX) = NULL,
    @Name NVARCHAR(MAX) = NULL,
    @Type NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(MAX) = NULL,
    @ProductionLine NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [WorkCenters]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Name IS NULL OR [Name] = @Name)
        AND (@Type IS NULL OR [Type] = @Type)
        AND (@Status IS NULL OR [Status] = @Status)
        AND (@ProductionLine IS NULL OR [ProductionLine] = @ProductionLine)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertWorkCenter
    @Id NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @Type NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @ProductionLine NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [WorkCenters] (
        [Id], [Name], [Type], [Status], [ProductionLine], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @Name, @Type, @Status, @ProductionLine, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateWorkCenter
    @Id NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @Type NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @ProductionLine NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [WorkCenters]
    SET
        [Name] = @Name,
        [Type] = @Type,
        [Status] = @Status,
        [ProductionLine] = @ProductionLine,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteWorkCenter
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [WorkCenters] WHERE [Id] = @Id;
END
GO
