using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class ProductDemandIssued : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Qunatity",
                table: "ProductDemand",
                newName: "Quantity");

            migrationBuilder.AddColumn<bool>(
                name: "isIssued",
                table: "ProductDemand",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isIssued",
                table: "ProductDemand");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "ProductDemand",
                newName: "Qunatity");
        }
    }
}
