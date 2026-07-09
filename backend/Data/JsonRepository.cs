using System.Text.Json;
using backend.Models;

namespace backend.Data;

public class JsonRepository<T> where T : BaseEntity
{
    private readonly string _filePath;
    private List<T> _data;
    private readonly object _lock = new();

    public JsonRepository(string fileName)
    {
        var dataFolder = Path.Combine(Directory.GetCurrentDirectory(), "Data", "Store");
        if (!Directory.Exists(dataFolder))
        {
            Directory.CreateDirectory(dataFolder);
        }
        _filePath = Path.Combine(dataFolder, fileName);
        
        LoadData();
    }

    private void LoadData()
    {
        if (File.Exists(_filePath))
        {
            var json = File.ReadAllText(_filePath);
            _data = JsonSerializer.Deserialize<List<T>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<T>();
        }
        else
        {
            _data = new List<T>();
            SaveData();
        }
    }

    private void SaveData()
    {
        lock (_lock)
        {
            var json = JsonSerializer.Serialize(_data, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_filePath, json);
        }
    }

    public IEnumerable<T> GetAll()
    {
        lock (_lock)
        {
            return _data.ToList(); // Return a copy for thread safety
        }
    }

    public T? GetById(Guid id)
    {
        lock (_lock)
        {
            return _data.FirstOrDefault(x => x.Id == id);
        }
    }

    public T Add(T entity)
    {
        if (entity.Id == Guid.Empty)
        {
            entity.Id = Guid.NewGuid();
        }
        entity.CreatedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        lock (_lock)
        {
            _data.Add(entity);
            SaveData();
        }
        return entity;
    }

    public T? Update(T entity)
    {
        lock (_lock)
        {
            var index = _data.FindIndex(x => x.Id == entity.Id);
            if (index != -1)
            {
                // Preserve CreatedAt from the existing record if not provided correctly
                var existing = _data[index];
                entity.CreatedAt = existing.CreatedAt;
                entity.UpdatedAt = DateTime.UtcNow;
                _data[index] = entity;
                SaveData();
                return entity;
            }
            return null;
        }
    }

    public bool Delete(Guid id)
    {
        lock (_lock)
        {
            var item = _data.FirstOrDefault(x => x.Id == id);
            if (item != null)
            {
                _data.Remove(item);
                SaveData();
                return true;
            }
            return false;
        }
    }
}
