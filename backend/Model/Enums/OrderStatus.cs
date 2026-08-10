using System.Text.Json.Serialization;

namespace backend.Model.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum OrderStatus
    {
        Pending,
        Processing,
        PartiallyDelivered,
        Delivered,
        Completed,
        Cancelled
    }
}
