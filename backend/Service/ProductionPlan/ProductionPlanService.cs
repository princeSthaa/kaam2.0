using Dapper;
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
            backend.Model.Enums.PlanPriority? priority = null,
            backend.Model.Enums.PlanStatus? status = null,
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
            DateTime? updatedAt = null
        )
        {
            var connection = _context.Database.GetDbConnection();
            var parameters = new Dapper.DynamicParameters();
            parameters.Add("@Id", id);

            
            using var multi = await connection.QueryMultipleAsync(
                "sp_GetProductionPlans",
                parameters,
                commandType: System.Data.CommandType.StoredProcedure
            );

            var plans = !multi.IsConsumed ? (await multi.ReadAsync<ProductionPlanDto>()).ToList() : new List<ProductionPlanDto>();
            var products = !multi.IsConsumed ? (await multi.ReadAsync<backend.Dto.ProductionPlanProduct.ProductionPlanProductDto>()).ToList() : new List<backend.Dto.ProductionPlanProduct.ProductionPlanProductDto>();
            var sizes = !multi.IsConsumed ? (await multi.ReadAsync<backend.Dto.ProductionPlanProductSize.ProductionPlanProductSizeDto>()).ToList() : new List<backend.Dto.ProductionPlanProductSize.ProductionPlanProductSizeDto>();
            var stages = !multi.IsConsumed ? (await multi.ReadAsync<backend.Dto.ProductionPlanStage.ProductionPlanStageDto>()).ToList() : new List<backend.Dto.ProductionPlanStage.ProductionPlanStageDto>();

            foreach (var p in products)
            {
                p.ProductionPlanProductSizes = sizes.Where(s => s.ProductionPlanProductId == p.Id).ToList();
            }

            foreach (var plan in plans)
            {
                plan.ProductionPlanProducts = products.Where(p => p.ProductionPlanId == plan.Id).ToList();
                plan.ProductionPlanStages = stages.Where(s => s.ProductionPlanId == plan.Id).ToList();
            }

            // In-memory filters for remaining arguments
            if (plannedStartDate.HasValue) plans = plans.Where(p => p.PlannedStartDate == plannedStartDate).ToList();
            // etc...

            // Filtering done in memory

            if (!string.IsNullOrWhiteSpace(planId)) plans = plans.Where(p => p.PlanId == planId).ToList();
            if (!string.IsNullOrWhiteSpace(batchId)) plans = plans.Where(p => p.BatchId == batchId).ToList();
            if (!string.IsNullOrWhiteSpace(planName)) plans = plans.Where(p => p.PlanName != null && p.PlanName.Contains(planName)).ToList();
            if (priority.HasValue) plans = plans.Where(p => p.Priority == priority.Value).ToList();
            if (status.HasValue) plans = plans.Where(p => p.Status == status.Value).ToList();
            return plans;
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
                UpdatedAt = productionPlanDto.UpdatedAt
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
                    UpdatedAt = productDto.UpdatedAt
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
                        UpdatedAt = sizeDto.UpdatedAt
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
                    UpdatedAt = stageDto.UpdatedAt
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
                    sourceOrder.Status = OrderStatus.Processing;
                    sourceOrder.ProductionPlanId = plan.Id;
                }
                else
                {
                    sourceOrder.Status = OrderStatus.Processing;
                }

                sourceOrder.UpdatedAt = now;
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
                    @UpdatedAt = {productionPlanDto.UpdatedAt}
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



