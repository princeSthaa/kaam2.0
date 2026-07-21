using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.OutletDemand;
using backend.Model;
using backend.Service.OutletDemand;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.OutletDemand
{
    [ApiController]
    [Route("api/outlet-demand")]
    public class OutletDemandController : ControllerBase
    {
        private readonly IOutletDemandService _OutletDemandService;

        public OutletDemandController(IOutletDemandService OutletDemandService)
        {
            _OutletDemandService = OutletDemandService;
        }

        // <crudgen:actions>
        [HttpGet]
        public async Task<ActionResult<List<OutletDemandDto>>> GetAll(
            [FromQuery] string? id = null,
            [FromQuery] string? demandNumber = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? dueDate = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null,
            [FromQuery] string? outletId = null
        )
        {
            var items = await _OutletDemandService.GetAllAsync(
                id,
                demandNumber,
                status,
                dueDate,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy,
                outletId
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OutletDemandDto outletDemandDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _OutletDemandService.CreateAsync(outletDemandDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] OutletDemandDto outletDemandDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _OutletDemandService.UpdateAsync(id, outletDemandDto);

            if (!updated)
            {
                return NotFound($"OutletDemand with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _OutletDemandService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"OutletDemand with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}

