using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderProductionPlanLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ProductionPlanId",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ProductionPlanId",
                table: "Orders",
                column: "ProductionPlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_ProductionPlans_ProductionPlanId",
                table: "Orders",
                column: "ProductionPlanId",
                principalTable: "ProductionPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_ProductionPlans_ProductionPlanId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_ProductionPlanId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ProductionPlanId",
                table: "Orders");
        }
    }
}
