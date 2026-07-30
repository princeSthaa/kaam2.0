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
            Guid? id = null,
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

        public async Task<ProductionPlanDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<ProductionPlanDto?> GetByPlanIdAsync(string planId)
        {
            var results = await GetAllAsync(planId: planId);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(ProductionPlanDto productionPlanDto)
        {
            if (productionPlanDto.Id == Guid.Empty)
            {
                productionPlanDto.Id = Guid.NewGuid();
            }

            var sourceOrderIds = productionPlanDto.SourceOrderIds
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToList();

            var sourceOrders = sourceOrderIds.Count == 0
                ? new List<backend.Model.Order>()
                : await _context.Orders
                    .Include(order => order.OrderItems)
                    .Where(order => sourceOrderIds.Contains(order.Id))
                    .ToListAsync();

            if (sourceOrders.Count != sourceOrderIds.Count)
            {
                throw new InvalidOperationException("One or more selected orders no longer exist.");
            }

            foreach (var order in sourceOrders)
            {
                if (order.Status is OrderStatus.Completed or OrderStatus.Cancelled)
                {
                    throw new InvalidOperationException($"Order {order.OrderNumber} is already completed or cancelled.");
                }

                var orderItemIds = order.OrderItems.Select(i => i.Id).ToList();
                var plannedItemIdsForOrder = await _context.ProductionPlanProducts
                    .Where(ppp => ppp.OrderItemId.HasValue && orderItemIds.Contains(ppp.OrderItemId.Value))
                    .Select(ppp => ppp.OrderItemId!.Value)
                    .ToListAsync();

                if (orderItemIds.Count > 0 && plannedItemIdsForOrder.Count >= orderItemIds.Count)
                {
                    throw new InvalidOperationException($"All items in order '{order.OrderNumber}' have already been planned.");
                }
            }

            var plan = new backend.Model.ProductionPlan
            {
                Id = productionPlanDto.Id,
                PlanId = productionPlanDto.PlanId,
                BatchId = productionPlanDto.BatchId,
                PlanName = productionPlanDto.PlanName,
                DemandType = productionPlanDto.DemandType,
                SourceId = productionPlanDto.SourceId,
                SourceName = productionPlanDto.SourceName,
                Priority = productionPlanDto.Priority,
                Status = productionPlanDto.Status,
                PlannedStartDate = productionPlanDto.PlannedStartDate,
                PlannedCompletionDate = productionPlanDto.PlannedCompletionDate,
                Quantity = productionPlanDto.Quantity,
                EstimatedCost = productionPlanDto.EstimatedCost,
                Supervisor = productionPlanDto.Supervisor,
                ProductionLine = productionPlanDto.ProductionLine,
                MaterialWarehouse = productionPlanDto.MaterialWarehouse,
                ProductionNotes = productionPlanDto.ProductionNotes,
                PlanDate = productionPlanDto.PlanDate,
                OutputDestination = productionPlanDto.OutputDestination,
                RequiredDate = productionPlanDto.RequiredDate,
                Progress = productionPlanDto.Progress,
                Blocked = productionPlanDto.Blocked,
                CreatedAt = productionPlanDto.CreatedAt,
                CreatedBy = productionPlanDto.CreatedBy,
                UpdatedAt = productionPlanDto.UpdatedAt,
                UpdatedBy = productionPlanDto.UpdatedBy
            };

            foreach (var productDto in productionPlanDto.ProductionPlanProducts)
            {
                // Auto-resolve OrderItemId if not provided
                if (!productDto.OrderItemId.HasValue || productDto.OrderItemId == Guid.Empty)
                {
                    var plannedItemIdsInDb = await _context.ProductionPlanProducts
                        .Where(ppp => ppp.OrderItemId.HasValue)
                        .Select(ppp => ppp.OrderItemId!.Value)
                        .ToListAsync();

                    var matchingUnplannedItem = sourceOrders
                        .SelectMany(o => o.OrderItems)
                        .FirstOrDefault(i => i.ProductId.ToString() == productDto.ProductId && !plannedItemIdsInDb.Contains(i.Id));

                    if (matchingUnplannedItem != null)
                    {
                        productDto.OrderItemId = matchingUnplannedItem.Id;
                    }
                }

                if (productDto.OrderItemId.HasValue && productDto.OrderItemId != Guid.Empty)
                {
                    bool alreadyPlanned = await _context.ProductionPlanProducts
                        .AnyAsync(ppp => ppp.OrderItemId == productDto.OrderItemId.Value);

                    if (alreadyPlanned)
                    {
                        throw new InvalidOperationException($"Order item '{productDto.OrderItemId}' has already been planned in another production plan.");
                    }
                }

                var productId = productDto.Id == Guid.Empty ? Guid.NewGuid() : productDto.Id;
                var product = new backend.Model.ProductionPlanProduct
                {
                    Id = productId,
                    ProductionPlanId = plan.Id,
                    OrderItemId = productDto.OrderItemId,
                    LineId = productDto.LineId,
                    OrderNo = string.IsNullOrWhiteSpace(productDto.OrderNo) && sourceOrders.Count > 0
                        ? sourceOrders.First().OrderNumber
                        : productDto.OrderNo,
                    ProductId = productDto.ProductId,
                    ProductCode = productDto.ProductCode,
                    ProductName = productDto.ProductName,
                    Category = productDto.Category,
                    Variant = productDto.Variant,
                    Quantity = productDto.Quantity,
                    RequiredDate = productDto.RequiredDate,
                    Status = productDto.Status,
                    ProductImage = productDto.ProductImage,
                    PlannedStartDate = productDto.PlannedStartDate,
                    PlannedCompletionDate = productDto.PlannedCompletionDate,
                    Priority = productDto.Priority,
                    ProductionNotes = productDto.ProductionNotes,
                    CreatedAt = productDto.CreatedAt,
                    CreatedBy = productDto.CreatedBy,
                    UpdatedAt = productDto.UpdatedAt,
                    UpdatedBy = productDto.UpdatedBy
                };

                foreach (var sizeDto in productDto.ProductionPlanProductSizes)
                {
                    product.ProductionPlanProductSizes.Add(new backend.Model.ProductionPlanProductSize
                    {
                        Id = sizeDto.Id == Guid.Empty ? Guid.NewGuid() : sizeDto.Id,
                        ProductionPlanProductId = productId,
                        Size = sizeDto.Size,
                        Quantity = sizeDto.Quantity,
                        CreatedAt = sizeDto.CreatedAt,
                        CreatedBy = sizeDto.CreatedBy,
                        UpdatedAt = sizeDto.UpdatedAt,
                        UpdatedBy = sizeDto.UpdatedBy
                    });
                }

                plan.ProductionPlanProducts.Add(product);
            }

            foreach (var stageDto in productionPlanDto.ProductionPlanStages)
            {
                plan.ProductionPlanStages.Add(new backend.Model.ProductionPlanStage
                {
                    Id = stageDto.Id == Guid.Empty ? Guid.NewGuid() : stageDto.Id,
                    ProductionPlanId = plan.Id,
                    StageId = stageDto.StageId,
                    StageName = stageDto.StageName,
                    WorkCenterId = stageDto.WorkCenterId,
                    OperatorName = stageDto.OperatorName,
                    PlannedStartDate = stageDto.PlannedStartDate,
                    PlannedEndDate = stageDto.PlannedEndDate,
                    Status = stageDto.Status,
                    CompletedQty = stageDto.CompletedQty,
                    RejectedQty = stageDto.RejectedQty,
                    ActualStartDate = stageDto.ActualStartDate,
                    ActualEndDate = stageDto.ActualEndDate,
                    Remarks = stageDto.Remarks,
                    CreatedAt = stageDto.CreatedAt,
                    CreatedBy = stageDto.CreatedBy,
                    UpdatedAt = stageDto.UpdatedAt,
                    UpdatedBy = stageDto.UpdatedBy
                });
            }

            var now = DateTime.UtcNow;
            var newPlannedProductIds = plan.ProductionPlanProducts.Select(p => p.ProductId).ToList();

            foreach (var sourceOrder in sourceOrders)
            {
                var existingPlannedProductIds = await _context.ProductionPlanProducts
                    .Where(ppp => ppp.OrderNo == sourceOrder.OrderNumber || ppp.OrderNo == sourceOrder.Id.ToString())
                    .Select(ppp => ppp.ProductId)
                    .ToListAsync();

                var allPlannedForOrder = existingPlannedProductIds.Concat(newPlannedProductIds).Distinct().ToList();
                var allOrderProductIds = sourceOrder.OrderItems.Select(i => i.ProductId.ToString()).Distinct().ToList();

                bool isFullyPlanned = allOrderProductIds.Count > 0 && allOrderProductIds.All(pid => allPlannedForOrder.Contains(pid));

                if (isFullyPlanned)
                {
                    sourceOrder.Status = OrderStatus.Planned;
                    sourceOrder.ProductionPlanId = plan.Id;
                }
                else
                {
                    sourceOrder.Status = OrderStatus.Processing;
                }

                sourceOrder.UpdatedAt = now;
                sourceOrder.UpdatedBy = string.IsNullOrWhiteSpace(productionPlanDto.CreatedBy)
                    ? "Production Planning"
                    : productionPlanDto.CreatedBy;
            }

            _context.ProductionPlans.Add(plan);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, ProductionPlanDto productionPlanDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateProductionPlan

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

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteProductionPlan
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}



