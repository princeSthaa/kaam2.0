using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Fabric;
using backend.Model;
using backend.Service.Fabric;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Fabric
{
    [ApiController]
    [Route("api/fabric")]
    public class FabricController : ControllerBase
    {
        private readonly IFabricService _FabricService;

        public FabricController(IFabricService FabricService)
        {
            _FabricService = FabricService;
        }

        // <crudgen:actions>
        [HttpGet]
        public async Task<ActionResult<List<FabricDto>>> GetAll(
            [FromQuery] string? id = null,
            [FromQuery] string? name = null,
            [FromQuery] string? category = null,
            [FromQuery] string? imagePath = null,
            [FromQuery] decimal? unitPrice = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _FabricService.GetAllAsync(
                id,
                name,
                category,
                imagePath,
                unitPrice,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FabricDto fabricDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _FabricService.CreateAsync(fabricDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] FabricDto fabricDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _FabricService.UpdateAsync(id, fabricDto);

            if (!updated)
            {
                return NotFound($"Fabric with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _FabricService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Fabric with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
