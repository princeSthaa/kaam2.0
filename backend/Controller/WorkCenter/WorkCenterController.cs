using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.WorkCenter;
using backend.Model;
using backend.Service.WorkCenter;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.WorkCenter
{
    [ApiController]
    [Route("api/work-center")]
    public class WorkCenterController : ControllerBase
    {
        private readonly IWorkCenterService _WorkCenterService;

        public WorkCenterController(IWorkCenterService WorkCenterService)
        {
            _WorkCenterService = WorkCenterService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<WorkCenterDto>> GetById(Guid id)
        {
            var item = await _WorkCenterService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"WorkCenter with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<WorkCenterDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? name = null,
            [FromQuery] string? type = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _WorkCenterService.GetAllAsync(
                id,
                name,
                type,
                status,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] WorkCenterDto workCenterDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _WorkCenterService.CreateAsync(workCenterDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] WorkCenterDto workCenterDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _WorkCenterService.UpdateAsync(id, workCenterDto);

            if (!updated)
            {
                return NotFound($"WorkCenter with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _WorkCenterService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"WorkCenter with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
