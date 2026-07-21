CREATE OR ALTER PROCEDURE sp_GetTransactions
    @Id NVARCHAR(MAX) = NULL,
    @Timestamp DATETIME2 = NULL,
    @TransactionType NVARCHAR(MAX) = NULL,
    @Amount DECIMAL(18,2) = NULL,
    @PaymentMethod NVARCHAR(MAX) = NULL,
    @ReferenceEntity NVARCHAR(MAX) = NULL,
    @HandledBy NVARCHAR(MAX) = NULL,
    @Notes NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [Transactions]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Timestamp IS NULL OR [Timestamp] = @Timestamp)
        AND (@TransactionType IS NULL OR [TransactionType] = @TransactionType)
        AND (@Amount IS NULL OR [Amount] = @Amount)
        AND (@PaymentMethod IS NULL OR [PaymentMethod] = @PaymentMethod)
        AND (@ReferenceEntity IS NULL OR [ReferenceEntity] = @ReferenceEntity)
        AND (@HandledBy IS NULL OR [HandledBy] = @HandledBy)
        AND (@Notes IS NULL OR [Notes] = @Notes)
        AND (@Status IS NULL OR [Status] = @Status)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertTransaction
    @Id NVARCHAR(MAX),
    @Timestamp DATETIME2,
    @TransactionType NVARCHAR(MAX),
    @Amount DECIMAL(18,2),
    @PaymentMethod NVARCHAR(MAX),
    @ReferenceEntity NVARCHAR(MAX),
    @HandledBy NVARCHAR(MAX),
    @Notes NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [Transactions] (
        [Id], [Timestamp], [TransactionType], [Amount], [PaymentMethod], [ReferenceEntity], [HandledBy], [Notes], [Status], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @Timestamp, @TransactionType, @Amount, @PaymentMethod, @ReferenceEntity, @HandledBy, @Notes, @Status, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateTransaction
    @Id NVARCHAR(MAX),
    @Timestamp DATETIME2,
    @TransactionType NVARCHAR(MAX),
    @Amount DECIMAL(18,2),
    @PaymentMethod NVARCHAR(MAX),
    @ReferenceEntity NVARCHAR(MAX),
    @HandledBy NVARCHAR(MAX),
    @Notes NVARCHAR(MAX),
    @Status NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [Transactions]
    SET
        [Timestamp] = @Timestamp,
        [TransactionType] = @TransactionType,
        [Amount] = @Amount,
        [PaymentMethod] = @PaymentMethod,
        [ReferenceEntity] = @ReferenceEntity,
        [HandledBy] = @HandledBy,
        [Notes] = @Notes,
        [Status] = @Status,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteTransaction
    @Id NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [Transactions] WHERE [Id] = @Id;
END
GO
