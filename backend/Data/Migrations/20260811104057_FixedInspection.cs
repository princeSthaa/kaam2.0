using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixedInspection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WarehouseRooms_Warehouses_WarehouseId",
                table: "WarehouseRooms");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "WarehouseShelves");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "WarehouseShelves");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "WarehouseRooms");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "WarehouseRooms");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "WarehouseRacks");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "WarehouseRacks");

            migrationBuilder.RenameColumn(
                name: "WarehouseId",
                table: "WarehouseRooms",
                newName: "WarehouseFloorId");

            migrationBuilder.RenameIndex(
                name: "IX_WarehouseRooms_WarehouseId",
                table: "WarehouseRooms",
                newName: "IX_WarehouseRooms_WarehouseFloorId");

            migrationBuilder.RenameColumn(
                name: "Qunatity",
                table: "ProductIssue",
                newName: "Quantity");

            migrationBuilder.AddColumn<bool>(
                name: "isReceived",
                table: "ProductIssue",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<int>(
                name: "InspectionStatus",
                table: "MaterialInspections",
                type: "int",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<int>(
                name: "InspectionStatus",
                table: "MaterialInspectionItems",
                type: "int",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.CreateTable(
                name: "WarehouseFloors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarehouseFloors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WarehouseFloors_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseFloors_WarehouseId",
                table: "WarehouseFloors",
                column: "WarehouseId");

            migrationBuilder.AddForeignKey(
                name: "FK_WarehouseRooms_WarehouseFloors_WarehouseFloorId",
                table: "WarehouseRooms",
                column: "WarehouseFloorId",
                principalTable: "WarehouseFloors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WarehouseRooms_WarehouseFloors_WarehouseFloorId",
                table: "WarehouseRooms");

            migrationBuilder.DropTable(
                name: "WarehouseFloors");

            migrationBuilder.DropColumn(
                name: "isReceived",
                table: "ProductIssue");

            migrationBuilder.RenameColumn(
                name: "WarehouseFloorId",
                table: "WarehouseRooms",
                newName: "WarehouseId");

            migrationBuilder.RenameIndex(
                name: "IX_WarehouseRooms_WarehouseFloorId",
                table: "WarehouseRooms",
                newName: "IX_WarehouseRooms_WarehouseId");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "ProductIssue",
                newName: "Qunatity");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "WarehouseShelves",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "WarehouseShelves",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Warehouses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Warehouses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "WarehouseRooms",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "WarehouseRooms",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "WarehouseRacks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "WarehouseRacks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "InspectionStatus",
                table: "MaterialInspections",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "InspectionStatus",
                table: "MaterialInspectionItems",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldMaxLength: 50);

            migrationBuilder.AddForeignKey(
                name: "FK_WarehouseRooms_Warehouses_WarehouseId",
                table: "WarehouseRooms",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
