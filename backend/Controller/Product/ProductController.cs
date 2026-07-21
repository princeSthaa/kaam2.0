using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Product;
using backend.Model;
using backend.Model.Enums;
using backend.Service.Product;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Product
{
    [ApiController]
    [Route("api/product")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _ProductService;

        public ProductController(IProductService ProductService)
        {
            _ProductService = ProductService;
        }

        // <crudgen:actions>
        [HttpGet]
        public async Task<ActionResult<List<ProductDto>>> GetAll(
            [FromQuery] string? id = null,
            [FromQuery] string? name = null,
            [FromQuery] string? imagePath = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _ProductService.GetAllAsync(
                id,
                name,
                imagePath,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy
            );

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductDto productDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _ProductService.CreateAsync(productDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ProductDto productDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _ProductService.UpdateAsync(id, productDto);

            if (!updated)
            {
                return NotFound($"Product with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _ProductService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Product with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
