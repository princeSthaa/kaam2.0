using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ProductionPlan;
using backend.Model;
using backend.Model.Enums;
using backend.Service.ProductionPlan;
using Microsoft.AspNetCore.Mvc;

using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.ProductionPlan
{
    [ApiController]
    [Route("api/production-plans")]
    public class ProductionPlanController : ControllerBase
    {
        private readonly IProductionPlanService _ProductionPlanService;
        private readonly AppDbContext _context;

        public ProductionPlanController(IProductionPlanService ProductionPlanService, AppDbContext context)
        {
            _ProductionPlanService = ProductionPlanService;
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var plan = await _context.ProductionPlans
                .Include(p => p.ProductionPlanProducts)
                    .ThenInclude(p => p.ProductionPlanProductSizes)
                .Include(p => p.ProductionPlanStages)
                .FirstOrDefaultAsync(p => p.Id == id || p.PlanId == id);

            if (plan == null) return NotFound($"ProductionPlan with ID {id} not found.");

            return Ok(plan);
        }

        // <crudgen:actions>
        [HttpGet]
        public async Task<ActionResult<List<ProductionPlanDto>>> GetAll(
            [FromQuery] string? id = null,
            [FromQuery] string? planId = null,
            [FromQuery] string? batchId = null,
            [FromQuery] string? planName = null,
            [FromQuery] string? demandType = null,
            [FromQuery] string? sourceId = null,
            [FromQuery] string? sourceName = null,
            [FromQuery] PlanPriority? priority = null,
            [FromQuery] PlanStatus? status = null,
            [FromQuery] DateTime? plannedStartDate = null,
            [FromQuery] DateTime? plannedCompletionDate = null,
            [FromQuery] int? quantity = null,
            [FromQuery] decimal? estimatedCost = null,
            [FromQuery] string? supervisor = null,
            [FromQuery] string? productionLine = null,
            [FromQuery] string? materialWarehouse = null,
            [FromQuery] string? productionNotes = null,
            [FromQuery] DateTime? planDate = null,
            [FromQuery] string? outputDestination = null,
            [FromQuery] DateTime? requiredDate = null,
            [FromQuery] decimal? progress = null,
            [FromQuery] bool? blocked = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _ProductionPlanService.GetAllAsync(
                id,
                planId,
                batchId,
                planName,
                demandType,
                sourceId,
                sourceName,
                priority,
                status,
                plannedStartDate,
                plannedCompletionDate,
                quantity,
                estimatedCost,
                supervisor,
                productionLine,
                materialWarehouse,
                productionNotes,
                planDate,
                outputDestination,
                requiredDate,
                progress,
                blocked,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductionPlanDto productionPlanDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _ProductionPlanService.CreateAsync(productionPlanDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ProductionPlanDto productionPlanDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _ProductionPlanService.UpdateAsync(id, productionPlanDto);

            if (!updated)
            {
                return NotFound($"ProductionPlan with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _ProductionPlanService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"ProductionPlan with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpPost("{id}/activate")]
        public async Task<IActionResult> Activate(string id)
        {
            var activated = await _ProductionPlanService.ActivateAsync(id);
            if (!activated)
            {
                return NotFound($"ProductionPlan with ID {id} not found.");
            }
            return Ok(new { message = "Plan activated successfully" });
        }
        
        [HttpPost("check-materials")]
        public async Task<IActionResult> CheckMaterials([FromBody] MaterialCheckRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _ProductionPlanService.CheckMaterialsAsync(request);
            return Ok(result);
        }

        // </crudgen:actions>
    }
}
