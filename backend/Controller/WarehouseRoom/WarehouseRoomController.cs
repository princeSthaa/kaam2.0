using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.WarehouseRoom;
using backend.Model;
using backend.Service.WarehouseRoom;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.WarehouseRoom
{
    [ApiController]
    [Route("api/warehouse-room")]
    public class WarehouseRoomController : ControllerBase
    {
        private readonly IWarehouseRoomService _WarehouseRoomService;

        public WarehouseRoomController(IWarehouseRoomService WarehouseRoomService)
        {
            _WarehouseRoomService = WarehouseRoomService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<WarehouseRoomDto>> GetById(Guid id)
        {
            var item = await _WarehouseRoomService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"WarehouseRoom with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<WarehouseRoomDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? name = null,
            [FromQuery] string? floor = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null,
            [FromQuery] Guid? warehouseId = null
        )
        {
            var items = await _WarehouseRoomService.GetAllAsync(
                id,
                name,
                floor,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy,
                warehouseId
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] WarehouseRoomDto warehouseRoomDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _WarehouseRoomService.CreateAsync(warehouseRoomDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] WarehouseRoomDto warehouseRoomDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _WarehouseRoomService.UpdateAsync(id, warehouseRoomDto);

            if (!updated)
            {
                return NotFound($"WarehouseRoom with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _WarehouseRoomService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"WarehouseRoom with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}

