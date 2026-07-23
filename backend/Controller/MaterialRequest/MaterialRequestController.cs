using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.MaterialRequest;
using backend.Model;
using backend.Service.MaterialRequest;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.MaterialRequest
{
    [ApiController]
    [Route("api/material-request")]
    public class MaterialRequestController : ControllerBase
    {
        private readonly IMaterialRequestService _MaterialRequestService;

        public MaterialRequestController(IMaterialRequestService MaterialRequestService)
        {
            _MaterialRequestService = MaterialRequestService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<MaterialRequestDto>> GetById(Guid id)
        {
            var item = await _MaterialRequestService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"MaterialRequest with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<MaterialRequestDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? materialId = null,
            [FromQuery] string? materialName = null,
            [FromQuery] decimal? requestedQuantity = null,
            [FromQuery] string? supplierName = null,
            [FromQuery] string? urgency = null,
            [FromQuery] DateTime? requiredDate = null,
            [FromQuery] string? notes = null,
            [FromQuery] string? requestedBy = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _MaterialRequestService.GetAllAsync(
                id,
                materialId,
                materialName,
                requestedQuantity,
                supplierName,
                urgency,
                requiredDate,
                notes,
                requestedBy,
                status,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MaterialRequestDto materialRequestDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _MaterialRequestService.CreateAsync(materialRequestDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] MaterialRequestDto materialRequestDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _MaterialRequestService.UpdateAsync(id, materialRequestDto);

            if (!updated)
            {
                return NotFound($"MaterialRequest with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _MaterialRequestService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"MaterialRequest with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
