using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ProductionPlanProduct;
using backend.Model;
using backend.Model.Enums;
using backend.Service.ProductionPlanProduct;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.ProductionPlanProduct
{
    [ApiController]
    [Route("api/production-plan-product")]
    public class ProductionPlanProductController : ControllerBase
    {
        private readonly IProductionPlanProductService _ProductionPlanProductService;

        public ProductionPlanProductController(IProductionPlanProductService ProductionPlanProductService)
        {
            _ProductionPlanProductService = ProductionPlanProductService;
        }

        // <crudgen:actions>
        [HttpGet]
        public async Task<ActionResult<List<ProductionPlanProductDto>>> GetAll(
            [FromQuery] string? id = null,
            [FromQuery] string? lineId = null,
            [FromQuery] string? orderNo = null,
            [FromQuery] string? productId = null,
            [FromQuery] string? productCode = null,
            [FromQuery] string? productName = null,
            [FromQuery] string? category = null,
            [FromQuery] string? variant = null,
            [FromQuery] int? quantity = null,
            [FromQuery] DateTime? requiredDate = null,
            [FromQuery] PlanStatus? status = null,
            [FromQuery] string? productImage = null,
            [FromQuery] DateTime? plannedStartDate = null,
            [FromQuery] DateTime? plannedCompletionDate = null,
            [FromQuery] PlanPriority? priority = null,
            [FromQuery] string? productionNotes = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null,
            [FromQuery] string? productionPlanId = null
        )
        {
            var items = await _ProductionPlanProductService.GetAllAsync(
                id,
                lineId,
                orderNo,
                productId,
                productCode,
                productName,
                category,
                variant,
                quantity,
                requiredDate,
                status,
                productImage,
                plannedStartDate,
                plannedCompletionDate,
                priority,
                productionNotes,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy,
                productionPlanId
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductionPlanProductDto productionPlanProductDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _ProductionPlanProductService.CreateAsync(productionPlanProductDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ProductionPlanProductDto productionPlanProductDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _ProductionPlanProductService.UpdateAsync(id, productionPlanProductDto);

            if (!updated)
            {
                return NotFound($"ProductionPlanProduct with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _ProductionPlanProductService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"ProductionPlanProduct with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}

