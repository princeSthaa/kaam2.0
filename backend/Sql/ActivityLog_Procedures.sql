CREATE OR ALTER PROCEDURE sp_GetActivityLogs
    @Id NVARCHAR(MAX) = NULL,
    @Title NVARCHAR(MAX) = NULL,
    @Text NVARCHAR(MAX) = NULL,
    @Timestamp DATETIME2 = NULL,
    @EntityId NVARCHAR(MAX) = NULL,
    @EntityType NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [ActivityLogs]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Title IS NULL OR [Title] = @Title)
        AND (@Text IS NULL OR [Text] = @Text)
        AND (@Timestamp IS NULL OR [Timestamp] = @Timestamp)
        AND (@EntityId IS NULL OR [EntityId] = @EntityId)
        AND (@EntityType IS NULL OR [EntityType] = @EntityType)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertActivityLog
    @Id NVARCHAR(MAX),
    @Title NVARCHAR(MAX),
    @Text NVARCHAR(MAX),
    @Timestamp DATETIME2,
    @EntityId NVARCHAR(MAX),
    @EntityType NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [ActivityLogs] (
        [Id], [Title], [Text], [Timestamp], [EntityId], [EntityType], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @Title, @Text, @Timestamp, @EntityId, @EntityType, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateActivityLog
    @Id NVARCHAR(MAX),
    @Title NVARCHAR(MAX),
    @Text NVARCHAR(MAX),
    @Timestamp DATETIME2,
    @EntityId NVARCHAR(MAX),
    @EntityType NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [ActivityLogs]
    SET
        [Title] = @Title,
        [Text] = @Text,
        [Timestamp] = @Timestamp,
        [EntityId] = @EntityId,
        [EntityType] = @EntityType,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteActivityLog
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [ActivityLogs] WHERE [Id] = @Id;
END
GO
