var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
  
}

app.MapGet("/api/health", () => Results.Ok(new { status = "ok"}));

app.MapFallbackToFile("index.html");

app.Run();
