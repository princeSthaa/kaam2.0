CREATE OR ALTER PROCEDURE sp_GetWarehouseRooms
    @Id NVARCHAR(MAX) = NULL,
    @Name NVARCHAR(MAX) = NULL,
    @Floor NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL,
    @WarehouseId NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [WarehouseRooms]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Name IS NULL OR [Name] = @Name)
        AND (@Floor IS NULL OR [Floor] = @Floor)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
        AND (@WarehouseId IS NULL OR [WarehouseId] = @WarehouseId)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertWarehouseRoom
    @Id NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @Floor NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @WarehouseId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [WarehouseRooms] (
        [Id], [Name], [Floor], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy], [WarehouseId]
    )
    VALUES (
        @Id, @Name, @Floor, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy, @WarehouseId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateWarehouseRoom
    @Id NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @Floor NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @WarehouseId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [WarehouseRooms]
    SET
        [Name] = @Name,
        [Floor] = @Floor,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy,
        [WarehouseId] = @WarehouseId
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteWarehouseRoom
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [WarehouseRooms] WHERE [Id] = @Id;
END
GO

