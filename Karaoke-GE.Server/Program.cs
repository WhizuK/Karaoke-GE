using Karaoke_GE.Server.Admin;
using Karaoke_GE.Server.Hubs;
using Karaoke_GE.Server.Network;
using Karaoke_GE.Server.Playback;
using Karaoke_GE.Server.Queue;
using Karaoke_GE.Server.Singers;
using Karaoke_GE.Server.YouTube;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions<AdminOptions>()
    .Bind(builder.Configuration.GetSection(AdminOptions.SectionName))
    .Validate(
        options => options.Pin.Length >= AdminOptions.MinPinLength,
        $"Defina Admin:Pin no appsettings.json com pelo menos {AdminOptions.MinPinLength} caracteres.")
    .ValidateOnStart();

builder.Services.AddOptions<YouTubeOptions>()
    .Bind(builder.Configuration.GetSection(YouTubeOptions.SectionName));
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<YouTubeClient>();

builder.Services.AddOpenApi();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddSignalR(options => options.AddFilter<RuleViolationHubFilter>());
builder.Services.AddSingleton<ConnectionCounter>();
builder.Services.AddSingleton<LocalNetworkAddressProvider>();
builder.Services.AddSingleton<PlaybackStore>();
builder.Services.AddSingleton<SongQueue>();
builder.Services.AddSingleton<SingerDirectory>();
builder.Services.AddSingleton<AdminSessions>();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    // Em desenvolvimento a página vem do Vite (porta 53066) e o SignalR liga
    // diretamente a este servidor (porta 5240): são origens diferentes, por isso
    // o browser exige CORS. Na versão final está tudo na mesma porta e isto não é preciso.
    app.UseCors();
}

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.MapNetworkEndpoints();
app.MapYouTubeEndpoints();
app.MapHub<KaraokeHub>("/hubs/karaoke");

app.MapFallbackToFile("/index.html");

app.Run();
