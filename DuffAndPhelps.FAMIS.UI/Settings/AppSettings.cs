using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace DuffAndPhelps.FAMIS.UI.Settings
{
  public class AppSettings
  {
    public string RuntimeApiEndpoint { get; set; }
    public string ConfigurationApiEndpoint { get; set; }
    public string AIName { get; set; }
    public string AIInstrumentationKey { get; set; }

    // AAD Settings
    public string adalTennant { get; set; }
    public string adalClientId { get; set; }
    public string adalExpireOffsetSeconds { get; set; }
    public string adalEndpoint { get; set; }
    public string adalExtraQueryParameter { get; set; }

    // MSAL Settings
    public string msalResetPasswordPolicy { get; set; }
    public string msalScope { get; set; }
    public string msalClient { get; set; }
    public string msalTenant { get; set; }
    public string msalSigninSignupPolicy { get; set; }

    public string authorizationApiEndpoint { get; set; }

    public string googleMapAPIKey { get; set; }

    public string bingMapAPIKey { get; set; }

    // SSRS URL
    public string ssrsURL { get; set; }
    public string reportParameterLimit { get; set; }
    public string defaultLanguage { get; set; }
    public string masterTemplateId { get; set; }
    public string additionalExpireOffsetSeconds { get; set; }
    public string famisSupportEmailAddress { get; set; }
    public static string[] GetFileTypesArray(IConfiguration cfg)
    {
      const string key = "AppSettings:acceptedFileTypes";
      return cfg.GetSection(key).Value == null
        ? cfg.GetSection(key).Get<string[]>()
        : JsonConvert.DeserializeObject<string[]>(cfg.GetSection(key).Get<string>());
    }
  }
}
