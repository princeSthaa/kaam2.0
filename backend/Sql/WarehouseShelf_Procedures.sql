CREATE OR ALTER PROCEDURE sp_GetWarehouseShelfs
    @Id NVARCHAR(MAX) = NULL,
    @Code NVARCHAR(MAX) = NULL,
    @Capacity NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL,
    @WarehouseRoomId NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [WarehouseShelfs]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Code IS NULL OR [Code] = @Code)
        AND (@Capacity IS NULL OR [Capacity] = @Capacity)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
        AND (@WarehouseRoomId IS NULL OR [WarehouseRoomId] = @WarehouseRoomId)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertWarehouseShelf
    @Id NVARCHAR(MAX),
    @Code NVARCHAR(MAX),
    @Capacity NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @WarehouseRoomId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [WarehouseShelfs] (
        [Id], [Code], [Capacity], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy], [WarehouseRoomId]
    )
    VALUES (
        @Id, @Code, @Capacity, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy, @WarehouseRoomId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateWarehouseShelf
    @Id NVARCHAR(MAX),
    @Code NVARCHAR(MAX),
    @Capacity NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @WarehouseRoomId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [WarehouseShelfs]
    SET
        [Code] = @Code,
        [Capacity] = @Capacity,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy,
        [WarehouseRoomId] = @WarehouseRoomId
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteWarehouseShelf
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [WarehouseShelfs] WHERE [Id] = @Id;
END
GO

