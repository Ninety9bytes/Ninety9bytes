
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.IO;
using DuffAndPhelps.FAMIS.UI.Settings;

namespace DuffAndPhelps.FAMIS.UI
{
  public class Startup
  {
    public Startup(IHostingEnvironment env)
    {
      var builder = new ConfigurationBuilder()
          .SetBasePath(env.ContentRootPath)
          .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
          .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
          .AddEnvironmentVariables();
      Configuration = builder.Build();
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      // Add framework services.
      services.Configure<AppSettings>(Configuration.GetSection("AppSettings"));
      services.AddSingleton(Configuration);
      services.AddCors();
      services.AddMvc();
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
    {
      loggerFactory.AddConsole(Configuration.GetSection("Logging"));
      loggerFactory.AddDebug();

      app.UseCors(builder => builder.WithOrigins("https://localhost:3000", "http://localhost:4200").AllowAnyHeader());
      app.Use(async (context, next) =>
      {

        await next();



              // Adding middleware to redirect those pesky 404s to the root file
              // If there's no available file and the request doesn't contain an extension, we're probably trying to access a page.

              // Rewrite request to use app root

              if (context.Response.StatusCode == 404 && !Path.HasExtension(context.Request.Path.Value) && !context.Request.Path.Value.StartsWith("/api"))

        {

          context.Request.Path = "/index.html";

          context.Response.StatusCode = 200; // Make sure we update the status code, otherwise it returns 404

                await next();

        }

      });

      // Adding Microsoft.AspNetCore.StaticFiles Middleware
      app.UseDefaultFiles();
      app.UseStaticFiles();
      app.Use(async (context, next) =>
      {
        context.Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
        context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
        context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
        await next();
      });
      app.UseMvc();
    }
  }
}
