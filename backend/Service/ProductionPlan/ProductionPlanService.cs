using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.ProductionPlan;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.ProductionPlan
{
    public class ProductionPlanService : IProductionPlanService
    {
        private readonly AppDbContext _context;

        public ProductionPlanService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<ProductionPlanDto>> GetAllAsync(
            string? id = null,
            string? planId = null,
            string? batchId = null,
            string? planName = null,
            string? demandType = null,
            string? sourceId = null,
            string? sourceName = null,
            PlanPriority? priority = null,
            PlanStatus? status = null,
            DateTime? plannedStartDate = null,
            DateTime? plannedCompletionDate = null,
            int? quantity = null,
            decimal? estimatedCost = null,
            string? supervisor = null,
            string? productionLine = null,
            string? materialWarehouse = null,
            string? productionNotes = null,
            DateTime? planDate = null,
            string? outputDestination = null,
            DateTime? requiredDate = null,
            decimal? progress = null,
            bool? blocked = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<ProductionPlanDto>($@"
                    EXEC sp_GetProductionPlans

                        @Id = {id},
                        @PlanId = {planId},
                        @BatchId = {batchId},
                        @PlanName = {planName},
                        @DemandType = {demandType},
                        @SourceId = {sourceId},
                        @SourceName = {sourceName},
                        @Priority = {priority},
                        @Status = {status},
                        @PlannedStartDate = {plannedStartDate},
                        @PlannedCompletionDate = {plannedCompletionDate},
                        @Quantity = {quantity},
                        @EstimatedCost = {estimatedCost},
                        @Supervisor = {supervisor},
                        @ProductionLine = {productionLine},
                        @MaterialWarehouse = {materialWarehouse},
                        @ProductionNotes = {productionNotes},
                        @PlanDate = {planDate},
                        @OutputDestination = {outputDestination},
                        @RequiredDate = {requiredDate},
                        @Progress = {progress},
                        @Blocked = {blocked},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<bool> CreateAsync(ProductionPlanDto productionPlanDto)
        {
            if (string.IsNullOrEmpty(productionPlanDto.Id)) {
                productionPlanDto.Id = Guid.NewGuid().ToString();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertProductionPlan
                    @Id = {productionPlanDto.Id},
                    @PlanId = {productionPlanDto.PlanId},
                    @BatchId = {productionPlanDto.BatchId},
                    @PlanName = {productionPlanDto.PlanName},
                    @DemandType = {productionPlanDto.DemandType},
                    @SourceId = {productionPlanDto.SourceId},
                    @SourceName = {productionPlanDto.SourceName},
                    @Priority = {productionPlanDto.Priority},
                    @Status = {productionPlanDto.Status},
                    @PlannedStartDate = {productionPlanDto.PlannedStartDate},
                    @PlannedCompletionDate = {productionPlanDto.PlannedCompletionDate},
                    @Quantity = {productionPlanDto.Quantity},
                    @EstimatedCost = {productionPlanDto.EstimatedCost},
                    @Supervisor = {productionPlanDto.Supervisor},
                    @ProductionLine = {productionPlanDto.ProductionLine},
                    @MaterialWarehouse = {productionPlanDto.MaterialWarehouse},
                    @ProductionNotes = {productionPlanDto.ProductionNotes},
                    @PlanDate = {productionPlanDto.PlanDate},
                    @OutputDestination = {productionPlanDto.OutputDestination},
                    @RequiredDate = {productionPlanDto.RequiredDate},
                    @Progress = {productionPlanDto.Progress},
                    @Blocked = {productionPlanDto.Blocked},
                    @CreatedAt = {productionPlanDto.CreatedAt},
                    @CreatedBy = {productionPlanDto.CreatedBy},
                    @UpdatedAt = {productionPlanDto.UpdatedAt},
                    @UpdatedBy = {productionPlanDto.UpdatedBy}
            ");

            if (productionPlanDto.ProductionPlanProducts != null)
            {
                foreach (var product in productionPlanDto.ProductionPlanProducts)
                {
                    if (string.IsNullOrEmpty(product.Id)) product.Id = Guid.NewGuid().ToString();
                    product.ProductionPlanId = productionPlanDto.Id;
                    await _context.Database.ExecuteSqlInterpolatedAsync($@"
                        EXEC sp_InsertProductionPlanProduct
                              @Id = {product.Id},
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
                      // Insert sizes
                      if (product.ProductionPlanProductSizes != null)
                      {
                          foreach (var size in product.ProductionPlanProductSizes)
                          {
                              if (string.IsNullOrEmpty(size.Id)) size.Id = Guid.NewGuid().ToString();
                              size.ProductionPlanProductId = product.Id;
                              await _context.Database.ExecuteSqlInterpolatedAsync($@"
                                  EXEC sp_InsertProductionPlanProductSize
                                      @Id = {size.Id},
                                      @Size = {size.Size},
                                      @Quantity = {size.Quantity},
                                      @CreatedAt = {size.CreatedAt},
                                      @CreatedBy = {size.CreatedBy},
                                      @UpdatedAt = {size.UpdatedAt},
                                      @UpdatedBy = {size.UpdatedBy},
                                      @ProductionPlanProductId = {size.ProductionPlanProductId}
                              ");
                          }
                      }
                  }
            }

            if (productionPlanDto.ProductionPlanStages != null)
            {
                foreach (var stage in productionPlanDto.ProductionPlanStages)
                {
                    if (string.IsNullOrEmpty(stage.Id)) stage.Id = Guid.NewGuid().ToString();
                    stage.ProductionPlanId = productionPlanDto.Id;
                    await _context.Database.ExecuteSqlInterpolatedAsync($@"
                        EXEC sp_InsertProductionPlanStage
                              @Id = {stage.Id},
                              @StageId = {stage.StageId},
                            @StageName = {stage.StageName},
                              @WorkCenterId = {stage.WorkCenterId},
                              @PlannedStartDate = {stage.PlannedStartDate},
                            @PlannedEndDate = {stage.PlannedEndDate},
                            @ActualStartDate = {stage.ActualStartDate},
                            @ActualEndDate = {stage.ActualEndDate},
                            @Status = {stage.Status},
                            @CompletedQty = {stage.CompletedQty},
                            @RejectedQty = {stage.RejectedQty},
                            @OperatorName = {stage.OperatorName},
                            @Remarks = {stage.Remarks},
                            @CreatedAt = {stage.CreatedAt},
                            @CreatedBy = {stage.CreatedBy},
                            @UpdatedAt = {stage.UpdatedAt},
                            @UpdatedBy = {stage.UpdatedBy},
                            @ProductionPlanId = {stage.ProductionPlanId}
                    ");
                }
            }
            return true;
        }

        public async Task<bool> UpdateAsync(string id, ProductionPlanDto productionPlanDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateProductionPlan

                    @Id = {id},
                    @PlanId = {productionPlanDto.PlanId},
                    @BatchId = {productionPlanDto.BatchId},
                    @PlanName = {productionPlanDto.PlanName},
                    @DemandType = {productionPlanDto.DemandType},
                    @SourceId = {productionPlanDto.SourceId},
                    @SourceName = {productionPlanDto.SourceName},
                    @Priority = {productionPlanDto.Priority},
                    @Status = {productionPlanDto.Status},
                    @PlannedStartDate = {productionPlanDto.PlannedStartDate},
                    @PlannedCompletionDate = {productionPlanDto.PlannedCompletionDate},
                    @Quantity = {productionPlanDto.Quantity},
                    @EstimatedCost = {productionPlanDto.EstimatedCost},
                    @Supervisor = {productionPlanDto.Supervisor},
                    @ProductionLine = {productionPlanDto.ProductionLine},
                    @MaterialWarehouse = {productionPlanDto.MaterialWarehouse},
                    @ProductionNotes = {productionPlanDto.ProductionNotes},
                    @PlanDate = {productionPlanDto.PlanDate},
                    @OutputDestination = {productionPlanDto.OutputDestination},
                    @RequiredDate = {productionPlanDto.RequiredDate},
                    @Progress = {productionPlanDto.Progress},
                    @Blocked = {productionPlanDto.Blocked},
                    @CreatedAt = {productionPlanDto.CreatedAt},
                    @CreatedBy = {productionPlanDto.CreatedBy},
                    @UpdatedAt = {productionPlanDto.UpdatedAt},
                    @UpdatedBy = {productionPlanDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var matchingPlans = await _context.ProductionPlans
                .Where(p => p.Id == id || p.PlanId == id)
                .ToListAsync();

            if (!matchingPlans.Any()) return false;

            foreach (var plan in matchingPlans)
            {
                var actualId = plan.Id;
                var stages = await _context.ProductionPlanStages.Where(s => s.ProductionPlanId == actualId).ToListAsync();
                if (stages.Any()) _context.ProductionPlanStages.RemoveRange(stages);

                var products = await _context.ProductionPlanProducts.Where(p => p.ProductionPlanId == actualId).ToListAsync();
                if (products.Any())
                {
                    var productIds = products.Select(p => p.Id).ToList();
                    var sizes = await _context.ProductionPlanProductSizes.Where(s => productIds.Contains(s.ProductionPlanProductId)).ToListAsync();
                    if (sizes.Any()) _context.ProductionPlanProductSizes.RemoveRange(sizes);
                    _context.ProductionPlanProducts.RemoveRange(products);
                }
                _context.ProductionPlans.Remove(plan);
            }
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ActivateAsync(string id)
        {
            var plan = await _context.ProductionPlans.FirstOrDefaultAsync(p => p.Id == id || p.PlanId == id);
            if (plan == null) return false;

            plan.Status = PlanStatus.Active;
            plan.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        
        public async Task<MaterialCheckResponseDto> CheckMaterialsAsync(MaterialCheckRequestDto request)
        {
            var response = new MaterialCheckResponseDto();
            var requiredMaterials = new Dictionary<string, decimal>();

            // 1. Group requested products and sum quantities
            var productQuantities = new Dictionary<string, int>();
            foreach (var prod in request.Products)
            {
                if (productQuantities.ContainsKey(prod.ProductId))
                {
                    productQuantities[prod.ProductId] += prod.Quantity;
                }
                else
                {
                    productQuantities[prod.ProductId] = prod.Quantity;
                }
            }

            // 2. Fetch BOMs for the requested products
            var productIds = productQuantities.Keys.ToList();
            var boms = await _context.BillOfMaterials
                .Include(b => b.Material)
                .Where(b => productIds.Contains(b.ProductId))
                .ToListAsync();

            // 3. Identify products missing BOMs
            var bomsGrouped = boms.GroupBy(b => b.ProductId).ToDictionary(g => g.Key, g => g.ToList());
            foreach (var productId in productIds)
            {
                if (!bomsGrouped.ContainsKey(productId) || !bomsGrouped[productId].Any())
                {
                    response.Warnings.Add($"Product with ID {productId} does not have a Bill of Materials defined.");
                }
            }

            // 4. Calculate required quantities per material
            foreach (var bom in boms)
            {
                var requestedQty = productQuantities[bom.ProductId];
                var baseRequired = requestedQty * bom.QtyPerUnit;
                var totalRequired = baseRequired * (1 + (bom.WastagePercent / 100m));
                
                if (requiredMaterials.ContainsKey(bom.MaterialId))
                {
                    requiredMaterials[bom.MaterialId] += totalRequired;
                }
                else
                {
                    requiredMaterials[bom.MaterialId] = totalRequired;
                }
            }

            // 5. Build Material Check Items
            var materialIds = requiredMaterials.Keys.ToList();
            var materials = await _context.Materials
                .Where(m => materialIds.Contains(m.Id))
                .ToDictionaryAsync(m => m.Id, m => m);

            foreach (var kvp in requiredMaterials)
            {
                var matId = kvp.Key;
                var reqQty = kvp.Value;
                
                if (materials.TryGetValue(matId, out var mat))
                {
                    var isShortage = reqQty > mat.AvailableQty;
                    response.Materials.Add(new MaterialCheckItemDto
                    {
                        MaterialId = mat.Id,
                        MaterialCode = mat.MaterialCode,
                        MaterialName = mat.Name,
                        Unit = mat.Unit,
                        RequiredQty = reqQty,
                        AvailableQty = mat.AvailableQty,
                        Status = isShortage ? "Shortage" : "Available"
                    });
                }
            }

            return response;
        }


        // </crudgen:methods>
    }
}



