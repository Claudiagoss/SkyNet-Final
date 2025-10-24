using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tickets.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGeolocalizacionVisitas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // === Campos de geolocalización y control de visitas ===
            migrationBuilder.AddColumn<DateTime>(
                name: "HoraIngreso",
                schema: "tickets",
                table: "Ticket",
                type: "datetime2",
                nullable: true,
                comment: "Fecha y hora de ingreso del técnico al sitio."
            );

            migrationBuilder.AddColumn<double>(
                name: "LatitudIngreso",
                schema: "tickets",
                table: "Ticket",
                type: "float",
                nullable: true,
                comment: "Latitud registrada al ingresar al sitio."
            );

            migrationBuilder.AddColumn<double>(
                name: "LongitudIngreso",
                schema: "tickets",
                table: "Ticket",
                type: "float",
                nullable: true,
                comment: "Longitud registrada al ingresar al sitio."
            );

            migrationBuilder.AddColumn<DateTime>(
                name: "HoraSalida",
                schema: "tickets",
                table: "Ticket",
                type: "datetime2",
                nullable: true,
                comment: "Fecha y hora de salida del técnico del sitio."
            );

            migrationBuilder.AddColumn<double>(
                name: "LatitudSalida",
                schema: "tickets",
                table: "Ticket",
                type: "float",
                nullable: true,
                comment: "Latitud registrada al salir del sitio."
            );

            migrationBuilder.AddColumn<double>(
                name: "LongitudSalida",
                schema: "tickets",
                table: "Ticket",
                type: "float",
                nullable: true,
                comment: "Longitud registrada al salir del sitio."
            );

            migrationBuilder.AddColumn<string>(
                name: "ReporteFinal",
                schema: "tickets",
                table: "Ticket",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true,
                comment: "Observaciones o reporte final del técnico tras concluir la visita."
            );

            migrationBuilder.AddColumn<int>(
                name: "SupervisorId",
                schema: "tickets",
                table: "Ticket",
                type: "int",
                nullable: true,
                comment: "Id del supervisor que asignó o cerró la visita (FK a auth.Usuario)."
            );

            // Índices para optimizar consultas por supervisor y fechas
            migrationBuilder.CreateIndex(
                name: "IX_Ticket_SupervisorId",
                schema: "tickets",
                table: "Ticket",
                column: "SupervisorId"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ticket_SupervisorId",
                schema: "tickets",
                table: "Ticket"
            );

            migrationBuilder.DropColumn(name: "HoraIngreso", schema: "tickets", table: "Ticket");
            migrationBuilder.DropColumn(name: "LatitudIngreso", schema: "tickets", table: "Ticket");
            migrationBuilder.DropColumn(name: "LongitudIngreso", schema: "tickets", table: "Ticket");
            migrationBuilder.DropColumn(name: "HoraSalida", schema: "tickets", table: "Ticket");
            migrationBuilder.DropColumn(name: "LatitudSalida", schema: "tickets", table: "Ticket");
            migrationBuilder.DropColumn(name: "LongitudSalida", schema: "tickets", table: "Ticket");
            migrationBuilder.DropColumn(name: "ReporteFinal", schema: "tickets", table: "Ticket");
            migrationBuilder.DropColumn(name: "SupervisorId", schema: "tickets", table: "Ticket");
        }
    }
}
