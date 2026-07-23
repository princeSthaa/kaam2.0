using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.MaterialInspection;
using backend.Model;
using backend.Service.MaterialInspection;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.MaterialInspection
{
    [ApiController]
    [Route("api/material-inspection")]
    public class MaterialInspectionController : ControllerBase
    {
        private readonly IMaterialInspectionService _MaterialInspectionService;

        public MaterialInspectionController(IMaterialInspectionService MaterialInspectionService)
        {
            _MaterialInspectionService = MaterialInspectionService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<MaterialInspectionDto>> GetById(Guid id)
        {
            var item = await _MaterialInspectionService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"MaterialInspection with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<MaterialInspectionDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? materialId = null,
            [FromQuery] string? materialName = null,
            [FromQuery] string? supplierName = null,
            [FromQuery] decimal? receivedQuantity = null,
            [FromQuery] string? inspectionStatus = null,
            [FromQuery] string? notes = null,
            [FromQuery] string? inspectorName = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _MaterialInspectionService.GetAllAsync(
                id,
                materialId,
                materialName,
                supplierName,
                receivedQuantity,
                inspectionStatus,
                notes,
                inspectorName,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MaterialInspectionDto materialInspectionDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _MaterialInspectionService.CreateAsync(materialInspectionDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] MaterialInspectionDto materialInspectionDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _MaterialInspectionService.UpdateAsync(id, materialInspectionDto);

            if (!updated)
            {
                return NotFound($"MaterialInspection with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _MaterialInspectionService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"MaterialInspection with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
