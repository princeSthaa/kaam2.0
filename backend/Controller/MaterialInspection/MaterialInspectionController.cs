using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.MaterialInspection;
using backend.Service.MaterialInspection;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.MaterialInspection
{
    [ApiController]
    [Route("api/material-inspection")]
    public class MaterialInspectionController : ControllerBase
    {
        private readonly IMaterialInspectionService _materialInspectionService;

        public MaterialInspectionController(IMaterialInspectionService materialInspectionService)
        {
            _materialInspectionService = materialInspectionService;
        }

        [HttpGet]
        public async Task<ActionResult<List<MaterialInspectionDto>>> GetAll(
            [FromQuery] Guid? materialRequestId = null,
            [FromQuery] string? inspectionStatus = null
        )
        {
            var items = await _materialInspectionService.GetAllAsync(
                materialRequestId,
                inspectionStatus
            );

            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MaterialInspectionDto>> GetById(Guid id)
        {
            var item = await _materialInspectionService.GetByIdAsync(id);
            if (item == null)
            {
                return NotFound($"MaterialInspection with ID {id} not found.");
            }
            return Ok(item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInspection(Guid id, [FromBody] UpdateMaterialInspectionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _materialInspectionService.UpdateInspectionAsync(id, dto);
            if (!updated)
            {
                return NotFound($"MaterialInspection with ID {id} not found.");
            }

            var updatedDto = await _materialInspectionService.GetByIdAsync(id);
            return Ok(updatedDto);
        }

        [HttpPatch("items/{itemId}")]
        public async Task<IActionResult> UpdateInspectionItem(Guid itemId, [FromBody] UpdateMaterialInspectionItemDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _materialInspectionService.UpdateInspectionItemAsync(itemId, dto);
            if (!updated)
            {
                return NotFound($"MaterialInspectionItem with ID {itemId} not found.");
            }

            return Ok(new { message = "MaterialInspectionItem updated successfully.", itemId });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _materialInspectionService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"MaterialInspection with ID {id} not found.");
            }

            return NoContent();
        }
    }
}
