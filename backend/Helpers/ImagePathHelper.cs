using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using backend.Dto.Product;
using backend.Dto.Fabric;
using backend.Dto.ProductionPlanProduct;
using backend.Dto.ProductionPlan;
using backend.Dto.Order;
using backend.Model;

namespace backend.Helpers
{
    public static class ImagePathHelper
    {
        /// <summary>
        /// Ensures image path stored in the database is relative (e.g. "/Media/images/products/polo.jpg").
        /// Strips any scheme/origin (http://localhost:5083, etc.) if provided.
        /// </summary>
        public static string ToRelativePath(string? imagePath)
        {
            if (string.IsNullOrWhiteSpace(imagePath))
                return string.Empty;

            var trimmed = imagePath.Trim();

            if (Uri.TryCreate(trimmed, UriKind.Absolute, out var uri))
            {
                return uri.PathAndQuery;
            }

            if (!trimmed.StartsWith("/"))
            {
                trimmed = "/" + trimmed;
            }

            return trimmed;
        }

        /// <summary>
        /// Resolves a relative image path to a full absolute URL for sending to the frontend.
        /// </summary>
        public static string ToFullUrl(string? imagePath, HttpRequest? request = null, string defaultHost = "http://localhost:5083")
        {
            if (string.IsNullOrWhiteSpace(imagePath))
                return string.Empty;

            var trimmed = imagePath.Trim();

            // If it's already an absolute URL starting with http:// or https://
            if (trimmed.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                trimmed.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                return trimmed;
            }

            string baseUrl;
            if (request != null && request.Host.HasValue)
            {
                baseUrl = $"{request.Scheme}://{request.Host}";
            }
            else
            {
                baseUrl = defaultHost.TrimEnd('/');
            }

            if (!trimmed.StartsWith("/"))
            {
                trimmed = "/" + trimmed;
            }

            return $"{baseUrl}{trimmed}";
        }

        public static void ResolveProductImage(ProductDto? dto, HttpRequest? request)
        {
            if (dto != null && !string.IsNullOrWhiteSpace(dto.ImagePath))
            {
                dto.ImagePath = ToFullUrl(dto.ImagePath, request);
            }
        }

        public static void ResolveFabricImage(FabricDto? dto, HttpRequest? request)
        {
            if (dto != null && !string.IsNullOrWhiteSpace(dto.ImagePath))
            {
                dto.ImagePath = ToFullUrl(dto.ImagePath, request);
            }
        }

        public static void ResolveProductionPlanProductImage(ProductionPlanProductDto? dto, HttpRequest? request)
        {
            if (dto != null && !string.IsNullOrWhiteSpace(dto.ProductImage))
            {
                dto.ProductImage = ToFullUrl(dto.ProductImage, request);
            }
        }

        public static void ResolveProductionPlanImages(ProductionPlanDto? dto, HttpRequest? request)
        {
            if (dto?.ProductionPlanProducts != null)
            {
                foreach (var p in dto.ProductionPlanProducts)
                {
                    ResolveProductionPlanProductImage(p, request);
                }
            }
        }

        public static void ResolveProductionPlanModelImages(ProductionPlan? model, HttpRequest? request)
        {
            if (model?.ProductionPlanProducts != null)
            {
                foreach (var p in model.ProductionPlanProducts)
                {
                    if (!string.IsNullOrWhiteSpace(p.ProductImage))
                    {
                        p.ProductImage = ToFullUrl(p.ProductImage, request);
                    }
                }
            }
        }

        public static void ResolveOrderImages(OrderDto? dto, HttpRequest? request)
        {
            if (dto?.OrderItems != null)
            {
                foreach (var item in dto.OrderItems)
                {
                    if (item.Product != null)
                    {
                        ResolveProductImage(item.Product, request);
                    }
                }
            }
        }
    }
}
