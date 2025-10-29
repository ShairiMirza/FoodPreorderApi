using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace FoodPreorderApi.Models
{
    public class Menu
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public bool Available { get; set; }

        [JsonIgnore] // elak circular reference semasa serialize Order->Menu->Orders
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
