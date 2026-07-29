using backend.Dto.Supplier;
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
            [FromQuery] string? name = null,
            [FromQuery] string? status = null
        )
        {
            var suppliers = await _supplierService.GetAllAsync(id, name, status);
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
        public async Task<ActionResult<SupplierDto>> Create([FromBody] SupplierDto supplierDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _supplierService.CreateAsync(supplierDto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] SupplierDto supplierDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _supplierService.UpdateAsync(id, supplierDto);
            if (!updated)
            {
                return NotFound($"Supplier with ID {id} not found.");
            }

            return NoContent();
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
