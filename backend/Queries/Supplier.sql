CREATE OR ALTER PROCEDURE sp_GetSuppliers
    @Id UNIQUEIDENTIFIER = NULL,
    @SupplierCode NVARCHAR(50) = NULL,
    @Name NVARCHAR(150) = NULL,
    @Status NVARCHAR(50) = NULL,
    @IncludeDeleted BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        [Id],
        [SupplierCode],
        [Name],
        [ContactEmail],
        [ContactPhone],
        [Address],
        [Status],
        [OnTimeDeliveryRate],
        [DefectRate],
        [Rating],
        [TotalOrders],
        [LastEvaluatedAt],
        [CreatedAt],
        [UpdatedAt],
        [IsDeleted],
        [DeletedAt]
    FROM [Suppliers]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@SupplierCode IS NULL OR [SupplierCode] = @SupplierCode)
        AND (@Name IS NULL OR [Name] LIKE '%' + @Name + '%')
        AND (@Status IS NULL OR [Status] = @Status)
        AND (@IncludeDeleted = 1 OR [IsDeleted] = 0)
    ORDER BY [Name] ASC;
END
GO

CREATE OR ALTER PROCEDURE sp_InsertSupplier
    @Id UNIQUEIDENTIFIER,
    @SupplierCode NVARCHAR(50),
    @Name NVARCHAR(150),
    @ContactEmail NVARCHAR(150),
    @ContactPhone NVARCHAR(50),
    @Address NVARCHAR(250),
    @Status NVARCHAR(50),
    @OnTimeDeliveryRate DECIMAL(5,2),
    @DefectRate DECIMAL(5,2),
    @Rating DECIMAL(3,2),
    @TotalOrders INT,
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [Suppliers] (
        [Id], [SupplierCode], [Name], [ContactEmail], [ContactPhone], [Address], [Status],
        [OnTimeDeliveryRate], [DefectRate], [Rating], [TotalOrders],
        [CreatedAt], [UpdatedAt], [IsDeleted]
    )
    VALUES (
        @Id, @SupplierCode, @Name, @ContactEmail, @ContactPhone, @Address, @Status,
        @OnTimeDeliveryRate, @DefectRate, @Rating, @TotalOrders,
        @CreatedAt, @UpdatedAt, 0
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateSupplier
    @Id UNIQUEIDENTIFIER,
    @SupplierCode NVARCHAR(50),
    @Name NVARCHAR(150),
    @ContactEmail NVARCHAR(150),
    @ContactPhone NVARCHAR(50),
    @Address NVARCHAR(250),
    @Status NVARCHAR(50),
    @OnTimeDeliveryRate DECIMAL(5,2),
    @DefectRate DECIMAL(5,2),
    @Rating DECIMAL(3,2),
    @TotalOrders INT,
    @LastEvaluatedAt DATETIME2 = NULL,
    @UpdatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [Suppliers]
    SET
        [SupplierCode] = @SupplierCode,
        [Name] = @Name,
        [ContactEmail] = @ContactEmail,
        [ContactPhone] = @ContactPhone,
        [Address] = @Address,
        [Status] = @Status,
        [OnTimeDeliveryRate] = @OnTimeDeliveryRate,
        [DefectRate] = @DefectRate,
        [Rating] = @Rating,
        [TotalOrders] = @TotalOrders,
        [LastEvaluatedAt] = @LastEvaluatedAt,
        [UpdatedAt] = @UpdatedAt
    WHERE [Id] = @Id AND [IsDeleted] = 0;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteSupplier
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [Suppliers]
    SET [IsDeleted] = 1, [DeletedAt] = SYSUTCDATETIME()
    WHERE [Id] = @Id;
END
GO
