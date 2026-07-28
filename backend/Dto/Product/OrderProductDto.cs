namespace backend.Dto.OrderItem
{
    public class OrderProductGetDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ImagePath { get; set; } = string.Empty;
    }
}
