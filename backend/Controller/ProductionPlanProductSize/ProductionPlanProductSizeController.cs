using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ProductionPlanProductSize;
using backend.Model;
using backend.Model.Enums;
using backend.Service.ProductionPlanProductSize;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.ProductionPlanProductSize
{
    [ApiController]
    [Route("api/production-plan-product-size")]
    public class ProductionPlanProductSizeController : ControllerBase
    {
        private readonly IProductionPlanProductSizeService _ProductionPlanProductSizeService;

        public ProductionPlanProductSizeController(IProductionPlanProductSizeService ProductionPlanProductSizeService)
        {
            _ProductionPlanProductSizeService = ProductionPlanProductSizeService;
        }

        // <crudgen:actions>
        [HttpGet]
        public async Task<ActionResult<List<ProductionPlanProductSizeDto>>> GetAll(
            [FromQuery] string? id = null,
            [FromQuery] ProductSize? size = null,
            [FromQuery] int? quantity = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null,
            [FromQuery] string? productionPlanProductId = null
        )
        {
            var items = await _ProductionPlanProductSizeService.GetAllAsync(
                id,
                size,
                quantity,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy,
                productionPlanProductId
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductionPlanProductSizeDto productionPlanProductSizeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _ProductionPlanProductSizeService.CreateAsync(productionPlanProductSizeDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ProductionPlanProductSizeDto productionPlanProductSizeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _ProductionPlanProductSizeService.UpdateAsync(id, productionPlanProductSizeDto);

            if (!updated)
            {
                return NotFound($"ProductionPlanProductSize with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _ProductionPlanProductSizeService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"ProductionPlanProductSize with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}

