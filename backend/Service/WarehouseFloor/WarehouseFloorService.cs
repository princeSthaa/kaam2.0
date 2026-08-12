using Dapper;
using System.Data;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.WarehouseFloor;
using backend.Dto.WarehouseRoom;
using backend.Dto.WarehouseRack;
using backend.Dto.WarehouseShelf;

namespace backend.Service.WarehouseFloor
{
    public class WarehouseFloorService : IWarehouseFloorService
    {
        private readonly AppDbContext _context;

        public WarehouseFloorService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<WarehouseFloorGetDto>> GetAllAsync(
            Guid? id = null,
            string? code = null,
            string? name = null,
            Guid? warehouseId = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        )
        {
            var connection = _context.Database.GetDbConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@Id", id);
            parameters.Add("@Name", name);
            parameters.Add("@Code", code);
            parameters.Add("@WarehouseId", warehouseId);
            parameters.Add("@CreatedAt", createdAt);
            parameters.Add("@UpdatedAt", updatedAt);

            using var multi = await connection.QueryMultipleAsync("sp_GetWarehouseFloor", parameters, commandType: CommandType.StoredProcedure );

            var floors = (await multi.ReadAsync<WarehouseFloorGetDto>()).ToList();
            var rooms = (await multi.ReadAsync<WarehouseRoomDto>()).ToList();
            var racks = (await multi.ReadAsync<WarehouseRackDto>()).ToList();
            var shelves = (await multi.ReadAsync<WarehouseShelfDto>()).ToList();

            foreach (var rack in racks)
            {
                rack.WarehouseShelves = shelves.Where(s => s.WarehouseRackId == rack.Id).ToList();
            }

            foreach (var room in rooms)
            {
                room.WarehouseRacks = racks.Where(r => r.WarehouseRoomId == room.Id).ToList();
            }

            foreach (var floor in floors)
            {
                floor.WarehouseRooms = rooms.Where(r => r.WarehouseFloorId == floor.Id).ToList();
            }
            return floors;
        }

        public async Task<WarehouseFloorGetDto?> GetByIdAsync(Guid id)
        {
            var floors = await GetAllAsync(id: id);
            return floors.FirstOrDefault();
        }

        public async Task<WarehouseFloorDto> CreateAsync(WarehouseFloorDto dto)
        {
            var id = Guid.NewGuid();
            dto.Code = $"FLR-{((await _context.WarehouseFloors.CountAsync()) + 1):D2}";
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertWarehouseFloor
                    @Id = {id},
                    @Name = {dto.Name},
                    @Code = {dto.Code},
                    @WarehouseId = {dto.WarehouseId},
                    @CreatedAt = {now},
                    @UpdatedAt = {now}
            ");

            dto.Id = id;

            return dto;
        }
    
        public async Task<bool> UpdateAsync(Guid id, WarehouseFloorDto dto)
        {
            return await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateWarehouseFloor
                    @Id = {id},
                    @Name = {dto.Name}
                    @Code = {dto.Code},
                    @UpdatedAt = {DateTime.UtcNow}
            ") > 0;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteWarehouseFloor
                    @Id = {id}
            ") > 0;
        }
    
    }
}
