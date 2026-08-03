using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ProductCategory;
using backend.Service.ProductCategory;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.ProductCategory
{
    [ApiController]
    [Route("api/product-category")]
    public class ProductCategoryController : ControllerBase
    {
        private readonly IProductCategoryService _service;

        public ProductCategoryController(IProductCategoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<ProductCategoryDto>>> GetAll() =>
            Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductCategoryDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            return item == null ? NotFound($"ProductCategory with ID {id} not found.") : Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<ProductCategoryCreateDto>> Create([FromBody] ProductCategoryCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ProductCategoryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var updated = await _service.UpdateAsync(id, dto);
            return updated ? NoContent() : NotFound($"ProductCategory with ID {id} not found.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? NoContent() : NotFound($"ProductCategory with ID {id} not found.");
        }
    }
}
