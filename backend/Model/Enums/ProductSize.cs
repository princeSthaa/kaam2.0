using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Model.Enums
{
    [JsonConverter(typeof(ProductSizeJsonConverter))]
    [TypeConverter(typeof(ProductSizeTypeConverter))]
    public enum ProductSize
    {
        XS,
        S,
        M,
        L,
        XL,
        XXL
    }

    public static class ProductSizeParser
    {
        public static List<ProductSize> ParseSizes(string? input)
        {
            var list = new List<ProductSize>();
            if (string.IsNullOrWhiteSpace(input))
                return list;

            var tokens = input.Split(new[] { ',', '[', ']', '"', '\'', ' ', '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            foreach (var token in tokens)
            {
                if (Enum.TryParse<ProductSize>(token, ignoreCase: true, out var result))
                {
                    if (!list.Contains(result))
                    {
                        list.Add(result);
                    }
                }
            }

            return list;
        }

        public static ProductSize ParseSingleSize(string str)
        {
            if (!string.IsNullOrWhiteSpace(str))
            {
                var clean = str.Trim('[', ']', '"', '\'', ' ');
                if (Enum.TryParse<ProductSize>(clean, true, out var result))
                {
                    return result;
                }
            }
            return ProductSize.S;
        }
    }

    public class ProductSizeTypeConverter : TypeConverter
    {
        public override bool CanConvertFrom(ITypeDescriptorContext? context, Type sourceType)
        {
            if (sourceType == typeof(string)) return true;
            return base.CanConvertFrom(context, sourceType);
        }

        public override object? ConvertFrom(ITypeDescriptorContext? context, CultureInfo? culture, object value)
        {
            if (value is string str && !string.IsNullOrWhiteSpace(str))
            {
                var clean = str.Trim('[', ']', '"', '\'', ' ');
                if (Enum.TryParse<ProductSize>(clean, ignoreCase: true, out var result))
                {
                    return result;
                }
            }
            return ProductSize.S;
        }
    }

    public class ProductSizeJsonConverter : JsonConverter<ProductSize>
    {
        public override ProductSize Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.String)
            {
                var stringValue = reader.GetString();
                if (!string.IsNullOrWhiteSpace(stringValue))
                {
                    var clean = stringValue.Trim('[', ']', '"', '\'', ' ');
                    if (Enum.TryParse<ProductSize>(clean, ignoreCase: true, out var result))
                    {
                        return result;
                    }
                }
            }
            else if (reader.TokenType == JsonTokenType.Number)
            {
                var intValue = reader.GetInt32();
                if (Enum.IsDefined(typeof(ProductSize), intValue))
                {
                    return (ProductSize)intValue;
                }
            }

            return ProductSize.S;
        }

        public override void Write(Utf8JsonWriter writer, ProductSize value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString());
        }
    }
}
