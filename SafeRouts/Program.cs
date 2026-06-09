using Microsoft.EntityFrameworkCore;
using SafeRoutes.Data;
using SafeRoutes.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. إعداد الـ CORS للسماح للـ React (لوكل هوست) بالوصول للـ API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. ربط قاعدة البيانات باستخدام الـ Connection String من appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<OpenAIService>();
builder.Services.AddScoped<EmailService>();

var app = builder.Build();

// 3. تفعيل Swagger دائماً في مرحلة التطوير لرؤية الـ API
app.UseSwagger();
app.UseSwaggerUI();

app.UseStaticFiles();

// 4. حذفنا الـ HttpsRedirection عشان نشتغل http عادي وما يعلق المتصفح
// app.UseHttpsRedirection(); 

// 5. تفعيل سياسة الـ CORS اللي عرفناها فوق
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();