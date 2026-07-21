using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Outlet;
using backend.Model;
using backend.Service.Outlet;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Outlet
{
    [ApiController]
    [Route("api/outlet")]
    public class OutletController : ControllerBase
    {
        private readonly IOutletService _OutletService;

        public OutletController(IOutletService OutletService)
        {
            _OutletService = OutletService;
        }

        // <crudgen:actions>
        [HttpGet]
        public async Task<ActionResult<List<OutletDto>>> GetAll(
            [FromQuery] string? id = null,
            [FromQuery] string? name = null,
            [FromQuery] string? location = null,
            [FromQuery] string? code = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _OutletService.GetAllAsync(
                id,
                name,
                location,
                code,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OutletDto outletDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _OutletService.CreateAsync(outletDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] OutletDto outletDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _OutletService.UpdateAsync(id, outletDto);

            if (!updated)
            {
                return NotFound($"Outlet with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _OutletService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Outlet with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
