using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Material;
using backend.Model;
using backend.Service.Material;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Material
{
    [ApiController]
    [Route("api/material")]
    public class MaterialController : ControllerBase
    {
        private readonly IMaterialService _MaterialService;

        public MaterialController(IMaterialService MaterialService)
        {
            _MaterialService = MaterialService;
        }

        // <crudgen:actions>
        [HttpGet]
        public async Task<ActionResult<List<MaterialDto>>> GetAll(
            [FromQuery] string? id = null,
            [FromQuery] string? materialCode = null,
            [FromQuery] string? name = null,
            [FromQuery] string? type = null,
            [FromQuery] decimal? availableQty = null,
            [FromQuery] string? unit = null,
            [FromQuery] decimal? costPerUnit = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _MaterialService.GetAllAsync(
                id,
                materialCode,
                name,
                type,
                availableQty,
                unit,
                costPerUnit,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MaterialDto materialDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _MaterialService.CreateAsync(materialDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] MaterialDto materialDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _MaterialService.UpdateAsync(id, materialDto);

            if (!updated)
            {
                return NotFound($"Material with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _MaterialService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Material with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpPost("request-supplier")]
        public async Task<IActionResult> RequestSupplier([FromBody] SupplierMaterialRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _MaterialService.RequestSupplierAsync(request);
            if (!success)
            {
                return BadRequest("Failed to submit material request to supplier.");
            }

            return Ok(new { message = "Material request submitted to supplier successfully." });
        }

        [HttpPost("issue-factory")]
        public async Task<IActionResult> IssueToFactory([FromBody] MaterialIssueDto issue)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (success, message, remainingQty) = await _MaterialService.IssueToFactoryAsync(issue);
            if (!success)
            {
                return BadRequest(new { message, remainingQty });
            }

            return Ok(new { message, remainingQty });
        }
        // </crudgen:actions>
    }
}
