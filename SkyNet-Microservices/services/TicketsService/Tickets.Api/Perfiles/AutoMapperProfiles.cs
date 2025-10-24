using AutoMapper;
using Tickets.Api.DTOs.Catalogos;
using Tickets.Api.DTOs.Clientes;
using Tickets.Api.DTOs.Comentarios;
using Tickets.Api.DTOs.Tickets;
using Tickets.Api.Entidades;

namespace Tickets.Api.Perfiles;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        // Tickets
        CreateMap<CrearTicketDTO, Ticket>();
        CreateMap<Ticket, GetAllTicketsDTO>()
            .ForMember(d => d.ClienteNombre, opt => opt.Ignore())
            .ForMember(d => d.ReportadoPor, opt => opt.Ignore())
            .ForMember(d => d.AsignadoA, opt => opt.Ignore())
            .ForMember(d => d.Estado, opt => opt.Ignore())
            .ForMember(d => d.Prioridad, opt => opt.Ignore());

        // Comentarios
        CreateMap<Comentario, GetAllComentariosDTO>()
            .ForMember(d => d.UsuarioNombre, opt => opt.Ignore());
        CreateMap<CrearComentarioDTO, Comentario>();

        // Clientes
        CreateMap<CrearClienteDTO, Cliente>();
        CreateMap<Cliente, GetAllClientesDTO>();

        // Catálogos
        CreateMap<EstadoTicket, GetAllEstadosDTO>();
        CreateMap<PrioridadTicket, GetAllPrioridadesDTO>();
    }
}
