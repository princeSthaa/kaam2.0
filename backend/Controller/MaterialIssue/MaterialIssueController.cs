using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.MaterialIssue;
using backend.Model;
using backend.Service.MaterialIssue;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.MaterialIssue
{
    [ApiController]
    [Route("api/material-issue")]
    public class MaterialIssueController : ControllerBase
    {
        private readonly IMaterialIssueService _MaterialIssueService;

        public MaterialIssueController(IMaterialIssueService MaterialIssueService)
        {
            _MaterialIssueService = MaterialIssueService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<MaterialIssueDto>> GetById(Guid id)
        {
            var item = await _MaterialIssueService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"MaterialIssue with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<MaterialIssueDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? materialId = null,
            [FromQuery] decimal? issueQuantity = null,
            [FromQuery] string? targetDestination = null,
            [FromQuery] string? issuedTo = null,
            [FromQuery] string? notes = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _MaterialIssueService.GetAllAsync(
                id,
                materialId,
                issueQuantity,
                targetDestination,
                issuedTo,
                notes,
                status,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MaterialIssueDto materialIssueDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _MaterialIssueService.CreateAsync(materialIssueDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] MaterialIssueDto materialIssueDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _MaterialIssueService.UpdateAsync(id, materialIssueDto);

            if (!updated)
            {
                return NotFound($"MaterialIssue with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _MaterialIssueService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"MaterialIssue with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
