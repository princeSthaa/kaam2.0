using backend.Data;
using System;
using System.Linq;

namespace backend.scratch
{
    public class CheckCat
    {
        public static void Run(AppDbContext context)
        {
            var cats = context.MaterialCategories.Take(2).ToList();
            foreach (var c in cats)
            {
                Console.WriteLine($"CAT: {c.Id} - {c.Name}");
            }
        }
    }
}
