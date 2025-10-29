using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodPreorderApi.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Menu")]
        public int MenuId { get; set; }

        public Menu Menu { get; set; } = null!; // Navigation property

        [Required]
        [MaxLength(100)]
        public string StudentName { get; set; } = string.Empty;

        [Required]
        public DateTime PickupTime { get; set; }

        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
