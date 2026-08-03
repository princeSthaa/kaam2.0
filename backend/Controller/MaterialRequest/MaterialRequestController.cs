using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.MaterialRequest;
using backend.Service.MaterialRequest;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.MaterialRequest
{
    [ApiController]
    [Route("api/material-request")]
    public class MaterialRequestController : ControllerBase
    {
        private readonly IMaterialRequestService _materialRequestService;

        public MaterialRequestController(IMaterialRequestService materialRequestService)
        {
            _materialRequestService = materialRequestService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MaterialRequestDto>> GetById(Guid id)
        {
            var item = await _materialRequestService.GetByIdAsync(id);
            if (item == null)
            {
                return NotFound($"MaterialRequest with ID {id} not found.");
            }
            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<MaterialRequestDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] Guid? supplierId = null,
            [FromQuery] string? status = null,
            [FromQuery] string? requestNumber = null
        )
        {
            var items = await _materialRequestService.GetAllAsync(
                id,
                supplierId,
                status,
                requestNumber
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMaterialRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var createdDto = await _materialRequestService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = createdDto.Id }, createdDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateMaterialRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await _materialRequestService.UpdateAsync(id, dto);

                if (!updated)
                {
                    return NotFound($"MaterialRequest with ID {id} not found.");
                }

                var updatedDto = await _materialRequestService.GetByIdAsync(id);
                return Ok(updatedDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto dto)
        {
            var updated = await _materialRequestService.UpdateStatusAsync(id, dto.Status);
            if (!updated)
            {
                return NotFound($"MaterialRequest with ID {id} not found.");
            }

            var updatedDto = await _materialRequestService.GetByIdAsync(id);
            return Ok(updatedDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _materialRequestService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"MaterialRequest with ID {id} not found.");
            }

            return NoContent();
        }
    }
}
