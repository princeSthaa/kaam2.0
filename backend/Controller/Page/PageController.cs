using backend.Dto.Page;
using backend.Service.Page;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Page
{
    [ApiController]
    [Route("api/page")]
    public class PageController : ControllerBase
    {
        private readonly IPageService _service;

        public PageController(IPageService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PageDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _service.CreateAsync(dto);
            if (!created)
            {
                return BadRequest("Failed to create page record.");
            }

            return Ok(dto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PageGetDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"Page with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<PageGetDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? name = null,
            [FromQuery] string? route = null,
            [FromQuery] Guid? parentPageId = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] DateTime? updatedAt = null
        )
        {
            var items = await _service.GetAllAsync(
                id,
                name,
                route,
                parentPageId,
                isActive,
                createdAt,
                updatedAt
            );

            return Ok(items);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] PageDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _service.UpdateAsync(id, dto);

            if (!updated)
            {
                return NotFound($"Page with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Page with ID {id} not found.");
            }

            return NoContent();
        }
    }
}
