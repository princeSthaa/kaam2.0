IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductCategories')
BEGIN
    CREATE TABLE dbo.ProductCategories (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        CategoryCode NVARCHAR(100) NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        isActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
    CREATE UNIQUE INDEX IX_ProductCategories_CategoryCode ON dbo.ProductCategories(CategoryCode);
END
GO
