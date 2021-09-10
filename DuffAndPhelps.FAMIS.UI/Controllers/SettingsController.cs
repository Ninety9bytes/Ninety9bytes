using System.Collections.Generic;
using DuffAndPhelps.FAMIS.UI.Settings;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace DuffAndPhelps.FAMIS.UI.Controllers
{
  [Route("api/[controller]")]
  public class SettingsController : Controller
  {
    private IOptions<AppSettings> _appSettings;
    private IConfiguration _cfg;

    // GET api/values
    public SettingsController(IOptions<AppSettings> appSettings, IConfiguration cfg)
    {
      _cfg = cfg;
      _appSettings = appSettings;
    }

    [HttpGet]
    public JsonResult Get()
    {
      var sets = new
      {
        runtimeApiEndpoint = _appSettings.Value.RuntimeApiEndpoint,
        configurationApiEndpoint = _appSettings.Value.ConfigurationApiEndpoint,
        aiName = _appSettings.Value.AIName,
        aiInstrumentationKey = _appSettings.Value.AIInstrumentationKey,
        adalTennant = _appSettings.Value.adalTennant,
        adalClientId = _appSettings.Value.adalClientId,
        adalExpireOffsetSeconds = _appSettings.Value.adalExpireOffsetSeconds,
        adalEndpoint = _appSettings.Value.adalEndpoint,
        adalExtraQueryParameter = _appSettings.Value.adalExtraQueryParameter,
        googleMapAPIKey = _appSettings.Value.googleMapAPIKey,
        bingMapAPIKey = _appSettings.Value.bingMapAPIKey,
        ssrsURL = _appSettings.Value.ssrsURL,
        defaultLanguage = _appSettings.Value.defaultLanguage,
        acceptedFileTypes = AppSettings.GetFileTypesArray(_cfg),
        masterTemplateId = _appSettings.Value.masterTemplateId,
        additionalExpireOffsetSeconds = _appSettings.Value.additionalExpireOffsetSeconds,
        reportParameterLimit = _appSettings.Value.reportParameterLimit,
        famisSupportEmailAddress= _appSettings.Value.famisSupportEmailAddress,

        msalResetPasswordPolicy = "",
        msalScope = "",
        msalClient = "",
        msalTenant = "",
        msalSigninSignupPolicy = "",
        authorizationApiEndpoint = _appSettings.Value.authorizationApiEndpoint

      };
      return Json(sets);
    }
  }
}
