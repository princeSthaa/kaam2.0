using backend.Dto.MaterialCategory;
using backend.Service.MaterialCategory;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.MaterialCategory
{
    [ApiController]
    [Route("api/material-category")]
    public class MaterialCategoryController : ControllerBase
    {
        private readonly IMaterialCategoryService _MaterialCategoryService;

        public MaterialCategoryController(IMaterialCategoryService MaterialCategoryService)
        {
            _MaterialCategoryService = MaterialCategoryService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<MaterialCategoryGetDto>> GetById(Guid id)
        {
            var item = await _MaterialCategoryService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"MaterialCategory with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<MaterialCategoryGetDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? name = null,
            [FromQuery] string? materialCode = null,
            [FromQuery] string? description = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] Guid? materialTypeId = null
        )
        {
            var items = await _MaterialCategoryService.GetAllAsync(
                id,
                name,
                materialCode,
                description,
                isActive,
                createdAt,
                updatedAt,
                materialTypeId
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MaterialCategoryDto materialCategoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _MaterialCategoryService.CreateAsync(materialCategoryDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] MaterialCategoryDto materialCategoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _MaterialCategoryService.UpdateAsync(id, materialCategoryDto);

            if (!updated)
            {
                return NotFound($"MaterialCategory with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _MaterialCategoryService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"MaterialCategory with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
