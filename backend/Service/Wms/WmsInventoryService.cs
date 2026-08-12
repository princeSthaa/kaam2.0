using backend.Data;
using backend.Model;
using Microsoft.EntityFrameworkCore;

namespace backend.Service.Wms;

public class WmsInventoryService : IWmsInventoryService
{
    private readonly AppDbContext _context;

    public WmsInventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task PutAwayInventoryAsync(
        Guid stagingInventoryId,
        Guid targetWarehouseShelfId,
        decimal quantity,
        string handledBy)
    {
        if (quantity <= 0)
            throw new InvalidOperationException(
                "Put-away quantity must be greater than zero."
            );

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            var stagingInventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.Id == stagingInventoryId);

            if (stagingInventory == null)
                throw new InvalidOperationException(
                    "Staging inventory record not found."
                );

            if (stagingInventory.WarehouseShelfId != null ||
                stagingInventory.Status != "Staging")
            {
                throw new InvalidOperationException(
                    "Inventory is not in a staging state."
                );
            }

            if (quantity > stagingInventory.Quantity)
                throw new InvalidOperationException(
                    "Cannot put away more than the staged quantity."
                );

            var targetShelf = await _context.WarehouseShelfs
                .Include(s => s.WarehouseRack)
                    .ThenInclude(r => r.WarehouseRoom)
                        .ThenInclude(rm => rm.WarehouseFloor)
                            .ThenInclude(f => f.Warehouse)
                .FirstOrDefaultAsync(s => s.Id == targetWarehouseShelfId);

            if (targetShelf == null)
                throw new InvalidOperationException(
                    "Target warehouse shelf does not exist."
                );

            // Decrease staging inventory
            stagingInventory.Quantity -= quantity;
            stagingInventory.UpdatedAt = DateTime.UtcNow;
            stagingInventory.UpdatedBy = handledBy;

            // Find existing inventory on target shelf
            var targetInventory = await _context.Inventories
                .FirstOrDefaultAsync(i =>
                    i.MaterialId == stagingInventory.MaterialId &&
                    i.WarehouseShelfId == targetWarehouseShelfId);

            if (targetInventory != null)
            {
                targetInventory.Quantity += quantity;
                targetInventory.UpdatedAt = DateTime.UtcNow;
                targetInventory.UpdatedBy = handledBy;
            }
            else
            {
                targetInventory = new backend.Model.Inventory
                {
                    Id = Guid.NewGuid(),
                    MaterialId = stagingInventory.MaterialId,
                    WarehouseShelfId = targetWarehouseShelfId,
                    Quantity = quantity,
                    Status = "Available",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = handledBy,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = handledBy
                };

                _context.Inventories.Add(targetInventory);
            }

            // Movement history
            var movement = new InventoryMovement
            {
                Id = Guid.NewGuid(),
                MovementType = "PutAway",
                MaterialId = stagingInventory.MaterialId!.Value,
                Quantity = quantity,
                FromWarehouseShelfId = null,
                ToWarehouseShelfId = targetWarehouseShelfId,
                Timestamp = DateTime.UtcNow,
                HandledBy = handledBy,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = handledBy,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = handledBy
            };

            _context.InventoryMovements.Add(movement);

            // Remove empty staging record
            if (stagingInventory.Quantity == 0)
            {
                _context.Inventories.Remove(stagingInventory);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task TransferInventoryAsync(
        Guid sourceInventoryId,
        Guid targetWarehouseShelfId,
        decimal quantity,
        string handledBy)
    {
        if (quantity <= 0)
            throw new InvalidOperationException(
                "Transfer quantity must be greater than zero."
            );

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            var sourceInventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.Id == sourceInventoryId);

            if (sourceInventory == null)
                throw new InvalidOperationException(
                    "Source inventory record not found."
                );

            if (sourceInventory.WarehouseShelfId == null)
                throw new InvalidOperationException(
                    "Use PutAway to move items from staging. " +
                    "Transfer is for shelf-to-shelf."
                );

            if (sourceInventory.WarehouseShelfId == targetWarehouseShelfId)
                throw new InvalidOperationException(
                    "Source and target shelves must be different."
                );

            if (quantity > sourceInventory.Quantity)
                throw new InvalidOperationException(
                    "Cannot transfer more than the available quantity."
                );

            var targetShelf = await _context.WarehouseShelfs
                .Include(s => s.WarehouseRack)
                    .ThenInclude(r => r.WarehouseRoom)
                        .ThenInclude(rm => rm.WarehouseFloor)
                            .ThenInclude(f => f.Warehouse)
                .FirstOrDefaultAsync(s => s.Id == targetWarehouseShelfId);

            if (targetShelf == null)
                throw new InvalidOperationException(
                    "Target warehouse shelf does not exist."
                );

            // Decrease source inventory
            sourceInventory.Quantity -= quantity;
            sourceInventory.UpdatedAt = DateTime.UtcNow;
            sourceInventory.UpdatedBy = handledBy;

            // Find existing inventory on target shelf
            var targetInventory = await _context.Inventories
                .FirstOrDefaultAsync(i =>
                    i.MaterialId == sourceInventory.MaterialId &&
                    i.WarehouseShelfId == targetWarehouseShelfId);

            if (targetInventory != null)
            {
                targetInventory.Quantity += quantity;
                targetInventory.UpdatedAt = DateTime.UtcNow;
                targetInventory.UpdatedBy = handledBy;
            }
            else
            {
                targetInventory = new backend.Model.Inventory
                {
                    Id = Guid.NewGuid(),
                    MaterialId = sourceInventory.MaterialId,
                    WarehouseShelfId = targetWarehouseShelfId,
                    Quantity = quantity,
                    Status = "Available",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = handledBy,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = handledBy
                };

                _context.Inventories.Add(targetInventory);
            }

            // Movement history
            var movement = new InventoryMovement
            {
                Id = Guid.NewGuid(),
                MovementType = "Transfer",
                MaterialId = sourceInventory.MaterialId!.Value,
                Quantity = quantity,
                FromWarehouseShelfId = sourceInventory.WarehouseShelfId,
                ToWarehouseShelfId = targetWarehouseShelfId,
                Timestamp = DateTime.UtcNow,
                HandledBy = handledBy,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = handledBy,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = handledBy
            };

            _context.InventoryMovements.Add(movement);

            // Remove empty source inventory
            if (sourceInventory.Quantity == 0)
            {
                _context.Inventories.Remove(sourceInventory);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}