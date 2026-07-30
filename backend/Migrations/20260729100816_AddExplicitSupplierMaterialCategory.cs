using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddExplicitSupplierMaterialCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaterialCategories_Suppliers_SupplierId",
                table: "MaterialCategories");

            migrationBuilder.DropIndex(
                name: "IX_MaterialCategories_SupplierId",
                table: "MaterialCategories");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "MaterialCategories");

            migrationBuilder.CreateTable(
                name: "SupplierMaterialCategories",
                columns: table => new
                {
                    SupplierId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaterialCategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplierMaterialCategories", x => new { x.SupplierId, x.MaterialCategoryId });
                    table.ForeignKey(
                        name: "FK_SupplierMaterialCategories_MaterialCategories_MaterialCategoryId",
                        column: x => x.MaterialCategoryId,
                        principalTable: "MaterialCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SupplierMaterialCategories_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierMaterialCategories_MaterialCategoryId",
                table: "SupplierMaterialCategories",
                column: "MaterialCategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SupplierMaterialCategories");

            migrationBuilder.AddColumn<Guid>(
                name: "SupplierId",
                table: "MaterialCategories",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MaterialCategories_SupplierId",
                table: "MaterialCategories",
                column: "SupplierId");

            migrationBuilder.AddForeignKey(
                name: "FK_MaterialCategories_Suppliers_SupplierId",
                table: "MaterialCategories",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id");
        }
    }
}
