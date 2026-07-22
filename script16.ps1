$lines = Get-Content 'C:\Code\Kaam2\backend\Service\ProductionPlan\ProductionPlanService.cs'
$idx = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'public async Task<bool> UpdateAsync') {
        $idx = $i
        break
    }
}
if ($idx -gt 0) {
    $insert = @'
            if (productionPlanDto.ProductionPlanProducts != null)
            {
                foreach (var product in productionPlanDto.ProductionPlanProducts)
                {
                    if (string.IsNullOrEmpty(product.Id)) product.Id = Guid.NewGuid().ToString();
                    product.ProductionPlanId = productionPlanDto.Id;
                    await _context.Database.ExecuteSqlInterpolatedAsync($"
                        EXEC sp_InsertProductionPlanProduct
                            @LineId = {product.LineId},
                            @OrderNo = {product.OrderNo},
                            @ProductId = {product.ProductId},
                            @ProductCode = {product.ProductCode},
                            @ProductName = {product.ProductName},
                            @Category = {product.Category},
                            @Variant = {product.Variant},
                            @Quantity = {product.Quantity},
                            @RequiredDate = {product.RequiredDate},
                            @Status = {product.Status},
                            @ProductImage = {product.ProductImage},
                            @PlannedStartDate = {product.PlannedStartDate},
                            @PlannedCompletionDate = {product.PlannedCompletionDate},
                            @Priority = {product.Priority},
                            @ProductionNotes = {product.ProductionNotes},
                            @CreatedAt = {product.CreatedAt},
                            @CreatedBy = {product.CreatedBy},
                            @UpdatedAt = {product.UpdatedAt},
                            @UpdatedBy = {product.UpdatedBy},
                            @ProductionPlanId = {product.ProductionPlanId}
                    ");
                }
            }

            if (productionPlanDto.ProductionPlanStages != null)
            {
                foreach (var stage in productionPlanDto.ProductionPlanStages)
                {
                    if (string.IsNullOrEmpty(stage.Id)) stage.Id = Guid.NewGuid().ToString();
                    stage.ProductionPlanId = productionPlanDto.Id;
                    await _context.Database.ExecuteSqlInterpolatedAsync($"
                        EXEC sp_InsertProductionPlanStage
                            @StageId = {stage.StageId},
                            @StageName = {stage.StageName},
                            @WorkCenter = {stage.WorkCenter},
                            @PlannedStartDate = {stage.PlannedStartDate},
                            @PlannedEndDate = {stage.PlannedEndDate},
                            @ActualStartDate = {stage.ActualStartDate},
                            @ActualEndDate = {stage.ActualEndDate},
                            @Status = {stage.Status},
                            @CompletedQty = {stage.CompletedQty},
                            @RejectedQty = {stage.RejectedQty},
                            @Operator = {stage.Operator},
                            @Notes = {stage.Notes},
                            @CreatedAt = {stage.CreatedAt},
                            @CreatedBy = {stage.CreatedBy},
                            @UpdatedAt = {stage.UpdatedAt},
                            @UpdatedBy = {stage.UpdatedBy},
                            @ProductionPlanId = {stage.ProductionPlanId}
                    ");
                }
            }
'@
    # Insert right before "return true;" which is a few lines above UpdateAsync
    $insertIdx = $idx - 3
    $lines = $lines[0..($insertIdx-1)] + $insert + $lines[$insertIdx..($lines.Count-1)]
    $lines | Out-File 'C:\Code\Kaam2\backend\Service\ProductionPlan\ProductionPlanService.cs' -Encoding utf8
}
