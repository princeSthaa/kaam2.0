CREATE OR ALTER PROCEDURE sp_GetMaterialIssues
    @Id UNIQUEIDENTIFIER = NULL,
    @MaterialId NVARCHAR(MAX) = NULL,
    @IssueQuantity DECIMAL(18,2) = NULL,
    @TargetDestination NVARCHAR(MAX) = NULL,
    @IssuedTo NVARCHAR(MAX) = NULL,
    @Notes NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [MaterialIssues]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@MaterialId IS NULL OR [MaterialId] = @MaterialId)
        AND (@IssueQuantity IS NULL OR [IssueQuantity] = @IssueQuantity)
        AND (@TargetDestination IS NULL OR [TargetDestination] = @TargetDestination)
        AND (@IssuedTo IS NULL OR [IssuedTo] = @IssuedTo)
        AND (@Notes IS NULL OR [Notes] = @Notes)
        AND (@Status IS NULL OR [Status] = @Status)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertMaterialIssue
    @Id UNIQUEIDENTIFIER,
    @MaterialId NVARCHAR(MAX),
    @IssueQuantity DECIMAL(18,2),
    @TargetDestination NVARCHAR(MAX),
    @IssuedTo NVARCHAR(MAX),
    @Notes NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [MaterialIssues] (
        [Id], [MaterialId], [IssueQuantity], [TargetDestination], [IssuedTo], [Notes], [Status], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @MaterialId, @IssueQuantity, @TargetDestination, @IssuedTo, @Notes, @Status, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateMaterialIssue
    @Id UNIQUEIDENTIFIER,
    @MaterialId NVARCHAR(MAX),
    @IssueQuantity DECIMAL(18,2),
    @TargetDestination NVARCHAR(MAX),
    @IssuedTo NVARCHAR(MAX),
    @Notes NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [MaterialIssues]
    SET
        [MaterialId] = @MaterialId,
        [IssueQuantity] = @IssueQuantity,
        [TargetDestination] = @TargetDestination,
        [IssuedTo] = @IssuedTo,
        [Notes] = @Notes,
        [Status] = @Status,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteMaterialIssue
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [MaterialIssues] WHERE [Id] = @Id;
END
GO
