using System.Text.Json.Serialization;


namespace backend.Model.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum InspectionStatus
    {
        Pending,
        Accepted,
        Rejected,
        PartiallyAccepted,
        Completed
    }
}