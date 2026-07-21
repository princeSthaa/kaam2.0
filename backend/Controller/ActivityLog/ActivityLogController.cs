using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ActivityLog;
using backend.Model;
using backend.Service.ActivityLog;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.ActivityLog
{
    [ApiController]
    [Route("api/activity-log")]
    public class ActivityLogController : ControllerBase
    {
        private readonly IActivityLogService _ActivityLogService;

        public ActivityLogController(IActivityLogService ActivityLogService)
        {
            _ActivityLogService = ActivityLogService;
        }

        // <crudgen:actions>
        [HttpGet]
        public async Task<ActionResult<List<ActivityLogDto>>> GetAll(
            [FromQuery] string? id = null,
            [FromQuery] string? title = null,
            [FromQuery] string? text = null,
            [FromQuery] DateTime? timestamp = null,
            [FromQuery] string? entityId = null,
            [FromQuery] string? entityType = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _ActivityLogService.GetAllAsync(
                id,
                title,
                text,
                timestamp,
                entityId,
                entityType,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ActivityLogDto activityLogDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _ActivityLogService.CreateAsync(activityLogDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ActivityLogDto activityLogDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _ActivityLogService.UpdateAsync(id, activityLogDto);

            if (!updated)
            {
                return NotFound($"ActivityLog with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _ActivityLogService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"ActivityLog with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
