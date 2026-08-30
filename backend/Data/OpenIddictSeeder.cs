using OpenIddict.Abstractions;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace backend.Data;

public class OpenIddictSeeder
{
    public static async Task SeedAsync(IServiceProvider service)
    {
        var applicationManager =
            service.GetRequiredService<IOpenIddictApplicationManager>();

        if (await applicationManager.FindByClientIdAsync("kaam-next.js") == null)
        {
            await applicationManager.CreateAsync(
                new OpenIddictApplicationDescriptor
                {
                    ClientId = "kaam-next.js",
                    DisplayName = "Kaam Next.js",
                    ClientType = ClientTypes.Public,
                    ConsentType = ConsentTypes.Implicit,

                    RedirectUris =
                    {
                        new Uri("https://oauth.pstmn.io/v1/browser-callback")
                    },

                    Permissions =
                    {
                        Permissions.Endpoints.Authorization,
                        Permissions.Endpoints.Token,

                        Permissions.GrantTypes.AuthorizationCode,
                        Permissions.GrantTypes.RefreshToken,

                        Permissions.ResponseTypes.Code,

                        Permissions.Prefixes.Scope + "openid",
                        Permissions.Prefixes.Scope + "profile",
                        Permissions.Prefixes.Scope + "email",
                        Permissions.Prefixes.Scope + "api"
                    }
                });
        }

        if (await applicationManager.FindByClientIdAsync("postman") == null)
        {
            await applicationManager.CreateAsync(
                new OpenIddictApplicationDescriptor
                {
                    ClientId = "postman",
                    DisplayName = "Postman",
                    ClientType = ClientTypes.Public,
                    ConsentType = ConsentTypes.Implicit,

                    RedirectUris =
                    {
                        new Uri("https://oauth.pstmn.io/v1/browser-callback")
                    },

                    Permissions =
                    {
                        Permissions.Endpoints.Authorization,
                        Permissions.Endpoints.Token,

                        Permissions.GrantTypes.AuthorizationCode,
                        Permissions.GrantTypes.RefreshToken,

                        Permissions.ResponseTypes.Code,

                        Permissions.Prefixes.Scope + "openid",
                        Permissions.Prefixes.Scope + "profile",
                        Permissions.Prefixes.Scope + "email",
                        Permissions.Prefixes.Scope + "api"
                    }
                });
        }
    }
}