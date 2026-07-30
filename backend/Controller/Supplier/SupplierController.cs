using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Supplier;
using backend.Model.Enums;
using backend.Service.Supplier;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Supplier
{
    [ApiController]
    [Route("api/supplier")]
    public class SupplierController : ControllerBase
    {
        private readonly ISupplierService _supplierService;

        public SupplierController(ISupplierService supplierService)
        {
            _supplierService = supplierService;
        }

        [HttpGet]
        public async Task<ActionResult<List<SupplierDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? supplierCode = null,
            [FromQuery] string? name = null,
            [FromQuery] UserStatus? status = null,
            [FromQuery] bool includeDeleted = false
        )
        {
            var suppliers = await _supplierService.GetAllAsync(id, supplierCode, name, status, includeDeleted);
            return Ok(suppliers);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<SupplierDto>> GetById(Guid id)
        {
            var supplier = await _supplierService.GetByIdAsync(id);
            if (supplier == null)
            {
                return NotFound($"Supplier with ID {id} not found.");
            }
            return Ok(supplier);
        }

        [HttpPost]
        public async Task<ActionResult<SupplierDto>> Create([FromBody] SupplierCreateDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _supplierService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] SupplierUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await _supplierService.UpdateAsync(id, updateDto);
                if (!updated)
                {
                    return NotFound($"Supplier with ID {id} not found.");
                }

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _supplierService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound($"Supplier with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpPost("{id:guid}/recalculate-metrics")]
        public async Task<ActionResult<SupplierDto>> RecalculateMetrics(Guid id)
        {
            var updated = await _supplierService.RecalculateMetricsAsync(id);
            if (updated == null)
            {
                return NotFound($"Supplier with ID {id} not found.");
            }

            return Ok(updated);
        }
    }
}
