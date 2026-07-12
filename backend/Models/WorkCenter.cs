namespace backend.Models;

public class WorkCenter : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Machine, Manual Line, QC Station
    public string Status { get; set; } = "Available"; // Available, Maintenance, Offline
}
