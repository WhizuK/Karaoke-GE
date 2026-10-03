using Karaoke_GE.Server.Hubs;
using Karaoke_GE.Server.Network;
using Karaoke_GE.Server.Playback;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddSignalR();
builder.Services.AddSingleton<ConnectionCounter>();
builder.Services.AddSingleton<LocalNetworkAddressProvider>();
builder.Services.AddSingleton<PlaybackStore>();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.MapNetworkEndpoints();
app.MapHub<KaraokeHub>("/hubs/karaoke");

app.MapFallbackToFile("/index.html");

app.Run();
