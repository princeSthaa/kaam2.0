CREATE OR ALTER PROCEDURE sp_GetCustomerReturns
    @Id UNIQUEIDENTIFIER = NULL,
    @OrderNumber NVARCHAR(MAX) = NULL,
    @CustomerName NVARCHAR(MAX) = NULL,
    @ProductId NVARCHAR(MAX) = NULL,
    @ReturnedQuantity INT = NULL,
    @Reason NVARCHAR(MAX) = NULL,
    @Notes NVARCHAR(MAX) = NULL,
    @ProcessedBy NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [CustomerReturns]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@OrderNumber IS NULL OR [OrderNumber] = @OrderNumber)
        AND (@CustomerName IS NULL OR [CustomerName] = @CustomerName)
        AND (@ProductId IS NULL OR [ProductId] = @ProductId)
        AND (@ReturnedQuantity IS NULL OR [ReturnedQuantity] = @ReturnedQuantity)
        AND (@Reason IS NULL OR [Reason] = @Reason)
        AND (@Notes IS NULL OR [Notes] = @Notes)
        AND (@ProcessedBy IS NULL OR [ProcessedBy] = @ProcessedBy)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertCustomerReturn
    @Id UNIQUEIDENTIFIER,
    @OrderNumber NVARCHAR(MAX),
    @CustomerName NVARCHAR(MAX),
    @ProductId NVARCHAR(MAX),
    @ReturnedQuantity INT,
    @Reason NVARCHAR(MAX),
    @Notes NVARCHAR(MAX),
    @ProcessedBy NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [CustomerReturns] (
        [Id], [OrderNumber], [CustomerName], [ProductId], [ReturnedQuantity], [Reason], [Notes], [ProcessedBy], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @OrderNumber, @CustomerName, @ProductId, @ReturnedQuantity, @Reason, @Notes, @ProcessedBy, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateCustomerReturn
    @Id UNIQUEIDENTIFIER,
    @OrderNumber NVARCHAR(MAX),
    @CustomerName NVARCHAR(MAX),
    @ProductId NVARCHAR(MAX),
    @ReturnedQuantity INT,
    @Reason NVARCHAR(MAX),
    @Notes NVARCHAR(MAX),
    @ProcessedBy NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [CustomerReturns]
    SET
        [OrderNumber] = @OrderNumber,
        [CustomerName] = @CustomerName,
        [ProductId] = @ProductId,
        [ReturnedQuantity] = @ReturnedQuantity,
        [Reason] = @Reason,
        [Notes] = @Notes,
        [ProcessedBy] = @ProcessedBy,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteCustomerReturn
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [CustomerReturns] WHERE [Id] = @Id;
END
GO
