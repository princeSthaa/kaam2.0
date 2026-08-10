using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.Service.Wms;
using backend.Dto.Wms;

namespace backend.Controller.Wms
{
    [ApiController]
    [Route("api/[controller]")]
    public class WmsInventoryController : ControllerBase
    {
        private readonly IWmsInventoryService _wmsInventoryService;

        public WmsInventoryController(IWmsInventoryService wmsInventoryService)
        {
            _wmsInventoryService = wmsInventoryService;
        }

        [HttpPost("putaway/{stagingInventoryId}")]
        public async Task<IActionResult> PutAwayInventory(Guid stagingInventoryId, [FromBody] PutAwayDto dto)
        {
            try
            {
                // Note: Get current user instead of hardcoding, but standard auth context applies
                var handledBy = "System"; // TODO: get from claim
                await _wmsInventoryService.PutAwayInventoryAsync(stagingInventoryId, dto.TargetWarehouseShelfId, dto.Quantity, handledBy);
                return Ok(new { message = "Put-away successful." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", detail = ex.Message });
            }
        }

        [HttpPost("transfer/{sourceInventoryId}")]
        public async Task<IActionResult> TransferInventory(Guid sourceInventoryId, [FromBody] TransferDto dto)
        {
            try
            {
                var handledBy = "System"; // TODO: get from claim
                await _wmsInventoryService.TransferInventoryAsync(sourceInventoryId, dto.TargetWarehouseShelfId, dto.Quantity, handledBy);
                return Ok(new { message = "Transfer successful." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", detail = ex.Message });
            }
        }
    }
}
