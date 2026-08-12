using backend.Dto.WarehouseShelf;
using backend.Service.WarehouseShelf;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.WarehouseShelf
{
    [ApiController]
    [Route("api/warehouse-shelf")]
    public class WarehouseShelfController : ControllerBase
    {
        private readonly IWarehouseShelfService _service;

        public WarehouseShelfController(IWarehouseShelfService service)
        {
            _service = service;
        }

        [HttpGet("{id}")] 
        public async Task<ActionResult<WarehouseShelfDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            return item != null ? 
                Ok(item) : 
                NotFound($"WarehouseShelf with ID {id} not found.");
        }

        [HttpGet]
        public async Task<ActionResult<List<WarehouseShelfDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? code = null,
            [FromQuery] string? name = null,
            [FromQuery] string? capacity = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] Guid? warehouseRackId = null
        )
        {
            var items = await _service.GetAllAsync(
                id,
                code,
                name,
                capacity,
                createdAt,
                updatedAt,
                warehouseRackId
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] WarehouseShelfDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _service.CreateAsync(dto);

            return created != null? Ok(created) : BadRequest();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] WarehouseShelfDto warehouseShelfDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            return await _service.UpdateAsync(id, warehouseShelfDto)? 
                NoContent() : 
                NotFound($"WarehouseShelf with ID {id} not found.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            return await _service.DeleteAsync(id)? 
                NoContent():
                NotFound($"WarehouseShelf with ID {id} not found.");
        }
    }
}

