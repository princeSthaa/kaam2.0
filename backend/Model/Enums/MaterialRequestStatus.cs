using System.Text.Json.Serialization;

namespace backend.Model.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum MaterialRequestStatus
    {
        Draft,
        Pending,
        Approved,
        Rejected,
        Ordered,
        PartiallyReceived,
        Received,
        Cancelled
    }
}