using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWarehouseRack : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WarehouseShelves_WarehouseRooms_WarehouseRoomId",
                table: "WarehouseShelves");

            migrationBuilder.RenameColumn(
                name: "WarehouseRoomId",
                table: "WarehouseShelves",
                newName: "WarehouseRackId");

            migrationBuilder.RenameIndex(
                name: "IX_WarehouseShelves_WarehouseRoomId",
                table: "WarehouseShelves",
                newName: "IX_WarehouseShelves_WarehouseRackId");

            migrationBuilder.CreateTable(
                name: "InventoryMovements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MovementType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaterialId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FromWarehouseShelfId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ToWarehouseShelfId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HandledBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryMovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryMovements_Materials_MaterialId",
                        column: x => x.MaterialId,
                        principalTable: "Materials",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InventoryMovements_WarehouseShelves_FromWarehouseShelfId",
                        column: x => x.FromWarehouseShelfId,
                        principalTable: "WarehouseShelves",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InventoryMovements_WarehouseShelves_ToWarehouseShelfId",
                        column: x => x.ToWarehouseShelfId,
                        principalTable: "WarehouseShelves",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WarehouseRacks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WarehouseRoomId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarehouseRacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WarehouseRacks_WarehouseRooms_WarehouseRoomId",
                        column: x => x.WarehouseRoomId,
                        principalTable: "WarehouseRooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMovements_FromWarehouseShelfId",
                table: "InventoryMovements",
                column: "FromWarehouseShelfId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMovements_MaterialId",
                table: "InventoryMovements",
                column: "MaterialId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMovements_ToWarehouseShelfId",
                table: "InventoryMovements",
                column: "ToWarehouseShelfId");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseRacks_WarehouseRoomId",
                table: "WarehouseRacks",
                column: "WarehouseRoomId");

            migrationBuilder.AddForeignKey(
                name: "FK_WarehouseShelves_WarehouseRacks_WarehouseRackId",
                table: "WarehouseShelves",
                column: "WarehouseRackId",
                principalTable: "WarehouseRacks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WarehouseShelves_WarehouseRacks_WarehouseRackId",
                table: "WarehouseShelves");

            migrationBuilder.DropTable(
                name: "InventoryMovements");

            migrationBuilder.DropTable(
                name: "WarehouseRacks");

            migrationBuilder.RenameColumn(
                name: "WarehouseRackId",
                table: "WarehouseShelves",
                newName: "WarehouseRoomId");

            migrationBuilder.RenameIndex(
                name: "IX_WarehouseShelves_WarehouseRackId",
                table: "WarehouseShelves",
                newName: "IX_WarehouseShelves_WarehouseRoomId");

            migrationBuilder.AddForeignKey(
                name: "FK_WarehouseShelves_WarehouseRooms_WarehouseRoomId",
                table: "WarehouseShelves",
                column: "WarehouseRoomId",
                principalTable: "WarehouseRooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
