using System.Text.Json.Serialization;

namespace backend.Model.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum UserStatus
    {
        Active,
        Inactive,
        Blacklisted 
    }
}
