using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Inventory;
using backend.Model;
using backend.Service.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Inventory
{
    [ApiController]
    [Route("api/inventory")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _InventoryService;

        public InventoryController(IInventoryService InventoryService)
        {
            _InventoryService = InventoryService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<InventoryDto>> GetById(Guid id)
        {
            var item = await _InventoryService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"Inventory with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<InventoryDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? sKU = null,
            [FromQuery] string? itemName = null,
            [FromQuery] string? type = null,
            [FromQuery] decimal? quantity = null,
            [FromQuery] string? location = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _InventoryService.GetAllAsync(
                id,
                sKU,
                itemName,
                type,
                quantity,
                location,
                status,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] InventoryDto inventoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _InventoryService.CreateAsync(inventoryDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] InventoryDto inventoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _InventoryService.UpdateAsync(id, inventoryDto);

            if (!updated)
            {
                return NotFound($"Inventory with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _InventoryService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Inventory with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
