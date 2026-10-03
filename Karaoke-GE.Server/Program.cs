using Karaoke_GE.Server.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddSingleton<ConnectionCounter>();
builder.Services.AddSignalR();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

}

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.MapHub<KaraokeHub>("/hubs/karaoke");

app.MapFallbackToFile("index.html");

app.Run();
