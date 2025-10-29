using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodPreorderApi.Data;
using FoodPreorderApi.Models;

namespace FoodPreorderApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Orders
        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Menu)
                .Select(o => new
                {
                    o.Id,
                    o.StudentName,
                    o.PickupTime,
                    o.Status,
                    Menu = new
                    {
                        o.Menu.Id,
                        o.Menu.Name,
                        o.Menu.Price,
                        o.Menu.Category,
                        o.Menu.Available
                    }
                })
                .ToListAsync();

            return Ok(orders);
        }

        // POST: api/Orders
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Pastikan MenuId wujud
            var menu = await _context.Menus.FindAsync(dto.MenuId);
            if (menu == null)
                return BadRequest(new { message = "Menu not found." });

            var order = new Order
            {
                MenuId = dto.MenuId,
                StudentName = dto.StudentName,
                PickupTime = dto.PickupTime,
                Status = dto.Status
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var result = new
            {
                order.Id,
                order.StudentName,
                order.PickupTime,
                order.Status,
                Menu = new
                {
                    menu.Id,
                    menu.Name,
                    menu.Price,
                    menu.Category,
                    menu.Available
                }
            };

            return CreatedAtAction(nameof(GetOrders), new { id = order.Id }, result);
        }
    }

    // DTO untuk POST
    public class OrderCreateDto
    {
        public int MenuId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public DateTime PickupTime { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
