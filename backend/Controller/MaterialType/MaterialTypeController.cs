using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.MaterialType;
using backend.Model;
using backend.Service.MaterialType;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.MaterialType
{
    [ApiController]
    [Route("api/material-type")]
    public class MaterialTypeController : ControllerBase
    {
        private readonly IMaterialTypeService _MaterialTypeService;

        public MaterialTypeController(IMaterialTypeService MaterialTypeService)
        {
            _MaterialTypeService = MaterialTypeService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<MaterialTypeGetDto>> GetById(Guid id)
        {
            var item = await _MaterialTypeService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"MaterialType with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<MaterialTypeGetDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? name = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _MaterialTypeService.GetAllAsync(
                id,
                name,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MaterialTypeDto materialTypeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _MaterialTypeService.CreateAsync(materialTypeDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] MaterialTypeDto materialTypeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _MaterialTypeService.UpdateAsync(id, materialTypeDto);

            if (!updated)
            {
                return NotFound($"MaterialType with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _MaterialTypeService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"MaterialType with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
