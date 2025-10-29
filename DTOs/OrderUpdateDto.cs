namespace FoodPreorderApi.Dtos
{
    public class OrderUpdateDto
    {
        public string StudentName { get; set; } = string.Empty;
        public DateTime PickupTime { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
