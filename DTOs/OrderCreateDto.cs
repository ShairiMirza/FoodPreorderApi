using System;
using System.ComponentModel.DataAnnotations;

namespace FoodPreorderApi.Dtos
{
    public class OrderCreateDto
    {
        [Required]
        public int MenuId { get; set; } // Hantar ID sahaja

        [Required]
        [MaxLength(100)]
        public string StudentName { get; set; } = string.Empty;

        [Required]
        public DateTime PickupTime { get; set; }

        [Required]
        public string Status { get; set; } = "Pending"; // default Pending
    }
}
