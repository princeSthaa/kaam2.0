using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Warehouse;
using backend.Model;
using backend.Service.Warehouse;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Warehouse
{
    [ApiController]
    [Route("api/warehouse")]
    public class WarehouseController : ControllerBase
    {
        private readonly IWarehouseService _WarehouseService;

        public WarehouseController(IWarehouseService WarehouseService)
        {
            _WarehouseService = WarehouseService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<WarehouseDto>> GetById(Guid id)
        {
            var item = await _WarehouseService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"Warehouse with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<WarehouseDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? code = null,
            [FromQuery] string? name = null,
            [FromQuery] string? location = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _WarehouseService.GetAllAsync(
                id,
                code,
                name,
                location,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] WarehouseDto warehouseDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _WarehouseService.CreateAsync(warehouseDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] WarehouseDto warehouseDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _WarehouseService.UpdateAsync(id, warehouseDto);

            if (!updated)
            {
                return NotFound($"Warehouse with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _WarehouseService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Warehouse with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
