using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.WarehouseShelf;
using backend.Model;
using backend.Service.WarehouseShelf;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.WarehouseShelf
{
    [ApiController]
    [Route("api/warehouse-shelf")]
    public class WarehouseShelfController : ControllerBase
    {
        private readonly IWarehouseShelfService _WarehouseShelfService;

        public WarehouseShelfController(IWarehouseShelfService WarehouseShelfService)
        {
            _WarehouseShelfService = WarehouseShelfService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<WarehouseShelfDto>> GetById(Guid id)
        {
            var item = await _WarehouseShelfService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"WarehouseShelf with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<WarehouseShelfDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? code = null,
            [FromQuery] string? capacity = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null,
            [FromQuery] Guid? warehouseRoomId = null
        )
        {
            var items = await _WarehouseShelfService.GetAllAsync(
                id,
                code,
                capacity,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy,
                warehouseRoomId
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] WarehouseShelfDto warehouseShelfDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _WarehouseShelfService.CreateAsync(warehouseShelfDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] WarehouseShelfDto warehouseShelfDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _WarehouseShelfService.UpdateAsync(id, warehouseShelfDto);

            if (!updated)
            {
                return NotFound($"WarehouseShelf with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _WarehouseShelfService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"WarehouseShelf with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}

