using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class ProductIssue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isReceived",
                table: "ProductIssue");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "ProductIssue",
                newName: "Qunatity");
        }
    }
}
