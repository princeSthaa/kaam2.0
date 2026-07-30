

namespace backend.Model;
public class SupplierMaterialCategory
{
    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;

    public Guid MaterialCategoryId { get; set; }
    public MaterialCategory MaterialCategory { get; set; } = null!;
}