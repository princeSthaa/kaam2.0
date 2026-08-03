-- IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Products]') AND name = 'SKU')
-- BEGIN
--     ALTER TABLE [Products] ADD [SKU] NVARCHAR(50) NULL;
-- END
-- GO

-- IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Products]') AND name = 'isActive')
-- BEGIN
--     ALTER TABLE [Products] ADD [isActive] BIT NOT NULL DEFAULT 1;
-- END
-- GO

-- IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Products]') AND name = 'ProductCategoryId')
-- BEGIN
--     ALTER TABLE [Products] ADD [ProductCategoryId] UNIQUEIDENTIFIER NULL;
-- END
-- GO

-- IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[ProductionPlanStages]') AND name = 'StageId')
-- BEGIN
--     ALTER TABLE [ProductionPlanStages] ADD [StageId] NVARCHAR(50) NULL;
-- END
-- GO

-- IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[ProductionPlanStages]') AND name = 'StageName')
-- BEGIN
--     ALTER TABLE [ProductionPlanStages] ADD [StageName] NVARCHAR(100) NULL;
-- END
-- GO

-- IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[ProductionPlanStages]') AND name = 'CreatedBy')
-- BEGIN
--     ALTER TABLE [ProductionPlanStages] ADD [CreatedBy] NVARCHAR(100) NULL;
-- END
-- GO

-- IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[ProductionPlanStages]') AND name = 'UpdatedBy')
-- BEGIN
--     ALTER TABLE [ProductionPlanStages] ADD [UpdatedBy] NVARCHAR(100) NULL;
-- END
-- GO
