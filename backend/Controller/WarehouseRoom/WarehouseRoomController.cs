using backend.Dto.WarehouseRoom;
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
            [FromQuery] string? code = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] Guid? warehouseId = null
        )
        {
            var items = await _WarehouseRoomService.GetAllAsync(
                id,
                name,
                code,
                createdAt,
                updatedAt,
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

            if (created == null)
            {
                return BadRequest();
            }

            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] WarehouseRoomDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            return await _WarehouseRoomService.UpdateAsync(id, dto)? NoContent() : NotFound($"WarehouseRoom with ID {id} not found.");

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            return await _WarehouseRoomService.DeleteAsync(id)? NoContent(): NotFound($"WarehouseRoom with ID {id} not found.");
        }
    }
}

