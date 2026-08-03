using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ProductionStage;
using backend.Service.ProductionStage;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.ProductionStage
{
    [ApiController]
    [Route("api/production-stage")]
    public class ProductionStageController : ControllerBase
    {
        private readonly IProductionStageService _service;

        public ProductionStageController(IProductionStageService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<ProductionStageDto>>> GetAll() =>
            Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductionStageDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            return item == null ? NotFound($"ProductionStage with ID {id} not found.") : Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<ProductionStageDto>> Create([FromBody] ProductionStageDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ProductionStageDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var updated = await _service.UpdateAsync(id, dto);
            return updated ? NoContent() : NotFound($"ProductionStage with ID {id} not found.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? NoContent() : NotFound($"ProductionStage with ID {id} not found.");
        }
    }
}
