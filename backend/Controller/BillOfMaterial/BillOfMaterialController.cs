using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.BillOfMaterial;
using backend.Model;
using backend.Service.BillOfMaterial;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.BillOfMaterial
{
    [ApiController]
    [Route("api/bill-of-material")]
    public class BillOfMaterialController : ControllerBase
    {
        private readonly IBillOfMaterialService _BillOfMaterialService;

        public BillOfMaterialController(IBillOfMaterialService BillOfMaterialService)
        {
            _BillOfMaterialService = BillOfMaterialService;
        }

        // <crudgen:actions>
        [HttpGet]
        public async Task<ActionResult<List<BillOfMaterialDto>>> GetAll(
            [FromQuery] string? id = null,
            [FromQuery] decimal? qtyPerUnit = null,
            [FromQuery] decimal? wastagePercent = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _BillOfMaterialService.GetAllAsync(
                id,
                qtyPerUnit,
                wastagePercent,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BillOfMaterialDto billOfMaterialDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _BillOfMaterialService.CreateAsync(billOfMaterialDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] BillOfMaterialDto billOfMaterialDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _BillOfMaterialService.UpdateAsync(id, billOfMaterialDto);

            if (!updated)
            {
                return NotFound($"BillOfMaterial with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _BillOfMaterialService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"BillOfMaterial with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
