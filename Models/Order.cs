using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FoodPreorderApi.Models
{
    public class Order
    {
        public int Id { get; set; }

        [Required]
        public int MenuId { get; set; }

        [Required]
        public string StudentName { get; set; } = string.Empty;

        [Required]
        public DateTime PickupTime { get; set; }

        [Required]
        public string Status { get; set; } = string.Empty;

        // Menu optional — elak error "Menu is required"
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public Menu? Menu { get; set; }
    }
}
