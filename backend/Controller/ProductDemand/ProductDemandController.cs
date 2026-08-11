
using Microsoft.AspNetCore.Mvc;
using backend.Service.ProductDemand;
using backend.Dto.ProductDemand;

namespace backend.Controller;

[ApiController]
[Route("api/product-demand")]
public class ProductDemandController : ControllerBase
{
    private readonly IProductDemandService _service;    
    public ProductDemandController( IProductDemandService service)
    {
        _service =  service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductDemandGetDto>>> GetAll(
        [FromQuery] Guid? id = null,
        [FromQuery] string? requestId = null,
        [FromQuery] decimal? quantity = null,
        [FromQuery] string? approvedBy = null,
        [FromQuery] bool? isIssued = null,
        [FromQuery] DateTime? createdAt = null,
        [FromQuery] DateTime? updatedAt = null
    ) =>   
        Ok(await _service.GetAllAsync(
            id,
            requestId,
            quantity,
            approvedBy,
            isIssued,
            createdAt,
            updatedAt
        ));
    
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDemandGetDto>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        return item == null ? NotFound($"ProductDemand with ID {id} not found.") : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDemandDto>> Create([FromBody] ProductDemandDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ProductDemandDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var updated = await _service.UpdateAsync(id, dto);
        return updated ? NoContent() : NotFound($"ProductDemand with ID {id} not found.");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound($"ProductDemand with ID {id} not found.");
    }

}
