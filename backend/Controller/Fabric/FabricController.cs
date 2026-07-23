using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using backend.Dto.Fabric;
using backend.Helpers;
using backend.Model;
using backend.Service.Fabric;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Fabric
{
    [ApiController]
    [Route("api/fabric")]
    public class FabricController : ControllerBase
    {
        private readonly IFabricService _FabricService;

        public FabricController(IFabricService FabricService)
        {
            _FabricService = FabricService;
        }

        #region GetById
        [HttpGet("{id}")] 
        public async Task<ActionResult<FabricDto>> GetById(Guid id)
        {
            var item = await _FabricService.GetByIdAsync(id);

            if (item == null)
            {
                return NotFound($"Fabric with ID {id} not found.");
            }

            ImagePathHelper.ResolveFabricImage(item, Request);
            return Ok(item);
        }
        #endregion

        #region GetAll
        [HttpGet]
        public async Task<ActionResult<List<FabricDto>>> GetAll(
            [FromQuery] Guid? id = null,
            [FromQuery] string? name = null,
            [FromQuery] string? category = null,
            [FromQuery] string? imagePath = null,
            [FromQuery] decimal? unitPrice = null,
            [FromQuery] DateTime? createdAt = null,
            [FromQuery] string? createdBy = null,
            [FromQuery] DateTime? updatedAt = null,
            [FromQuery] string? updatedBy = null
        )
        {
            var items = await _FabricService.GetAllAsync(id, name, category, imagePath, unitPrice, createdAt, createdBy, updatedAt, updatedBy);
            foreach (var item in items)
            {
                ImagePathHelper.ResolveFabricImage(item, Request);
            }

            return Ok(items);
        }
        #endregion

        #region Create
        /// <summary>
        /// Always creates a NEW Fabric record with optional picture upload (multipart/form-data)
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<FabricDto>> Create([FromForm] FabricCreateDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string relativeImagePath = string.Empty;
            if (createDto.Image != null && createDto.Image.Length > 0)
            {
                relativeImagePath = await SaveFabricImageFileAsync(createDto.Image);
            }

            var fabricDto = new FabricDto
            {
                Id = Guid.NewGuid(),
                Name = createDto.Name,
                Category = createDto.Category ?? string.Empty,
                UnitPrice = createDto.UnitPrice,
                ImagePath = relativeImagePath,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System",
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = "System"
            };

            var created = await _FabricService.CreateAsync(fabricDto);

            if (!created)
            {
                return BadRequest("Failed to create fabric.");
            }

            ImagePathHelper.ResolveFabricImage(fabricDto, Request);
            return CreatedAtAction(nameof(GetById), new { id = fabricDto.Id }, fabricDto);
        }

        /// <summary>
        /// Create fabric via JSON body
        /// </summary>
        [HttpPost("json")]
        public async Task<ActionResult<FabricDto>> CreateJson([FromBody] FabricDto fabricDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _FabricService.CreateAsync(fabricDto);

            if (!created)
            {
                return BadRequest("Failed to create fabric.");
            }

            ImagePathHelper.ResolveFabricImage(fabricDto, Request);
            return CreatedAtAction(nameof(GetById), new { id = fabricDto.Id }, fabricDto);
        }
        #endregion

        #region Update
        /// <summary>
        /// Updates an EXISTING Fabric record (updates fields and optional new picture file)
        /// </summary>
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(Guid id, [FromForm] FabricUpdateDto updateDto)
        {
            var existing = await _FabricService.GetByIdAsync(id);
            if (existing == null)
            {
                return NotFound($"Fabric with ID {id} not found.");
            }

            string relativeImagePath = existing.ImagePath;

            // If user provided a new picture file, save it and update ImagePath
            if (updateDto.Image != null && updateDto.Image.Length > 0)
            {
                relativeImagePath = await SaveFabricImageFileAsync(updateDto.Image);
            }
            else if (!string.IsNullOrWhiteSpace(updateDto.ImagePath))
            {
                relativeImagePath = updateDto.ImagePath;
            }

            existing.Name = string.IsNullOrWhiteSpace(updateDto.Name) ? existing.Name : updateDto.Name;
            existing.Category = updateDto.Category ?? existing.Category;
            existing.UnitPrice = updateDto.UnitPrice;
            existing.ImagePath = relativeImagePath;
            existing.UpdatedAt = DateTime.UtcNow;

            var updated = await _FabricService.UpdateAsync(id, existing);

            if (!updated)
            {
                return NotFound($"Fabric with ID {id} not found.");
            }

            return NoContent();
        }

        /// <summary>
        /// Update fabric via JSON body
        /// </summary>
        [HttpPut("{id}/json")]
        public async Task<IActionResult> UpdateJson(Guid id, [FromBody] FabricDto fabricDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _FabricService.UpdateAsync(id, fabricDto);

            if (!updated)
            {
                return NotFound($"Fabric with ID {id} not found.");
            }

            return NoContent();
        }
        #endregion

        #region DeleteById
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _FabricService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound($"Fabric with ID {id} not found.");
            }

            return NoContent();
        }
        #endregion

        #region saving_fabric_image
        private async Task<string> SaveFabricImageFileAsync(IFormFile imageFile)
        {
            var mediaFolder = Path.Combine(Directory.GetCurrentDirectory(), "Media", "images", "fabrics");
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

            return $"/Media/images/fabrics/{fileName}";
        }
        #endregion
    }
}
