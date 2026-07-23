CREATE OR ALTER PROCEDURE sp_GetCustomers
    @Id UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(MAX) = NULL,
    @Email NVARCHAR(MAX) = NULL,
    @Phone NVARCHAR(MAX) = NULL,
    @Address NVARCHAR(MAX) = NULL,
    @Type NVARCHAR(MAX) = NULL,
    @Company NVARCHAR(MAX) = NULL,
    @PanVat NVARCHAR(MAX) = NULL,
    @CreatedAt DATETIME2 = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,
    @UpdatedAt DATETIME2 = NULL,
    @UpdatedBy NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM [Customers]
    WHERE
        (@Id IS NULL OR [Id] = @Id)
        AND (@Name IS NULL OR [Name] = @Name)
        AND (@Email IS NULL OR [Email] = @Email)
        AND (@Phone IS NULL OR [Phone] = @Phone)
        AND (@Address IS NULL OR [Address] = @Address)
        AND (@Type IS NULL OR [Type] = @Type)
        AND (@Company IS NULL OR [Company] = @Company)
        AND (@PanVat IS NULL OR [PanVat] = @PanVat)
        AND (@CreatedAt IS NULL OR [CreatedAt] = @CreatedAt)
        AND (@CreatedBy IS NULL OR [CreatedBy] = @CreatedBy)
        AND (@UpdatedAt IS NULL OR [UpdatedAt] = @UpdatedAt)
        AND (@UpdatedBy IS NULL OR [UpdatedBy] = @UpdatedBy)
END
GO

CREATE OR ALTER PROCEDURE sp_InsertCustomer
    @Id UNIQUEIDENTIFIER,
    @Name NVARCHAR(MAX),
    @Email NVARCHAR(MAX),
    @Phone NVARCHAR(MAX),
    @Address NVARCHAR(MAX),
    @Type NVARCHAR(MAX),
    @Company NVARCHAR(MAX),
    @PanVat NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [Customers] (
        [Id], [Name], [Email], [Phone], [Address], [Type], [Company], [PanVat], [CreatedAt], [CreatedBy], [UpdatedAt], [UpdatedBy]
    )
    VALUES (
        @Id, @Name, @Email, @Phone, @Address, @Type, @Company, @PanVat, @CreatedAt, @CreatedBy, @UpdatedAt, @UpdatedBy
    );
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateCustomer
    @Id UNIQUEIDENTIFIER,
    @Name NVARCHAR(MAX),
    @Email NVARCHAR(MAX),
    @Phone NVARCHAR(MAX),
    @Address NVARCHAR(MAX),
    @Type NVARCHAR(MAX),
    @Company NVARCHAR(MAX),
    @PanVat NVARCHAR(MAX),
    @CreatedAt DATETIME2,
    @CreatedBy NVARCHAR(MAX),
    @UpdatedAt DATETIME2,
    @UpdatedBy NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [Customers]
    SET
        [Name] = @Name,
        [Email] = @Email,
        [Phone] = @Phone,
        [Address] = @Address,
        [Type] = @Type,
        [Company] = @Company,
        [PanVat] = @PanVat,
        [CreatedAt] = @CreatedAt,
        [CreatedBy] = @CreatedBy,
        [UpdatedAt] = @UpdatedAt,
        [UpdatedBy] = @UpdatedBy
    WHERE [Id] = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_DeleteCustomer
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [Customers] WHERE [Id] = @Id;
END
GO
