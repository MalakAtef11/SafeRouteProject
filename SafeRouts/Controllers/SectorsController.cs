using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeRoutes.Data;

namespace SafeRoutes.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class SectorsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SectorsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSectors()
        {
            var sectors = await _context.Sectors
                .Where(s => s.IsActive)
                .ToListAsync();

            return Ok(sectors);
        }
    }
}