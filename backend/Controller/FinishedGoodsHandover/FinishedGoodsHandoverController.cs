using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.FinishedGoodsHandover;
using backend.Model;
using backend.Service.FinishedGoodsHandover;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.FinishedGoodsHandover
{
    [ApiController]
    [Route("api/finished-goods-handover")]
    public class FinishedGoodsHandoverController : ControllerBase
    {
        private readonly IFinishedGoodsHandoverService _FinishedGoodsHandoverService;

        public FinishedGoodsHandoverController(IFinishedGoodsHandoverService FinishedGoodsHandoverService)
        {
            _FinishedGoodsHandoverService = FinishedGoodsHandoverService;
        }

        // <crudgen:actions>
        [HttpGet("{id}")] 
        public async Task<ActionResult<FinishedGoodsHandoverDto>> GetById(Guid id)
        {
            var item = await _FinishedGoodsHandoverService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"FinishedGoodsHandover with ID {id} not found.");
            }

            return Ok(item);
        }

        [HttpGet]
        public async Task<ActionResult<List<FinishedGoodsHandoverDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? productId = null,
            [FromQuery] string? productName = null,
            [FromQuery] string? sKU = null,
            [FromQuery] int? quantity = null,
            [FromQuery] string? sourceFactoryLine = null,
            [FromQuery] string? location = null,
            [FromQuery] string? acceptedBy = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _FinishedGoodsHandoverService.GetAllAsync(
                id,
                productId,
                productName,
                sKU,
                quantity,
                sourceFactoryLine,
                location,
                acceptedBy,
                status,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FinishedGoodsHandoverDto finishedGoodsHandoverDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _FinishedGoodsHandoverService.CreateAsync(finishedGoodsHandoverDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] FinishedGoodsHandoverDto finishedGoodsHandoverDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _FinishedGoodsHandoverService.UpdateAsync(id, finishedGoodsHandoverDto);

            if (!updated)
            {
                return NotFound($"FinishedGoodsHandover with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _FinishedGoodsHandoverService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"FinishedGoodsHandover with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
