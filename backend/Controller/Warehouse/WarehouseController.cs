using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Warehouse;
using backend.Model;
using backend.Service.Warehouse;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Warehouse
{
    [ApiController]
    [Route("api/warehouse")]
    public class WarehouseController : ControllerBase
    {
        private readonly IWarehouseService _WarehouseService;

        public WarehouseController(IWarehouseService WarehouseService)
        {
            _WarehouseService = WarehouseService;
        }

        // <crudgen:actions>
        [HttpGet]
        public async Task<ActionResult<List<WarehouseDto>>> GetAll(
            [FromQuery] string? id = null,
            [FromQuery] string? code = null,
            [FromQuery] string? name = null,
            [FromQuery] string? location = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _WarehouseService.GetAllAsync(
                id,
                code,
                name,
                location,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] WarehouseDto warehouseDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _WarehouseService.CreateAsync(warehouseDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] WarehouseDto warehouseDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _WarehouseService.UpdateAsync(id, warehouseDto);

            if (!updated)
            {
                return NotFound($"Warehouse with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _WarehouseService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Warehouse with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpPost("receive-inspect")]
        public async Task<IActionResult> ReceiveInspect([FromBody] SupplierInspectionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (success, message) = await _WarehouseService.ProcessSupplierInspectionAsync(dto);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(new { message });
        }

        [HttpPost("accept-finished-goods")]
        public async Task<IActionResult> AcceptFinishedGoods([FromBody] FinishedGoodsAcceptanceDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (success, message) = await _WarehouseService.AcceptFinishedGoodsAsync(dto);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(new { message });
        }

        [HttpPost("initiate-sale")]
        public async Task<IActionResult> InitiateSale([FromBody] ProductSaleDispatchDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (success, message) = await _WarehouseService.InitiateProductSaleAsync(dto);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(new { message });
        }

        [HttpPost("customer-return")]
        public async Task<IActionResult> CustomerReturn([FromBody] CustomerReturnDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (success, message) = await _WarehouseService.ProcessCustomerReturnAsync(dto);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(new { message });
        }

        [HttpGet("kpis")]
        public async Task<IActionResult> GetKpis()
        {
            var data = await _WarehouseService.GetKpisAsync();
            return Ok(data);
        }

        [HttpGet("shelves/preview")]
        public async Task<IActionResult> GetShelvesPreview()
        {
            var data = await _WarehouseService.GetShelvesPreviewAsync();
            return Ok(data);
        }

        [HttpGet("stock")]
        public async Task<IActionResult> GetStock()
        {
            var data = await _WarehouseService.GetStockAsync();
            return Ok(data);
        }

        [HttpGet("visualization")]
        public async Task<IActionResult> GetVisualization()
        {
            var data = await _WarehouseService.GetVisualizationDataAsync();
            return Ok(data);
        }
        // </crudgen:actions>
    }
}
