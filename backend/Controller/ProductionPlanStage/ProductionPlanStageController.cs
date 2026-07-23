using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ProductionPlanStage;
using backend.Model;
using backend.Model.Enums;
using backend.Service.ProductionPlanStage;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.ProductionPlanStage
{
    [ApiController]
    [Route("api/production-plan-stage")]
    public class ProductionPlanStageController : ControllerBase
    {
        private readonly IProductionPlanStageService _ProductionPlanStageService;

        public ProductionPlanStageController(IProductionPlanStageService ProductionPlanStageService)
        {
            _ProductionPlanStageService = ProductionPlanStageService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<ProductionPlanStageDto>> GetById(Guid id)
        {
            var item = await _ProductionPlanStageService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"ProductionPlanStage with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<ProductionPlanStageDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? stageId = null,
            [FromQuery] string? stageName = null,
            [FromQuery] string? operatorName = null,
            [FromQuery] DateTime? plannedStartDate = null,
            [FromQuery] DateTime? plannedEndDate = null,
            [FromQuery] PlanStatus? status = null,
            [FromQuery] int? completedQty = null,
            [FromQuery] int? rejectedQty = null,
            [FromQuery] DateTime? actualStartDate = null,
            [FromQuery] DateTime? actualEndDate = null,
            [FromQuery] string? remarks = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null,
            [FromQuery] Guid? productionPlanId = null
        )
        {
            var items = await _ProductionPlanStageService.GetAllAsync(
                id,
                stageId,
                stageName,
                operatorName,
                plannedStartDate,
                plannedEndDate,
                status,
                completedQty,
                rejectedQty,
                actualStartDate,
                actualEndDate,
                remarks,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy,
                productionPlanId
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductionPlanStageDto productionPlanStageDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _ProductionPlanStageService.CreateAsync(productionPlanStageDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ProductionPlanStageDto productionPlanStageDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _ProductionPlanStageService.UpdateAsync(id, productionPlanStageDto);

            if (!updated)
            {
                return NotFound($"ProductionPlanStage with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _ProductionPlanStageService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"ProductionPlanStage with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}

