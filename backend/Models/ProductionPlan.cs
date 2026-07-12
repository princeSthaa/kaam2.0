namespace backend.Models;

public class ProductionPlan : BaseEntity
{
    public string PlanId { get; set; } = string.Empty;
    public string BatchId { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string DemandType { get; set; } = "Customer Order";
    public Guid? SourceId { get; set; } // Reference to Order.Id
    public string SourceName { get; set; } = string.Empty;
    public string Priority { get; set; } = "High";
    public string Status { get; set; } = "Draft"; // Draft, Active, Completed
    
    public string PlannedStartDate { get; set; } = string.Empty;
    public string PlannedCompletionDate { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal EstimatedCost { get; set; }
    
    public string Supervisor { get; set; } = string.Empty;
    public string ProductionLine { get; set; } = string.Empty;
    public string MaterialWarehouse { get; set; } = string.Empty;
    public string ProductionNotes { get; set; } = string.Empty;
    
    public List<ProductionProduct> Products { get; set; } = new();
    public List<ProductionStage> Stages { get; set; } = new();
}

public class ProductionProduct
{
    public string LineId { get; set; } = string.Empty;
    public string OrderNo { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Variant { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string RequiredDate { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft";
    public string? ProductImage { get; set; }
    public List<ProductionProductSize> Sizes { get; set; } = new();
}

public class ProductionProductSize
{
    public string Size { get; set; } = string.Empty;
    public int Quantity { get; set; }
}

public class ProductionStage
{
    public string StageId { get; set; } = string.Empty;
    public string StageName { get; set; } = string.Empty;
    public string WorkCenter { get; set; } = string.Empty; // Store name or ID
    public string Operator { get; set; } = string.Empty;
    public string PlannedStartDate { get; set; } = string.Empty;
    public string PlannedEndDate { get; set; } = string.Empty;
    public string Status { get; set; } = "Not Started";
    public int CompletedQty { get; set; }
    public int RejectedQty { get; set; }
    public string ActualStartDate { get; set; } = string.Empty;
    public string ActualEndDate { get; set; } = string.Empty;
    public string Remarks { get; set; } = string.Empty;
}
