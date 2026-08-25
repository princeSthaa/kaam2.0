using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Page;

namespace backend.Service.Page
{
    public class PageService : IPageService
    {
        private readonly AppDbContext _context;

        public PageService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateAsync(PageDto dto)
        {
            dto.Id = Guid.NewGuid();
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertPage
                    @Id = {dto.Id},
                    @Name = {dto.Name},
                    @Route = {dto.Route},
                    @Icon = {dto.Icon},
                    @ParentPageId = {dto.ParentPageId},
                    @DisplayOrder = {dto.DisplayOrder},
                    @IsActive = {dto.IsActive},
                    @CreatedAt = {now},
                    @UpdatedAt = {now}
            ");

            return true;
        }

        public async Task<List<PageGetDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? route = null,
            Guid? parentPageId = null,
            bool? isActive = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        )
        {
            var pages = await _context.Database
                .SqlQuery<PageGetDto>($@"
                    EXEC sp_GetPages
                        @Id = {id},
                        @Name = {name},
                        @Route = {route},
                        @ParentPageId = {parentPageId},
                        @IsActive = {isActive},
                        @CreatedAt = {createdAt},
                        @UpdatedAt = {updatedAt}
                ")
                .ToListAsync();

            // Structure hierarchical child pages if fetching all
            if (id == null)
            {
                var pageMap = pages.ToDictionary(p => p.Id);
                foreach (var page in pages)
                {
                    if (page.ParentPageId.HasValue && pageMap.TryGetValue(page.ParentPageId.Value, out var parent))
                    {
                        parent.ChildPages.Add(page);
                    }
                }
            }

            return pages;
        }

        public async Task<PageGetDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> UpdateAsync(Guid id, PageDto dto)
        {
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdatePage
                    @Id = {id},
                    @Name = {dto.Name},
                    @Route = {dto.Route},
                    @Icon = {dto.Icon},
                    @ParentPageId = {dto.ParentPageId},
                    @DisplayOrder = {dto.DisplayOrder},
                    @IsActive = {dto.IsActive},
                    @UpdatedAt = {now}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeletePage
                    @Id = {id}
            ");

            return true;
        }
    }
}
