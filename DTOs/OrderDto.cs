namespace FoodPreorderApi.Dtos
{
    public class OrderDto
    {
        public int Id { get; set; }
        public int MenuId { get; set; }
        public string MenuName { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public DateTime PickupTime { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
