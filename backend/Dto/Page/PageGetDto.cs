namespace backend.Dto.Page
{
    public class PageGetDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public Guid? ParentPageId { get; set; }
        public string? ParentPageName { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<PageGetDto> ChildPages { get; set; } = new();
    }
}
