using System.Text.Json.Serialization;

namespace backend.Model.Enums;
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ReceiptStatus
{
    PendingInspection,
    Inspecting,
    Accepted,
    PartiallyAccepted,
    Rejected
}