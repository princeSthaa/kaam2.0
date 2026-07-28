using System.ComponentModel.DataAnnotations.Schema;
using backend.Dto.Order;

namespace backend.Dto.Customer;

public class CustomerGet
{
    public Guid Id { get; set; }

    public string Name {get; set;} = string.Empty;

    public string Email {get; set;} = string.Empty;

    public string Phone {get; set;} = string.Empty;

    public string Address {get; set;} = string.Empty;

    public string Type {get; set;} = string.Empty;

    public string Company {get; set;} = string.Empty;

    public string PanVat {get; set;} = string.Empty;

    [NotMapped]
    public List<OrderDto> Orders { get; set; } = new List<OrderDto>();

}