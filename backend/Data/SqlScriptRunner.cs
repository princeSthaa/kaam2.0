using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace backend.Data;

public static class SqlScriptRunner
{
    public static void Run(AppDbContext context)
    {
        var sqlDir = Path.Combine(
            Directory.GetCurrentDirectory(),
            "Sql");

        if (!Directory.Exists(sqlDir))
            return;

        var files = Directory
            .GetFiles(sqlDir, "*.sql", SearchOption.AllDirectories)
            .OrderBy(f => f);

        foreach (var file in files)
        {
            Console.WriteLine($"Executing {Path.GetFileName(file)}");

            var sql = File.ReadAllText(file);

           var batches = Regex.Split( sql, @"^\s*GO\s*$", RegexOptions.Multiline | RegexOptions.IgnoreCase);

            foreach (var batch in batches)
            {
                if (!string.IsNullOrWhiteSpace(batch))
                {
                    context.Database.ExecuteSqlRaw(batch);
                }
            }
        }
    }
}