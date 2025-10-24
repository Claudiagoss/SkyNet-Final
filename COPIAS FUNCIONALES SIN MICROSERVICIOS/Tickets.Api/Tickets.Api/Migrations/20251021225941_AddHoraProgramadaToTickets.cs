using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tickets.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHoraProgramadaToTickets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
           

            migrationBuilder.DropPrimaryKey(
                name: "PK_ClienteAsignaciones",
                table: "ClienteAsignaciones");

            migrationBuilder.RenameTable(
                name: "UsuarioCoberturas",
                newName: "UsuarioCobertura",
                newSchema: "auth");

            migrationBuilder.RenameTable(
                name: "ClienteAsignaciones",
                newName: "ClienteAsignacion",
                newSchema: "tickets");

            migrationBuilder.AddColumn<DateTime>(
                name: "HoraProgramada",
                schema: "tickets",
                table: "Ticket",
                type: "datetime2",
                nullable: true);

         

            migrationBuilder.AddPrimaryKey(
                name: "PK_ClienteAsignacion",
                schema: "tickets",
                table: "ClienteAsignacion",
                column: "ClienteAsignacionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
           

            migrationBuilder.DropPrimaryKey(
                name: "PK_ClienteAsignacion",
                schema: "tickets",
                table: "ClienteAsignacion");

            migrationBuilder.DropColumn(
                name: "HoraProgramada",
                schema: "tickets",
                table: "Ticket");

          

            migrationBuilder.RenameTable(
                name: "ClienteAsignacion",
                schema: "tickets",
                newName: "ClienteAsignaciones");


            migrationBuilder.AddPrimaryKey(
                name: "PK_ClienteAsignaciones",
                table: "ClienteAsignaciones",
                column: "ClienteAsignacionId");
        }
    }
}
