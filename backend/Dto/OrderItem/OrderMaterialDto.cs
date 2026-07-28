namespace backend.Dto.OrderItem
{
    public class OrderMaterialGetDto
    {
        public Guid Id { get; set; }
        
        public string Name { get; set; } = string.Empty;
        
        public string ImagePath { get; set; } = string.Empty;
        
        public string Unit { get; set; } = string.Empty;
        
        public string? MaterialCategoryName { get; set; } = string.Empty;
    }
}
