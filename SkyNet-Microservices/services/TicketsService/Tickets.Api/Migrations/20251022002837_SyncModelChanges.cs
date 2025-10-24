using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tickets.Api.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Correo",
                schema: "tickets",
                table: "Cliente",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ReportesVisita",
                columns: table => new
                {
                    ReporteVisitaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TicketId = table.Column<int>(type: "int", nullable: false),
                    ClienteEmail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TecnicoNombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaEnvio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Asunto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Contenido = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Enviado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportesVisita", x => x.ReporteVisitaId);
                    table.ForeignKey(
                        name: "FK_ReportesVisita_Ticket_TicketId",
                        column: x => x.TicketId,
                        principalSchema: "tickets",
                        principalTable: "Ticket",
                        principalColumn: "TicketId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReportesVisita_TicketId",
                table: "ReportesVisita",
                column: "TicketId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReportesVisita");

            migrationBuilder.DropColumn(
                name: "Correo",
                schema: "tickets",
                table: "Cliente");
        }
    }
}
