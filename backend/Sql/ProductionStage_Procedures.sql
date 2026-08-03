IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductionStages')
BEGIN
    CREATE TABLE dbo.ProductionStages (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        Name NVARCHAR(100) NOT NULL,
        isActive BIT NOT NULL DEFAULT 1
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductProductionStage')
BEGIN
    CREATE TABLE dbo.ProductProductionStage (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        ProductId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES dbo.Products(Id) ON DELETE CASCADE,
        ProductionStageId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES dbo.ProductionStages(Id) ON DELETE CASCADE,
        Sequence INT NOT NULL DEFAULT 1
    );
    CREATE UNIQUE INDEX IX_ProductProductionStage_ProductId_ProductionStageId ON dbo.ProductProductionStage(ProductId, ProductionStageId);
END
GO
