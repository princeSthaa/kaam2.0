using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Materials_MaterialCategories_MaterialCategoryId",
                table: "Materials");

            migrationBuilder.AddColumn<Guid>(
                name: "MaterialTypeId1",
                table: "Materials",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Materials_MaterialTypeId1",
                table: "Materials",
                column: "MaterialTypeId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Materials_MaterialCategories_MaterialCategoryId",
                table: "Materials",
                column: "MaterialCategoryId",
                principalTable: "MaterialCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Materials_MaterialTypes_MaterialTypeId1",
                table: "Materials",
                column: "MaterialTypeId1",
                principalTable: "MaterialTypes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Materials_MaterialCategories_MaterialCategoryId",
                table: "Materials");

            migrationBuilder.DropForeignKey(
                name: "FK_Materials_MaterialTypes_MaterialTypeId1",
                table: "Materials");

            migrationBuilder.DropIndex(
                name: "IX_Materials_MaterialTypeId1",
                table: "Materials");

            migrationBuilder.DropColumn(
                name: "MaterialTypeId1",
                table: "Materials");

            migrationBuilder.AddForeignKey(
                name: "FK_Materials_MaterialCategories_MaterialCategoryId",
                table: "Materials",
                column: "MaterialCategoryId",
                principalTable: "MaterialCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
