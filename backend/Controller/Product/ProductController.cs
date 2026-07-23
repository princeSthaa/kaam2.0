using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using backend.Dto.Product;
using backend.Helpers;
using backend.Model;
using backend.Model.Enums;
using backend.Service.Product;
using Microsoft.AspNetCore.Http;
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

        #region GetById
        [HttpGet("{id}")] 
        public async Task<ActionResult<ProductDto>> GetById(Guid id)
        {
            var item = await _ProductService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"Product with ID {id} not found.");
            }

            ImagePathHelper.ResolveProductImage(item, Request);
            return Ok(item);
        }
        #endregion

        #region GetAll
        [HttpGet]
        public async Task<ActionResult<List<ProductDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? name = null,
            [FromQuery] string? imagePath = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _ProductService.GetAllAsync(id, name, imagePath, createdAt, createdBy, updatedAt, updatedBy);
            foreach (var item in items)
            {
                ImagePathHelper.ResolveProductImage(item, Request);
            }

            return Ok(items);
        }
        #endregion

        #region Create
        /// <summary>
        /// Always creates a NEW Product record with optional picture upload (multipart/form-data)
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ProductDto>> Create([FromForm] ProductCreateDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string relativeImagePath = string.Empty;
            if (createDto.Image != null && createDto.Image.Length > 0)
            {
                relativeImagePath = await SaveProductImageFileAsync(createDto.Image);
            }

            var parsedSizes = ProductSizeParser.ParseSizes(createDto.Sizes);

            var productDto = new ProductDto
            {
                Id = Guid.NewGuid(),
                Name = createDto.Name,
                ImagePath = relativeImagePath,
                Sizes = parsedSizes,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System",
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = "System"
            };

            var created = await _ProductService.CreateAsync(productDto);

            if (!created)
            {
                return BadRequest("Failed to create product.");
            }

            ImagePathHelper.ResolveProductImage(productDto, Request);
            return CreatedAtAction(nameof(GetById), new { id = productDto.Id }, productDto);
        }

        /// <summary>
        /// Create product via JSON body
        /// </summary>
        [HttpPost("json")]
        public async Task<ActionResult<ProductDto>> CreateJson([FromBody] ProductDto productDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _ProductService.CreateAsync(productDto);

            if (!created)
            {
                return BadRequest("Failed to create product.");
            }

            ImagePathHelper.ResolveProductImage(productDto, Request);
            return CreatedAtAction(nameof(GetById), new { id = productDto.Id }, productDto);
        }
        #endregion

        #region Update
        /// <summary>
        /// Updates an EXISTING Product record (updates fields and optional new picture file)
        /// </summary>
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(Guid id, [FromForm] ProductUpdateDto updateDto)
        {
            var existing = await _ProductService.GetByIdAsync(id);
            if (existing == null)
            {
                return NotFound($"Product with ID {id} not found.");
            }

            string relativeImagePath = existing.ImagePath;

            if (updateDto.Image != null && updateDto.Image.Length > 0)
            {
                relativeImagePath = await SaveProductImageFileAsync(updateDto.Image);
            }
            else if (!string.IsNullOrWhiteSpace(updateDto.ImagePath))
            {
                relativeImagePath = updateDto.ImagePath;
            }

            existing.Name = string.IsNullOrWhiteSpace(updateDto.Name) ? existing.Name : updateDto.Name;
            existing.ImagePath = relativeImagePath;
            if (updateDto.Sizes != null)
            {
                existing.Sizes = ProductSizeParser.ParseSizes(updateDto.Sizes);
            }
            existing.UpdatedAt = DateTime.UtcNow;

            var updated = await _ProductService.UpdateAsync(id, existing);

            if (!updated)
            {
                return NotFound($"Product with ID {id} not found.");
            }

            return NoContent();
        }

        /// <summary>
        /// Update product via JSON body
        /// </summary>
        [HttpPut("{id}/json")]
        public async Task<IActionResult> UpdateJson(Guid id, [FromBody] ProductDto productDto)
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
        #endregion

        #region DeleteById
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _ProductService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Product with ID {id} not found.");
            }

            return NoContent();
        }
        #endregion

        #region saving_product_image
        private async Task<string> SaveProductImageFileAsync(IFormFile imageFile)
        {
            var mediaFolder = Path.Combine(Directory.GetCurrentDirectory(), "Media", "images", "products");
            if (!Directory.Exists(mediaFolder))
            {
                Directory.CreateDirectory(mediaFolder);
            }

            var extension = Path.GetExtension(imageFile.FileName);
            if (string.IsNullOrEmpty(extension)) extension = ".jpg";

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(mediaFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            return $"/Media/images/products/{fileName}";
        }
        #endregion
    }
}
