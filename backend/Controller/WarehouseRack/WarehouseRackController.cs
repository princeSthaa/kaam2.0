using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.Dto.WarehouseRack;
using backend.Service.WarehouseRack;

namespace backend.Controller.WarehouseRack
{
    [ApiController]
    [Route("api/warehouse-rack")]
    public class WarehouseRackController : ControllerBase
    {
        private readonly IWarehouseRackService _warehouseRackService;

        public WarehouseRackController(IWarehouseRackService warehouseRackService)
        {
            _warehouseRackService = warehouseRackService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] Guid? id,
            [FromQuery] string? code,
            [FromQuery] DateTime? createdAt,
            [FromQuery] string? createdBy,
            [FromQuery] DateTime? updatedAt,
            [FromQuery] string? updatedBy,
            [FromQuery] Guid? warehouseRoomId)
        {
            var racks = await _warehouseRackService.GetAllAsync(id, code, createdAt, createdBy, updatedAt, updatedBy, warehouseRoomId);
            return Ok(racks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var rack = await _warehouseRackService.GetByIdAsync(id);
            if (rack == null) return NotFound();
            return Ok(rack);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] WarehouseRackDto warehouseRackDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _warehouseRackService.CreateAsync(warehouseRackDto);
            if (success) return Ok(new { id = warehouseRackDto.Id, message = "Created successfully" });
            return BadRequest("Failed to create warehouse rack.");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] WarehouseRackDto warehouseRackDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _warehouseRackService.UpdateAsync(id, warehouseRackDto);
            if (success) return Ok("Updated successfully");
            return BadRequest("Failed to update warehouse rack.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _warehouseRackService.DeleteAsync(id);
            if (success) return Ok("Deleted successfully");
            return BadRequest("Failed to delete warehouse rack.");
        }
    }
}
