CREATE OR ALTER PROCEDURE sp_GetOrders
    @Id NVARCHAR(MAX) = NULL,
    @OrderNumber NVARCHAR(MAX) = NULL,
    @Status INT = NULL,
    @TotalAmount DECIMAL(18,2) = NULL,
    @DueDate DATETIME2 = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL,
    @CustomerId NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [Orders]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@OrderNumber IS NULL OR [OrderNumber] = @OrderNumber)
        AND (@Status IS NULL OR [Status] = @Status)
        AND (@TotalAmount IS NULL OR [TotalAmount] = @TotalAmount)
        AND (@DueDate IS NULL OR [DueDate] = @DueDate)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
        AND (@CustomerId IS NULL OR [CustomerId] = @CustomerId)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertOrder
    @Id NVARCHAR(MAX),
    @OrderNumber NVARCHAR(MAX),
    @Status INT,
    @TotalAmount DECIMAL(18,2),
    @DueDate DATETIME2,
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @CustomerId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [Orders] (
        [Id], [OrderNumber], [Status], [TotalAmount], [DueDate], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy], [CustomerId]
    )
    VALUES (
        @Id, @OrderNumber, @Status, @TotalAmount, @DueDate, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy, @CustomerId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateOrder
    @Id NVARCHAR(MAX),
    @OrderNumber NVARCHAR(MAX),
    @Status INT,
    @TotalAmount DECIMAL(18,2),
    @DueDate DATETIME2,
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX),
    @CustomerId NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [Orders]
    SET
        [OrderNumber] = @OrderNumber,
        [Status] = @Status,
        [TotalAmount] = @TotalAmount,
        [DueDate] = @DueDate,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy,
        [CustomerId] = @CustomerId
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteOrder
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [Orders] WHERE [Id] = @Id;
END
GO

