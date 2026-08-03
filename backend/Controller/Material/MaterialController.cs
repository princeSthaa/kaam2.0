using backend.Dto.Material;
using backend.Service.Material;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Material
{
    [ApiController]
    [Route("api/material")]
    public class MaterialController : ControllerBase
    {
        private readonly IMaterialService _MaterialService;

        public MaterialController(IMaterialService MaterialService)
        {
            _MaterialService = MaterialService;
        }

        [HttpGet]
        public async Task<ActionResult<List<MaterialGetDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? materialCode = null,
            [FromQuery] string? name = null,
            [FromQuery] decimal? availableQty = null,
            [FromQuery] string? unit = null,
            [FromQuery] string? imagePath = null,
            [FromQuery] decimal? costPerUnit = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] Guid? materialCategoryId = null,
            [FromQuery] Guid? materialTypeId = null,
            [FromQuery] DateTime? updatedAt = null
        )
        {
            var items = await _MaterialService.GetAllAsync(
                id,
                materialCode,
                name,
                materialTypeId,
                materialCategoryId,
                availableQty,
                unit,
                imagePath,
                costPerUnit,
                createdAt,
                updatedAt
            );

            return Ok(items);
        }

        // <crudgen:actions>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MaterialDto materialDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _MaterialService.CreateAsync(materialDto);

            if (!created)
            {
                return BadRequest();
            }

            return Ok();
        }

        /// <summary>
        /// Uploads an image file for a material and saves it in Media/images/materials/{typeName}/{categoryName}/{fileName}
        /// </summary>
        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(
            [FromForm] Microsoft.AspNetCore.Http.IFormFile image,
            [FromForm] string? typeName = "Fabric",
            [FromForm] string? categoryName = "General")
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest("No image file provided.");
            }

            var safeType = string.IsNullOrWhiteSpace(typeName) ? "Fabric" : typeName.Trim();
            var safeCategory = string.IsNullOrWhiteSpace(categoryName) ? "General" : categoryName.Trim();

            var targetFolder = System.IO.Path.Combine(
                System.IO.Directory.GetCurrentDirectory(),
                "Media",
                "images",
                "materials",
                safeType,
                safeCategory
            );

            if (!System.IO.Directory.Exists(targetFolder))
            {
                System.IO.Directory.CreateDirectory(targetFolder);
            }

            var extension = System.IO.Path.GetExtension(image.FileName);
            if (string.IsNullOrEmpty(extension)) extension = ".jpg";

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = System.IO.Path.Combine(targetFolder, fileName);

            using (var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            var relativePath = $"/Media/images/materials/{safeType}/{safeCategory}/{fileName}";
            var fullUrl = $"http://localhost:5083{relativePath}";

            return Ok(new { relativePath, fullUrl });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] MaterialDto materialDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _MaterialService.UpdateAsync(id, materialDto);

            if (!updated)
            {
                return NotFound($"Material with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _MaterialService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Material with ID {id} not found.");
            }

            return NoContent();
        }
        // </crudgen:actions>
    }
}
