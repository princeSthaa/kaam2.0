using Microsoft.AspNetCore.Mvc;
using backend.Dto.ProductIssue;
using backend.Service.ProductIssue;
using backend.Dto.Product;

namespace backend.Controller;

[ApiController]
[Route("api/product-issue")]
public class ProductIssueController : ControllerBase
{
    private readonly IProductIssueService _service;
    public ProductIssueController(IProductIssueService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductIssueGetDto>>> GetAll(
        Guid? id = null,
        Guid? productDemandId = null,
        decimal? quantity = null,
        string? issuedBy = null,
        bool? isReceived = null,
        DateTime? createdAt = null,
        DateTime? updatedAt = null
    ) =>   
        Ok(await _service.GetAllAsync(
            id,
            productDemandId,
            quantity,
            issuedBy,
            isReceived,
            createdAt,
            updatedAt
        ));
    
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductIssueGetDto>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        return item == null ? NotFound($"ProductIssued with ID {id} not found.") : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ProductIssueDto>> Create([FromBody] ProductIssueDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ProductIssueDto dto)
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