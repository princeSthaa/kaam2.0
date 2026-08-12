using Microsoft.AspNetCore.Mvc;
using backend.Dto.WarehouseFloor;
using backend.Service.WarehouseFloor;

namespace backend.Controller.WarehouseFloor
{
    [ApiController]
    [Route("api/warehouse-floor")]
    public class WarehouseFloorController : ControllerBase
    {
        private readonly IWarehouseFloorService _service;

        public WarehouseFloorController(IWarehouseFloorService service)
        {
            _service = service;
        }

        [HttpGet("{id}")] 
        public async Task<ActionResult<WarehouseFloorDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"WarehouseFloor with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<WarehouseFloorDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? code = null,
            [FromQuery] string? Name = null,
            [FromQuery] Guid? warehouseId = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] DateTime? updatedAt = null
        )
        {
            var items = await _service.GetAllAsync(
                id,
                code,
                Name,
                warehouseId,
                createdAt,
                updatedAt
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] WarehouseFloorDto dto)
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
        public async Task<IActionResult> Update(Guid id, [FromBody] WarehouseFloorDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);

            if (!updated)
            {
                return NotFound($"Warehouse with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Warehouse with ID {id} not found.");
            }

            return NoContent();
        }
    }
}
