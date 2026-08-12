using Microsoft.AspNetCore.Mvc;
using backend.Dto.WarehouseRack;
using backend.Service.WarehouseRack;

namespace backend.Controller.WarehouseRack
{
    [ApiController]
    [Route("api/warehouse-rack")]
    public class WarehouseRackController : ControllerBase
    {
        private readonly IWarehouseRackService _service;

        public WarehouseRackController(IWarehouseRackService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] Guid? id,
            [FromQuery] string? code,
            [FromQuery] string? name,
            [FromQuery] DateTime? createdAt,
            [FromQuery] DateTime? updatedAt,
            [FromQuery] Guid? warehouseRoomId)
        {
            var racks = await _service.GetAllAsync(id, code, name, createdAt, updatedAt, warehouseRoomId);
            return Ok(racks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var rack = await _service.GetByIdAsync(id);
            if (rack == null) return NotFound();
            return Ok(rack);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] WarehouseRackDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _service.CreateAsync(dto);

            if (created == null)
            {
                return BadRequest();
            }

            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] WarehouseRackDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _service.UpdateAsync(id, dto);
            if (success) return Ok("Updated successfully");
            return BadRequest("Failed to update warehouse rack.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _service.DeleteAsync(id);
            if (success) return Ok("Deleted successfully");
            return BadRequest("Failed to delete warehouse rack.");
        }
    }
}
