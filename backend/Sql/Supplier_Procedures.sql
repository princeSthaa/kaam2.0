CREATE OR ALTER PROCEDURE sp_GetSuppliers
    @Id INT = NULL,
    @Name NVARCHAR(150) = NULL,
    @Status NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        [Id],
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
        [UpdatedAt]
    FROM [Suppliers]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Name IS NULL OR [Name] LIKE '%' + @Name + '%')
        AND (@Status IS NULL OR [Status] = @Status)
    ORDER BY [Name] ASC;
END
GO

CREATE OR ALTER PROCEDURE sp_InsertSupplier
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
    @UpdatedAt DATETIME2,
    @InsertedId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [Suppliers] (
        [Name], [ContactEmail], [ContactPhone], [Address], [Status],
        [OnTimeDeliveryRate], [DefectRate], [Rating], [TotalOrders],
        [CreatedAt], [UpdatedAt]
    )
    VALUES (
        @Name, @ContactEmail, @ContactPhone, @Address, @Status,
        @OnTimeDeliveryRate, @DefectRate, @Rating, @TotalOrders,
        @CreatedAt, @UpdatedAt
    );

    SET @InsertedId = SCOPE_IDENTITY();
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateSupplier
    @Id INT,
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
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteSupplier
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [Suppliers] WHERE [Id] = @Id;
END
GO
