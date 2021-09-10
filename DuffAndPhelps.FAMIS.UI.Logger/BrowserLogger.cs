using Newtonsoft.Json;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Threading;
using DuffAndPhelps.FAMIS.UI.Common;

namespace DuffAndPhelps.FAMIS.UI.Logger
{
    public class BrowserLogger
    {
        private static string _debuggerAddress = "127.0.0.1:9222";
        private static string _newTranslationsFile = "c:\\temp\\newTranslations.json";
        private static string _stopUrlString = "StopTest";
        private static TimeSpan _timeBetweenReads = TimeSpan.FromSeconds(5);


        static void Main(string[] args)
        {
            _debuggerAddress = ConfigurationManager.AppSettings["DebuggerAddress"];
            _newTranslationsFile = ConfigurationManager.AppSettings["NewTranslationsFile"];
            _stopUrlString = ConfigurationManager.AppSettings["StopUrlString"];
            if (!TimeSpan.TryParse(ConfigurationManager.AppSettings["TimeBetweenReads"], out _timeBetweenReads))
                _timeBetweenReads = TimeSpan.FromSeconds(5);

            Console.WriteLine(@"What this program does is listen to an already running Chrome instance at {DebuggerAddress}, capture the console logs and write any missing translations to {NewTranslationsFile} which can then be merged with the existing en.json.
  To set this up...
    1) Edit DuffAndPhelps.FAMIS.UI.Logger.exe.config as you see fit, items marked as {} will be pulled from that file
    2) Run chrome from a shortcut with this target: ""C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"" --remote-debugging-port=9222 --user-data-dir=""C:\\temp\\RemoteDebugging""
    3) Navigate the browser where you\'d like to start capturing logs
    4) Debug the program, watching the Debug output, when it says so... start navigating
    5) Navigate through the application under program, every {TimeBetweenReads} it will collect new logs
    6) When complete navigate to a url that contains {StopUrlString}
    7) The program will then process the logs created and save them to {NewTranslationsFile}
    8) The program will end");

            Console.WriteLine($"DebuggerAddress: '{_debuggerAddress}'");
            Console.WriteLine($"NewTranslationsFile: '{_newTranslationsFile}'");
            Console.WriteLine($"StopUrlString: '{_stopUrlString}'");
            Console.WriteLine($"TimeBetweenReads: '{_timeBetweenReads}'");

            if (string.IsNullOrEmpty(_debuggerAddress) || string.IsNullOrEmpty(_newTranslationsFile) || string.IsNullOrEmpty(_stopUrlString))
            {
                Console.WriteLine("Not configured properly, please review config file and start again.");
                return;
            }

            ChromeDriver driver;
            var rawLogEntries = new List<string>();

            try
            {
                var options = new ChromeOptions();
                options.SetLoggingPreference(LogType.Browser, LogLevel.All);
                options.DebuggerAddress = _debuggerAddress;
                driver = new ChromeDriver(options);

            }
            catch (Exception e)
            {
                Console.WriteLine($"Unable to attach to browser at '{_debuggerAddress}'. Exiting.");
                Console.WriteLine(e);
                return;
            }


            var jse = (IJavaScriptExecutor)driver;
            Console.WriteLine($"******* Begin navigating the application, Logs will be captured. Navigate to a URL with '{_stopUrlString}' when complete. *****");

            while (driver.Url.IndexOf(_stopUrlString, StringComparison.InvariantCultureIgnoreCase) == -1)
            {
                Thread.Sleep(_timeBetweenReads);
                var newLogs = driver.Manage().Logs.GetLog(LogType.Browser).ToList();
                rawLogEntries.AddRange(newLogs.Select(x => x.Message));
                jse.ExecuteScript("console.clear()");

                Console.WriteLine($"Captured {newLogs.Count} more lines ({rawLogEntries.Count} total - {rawLogEntries.Count(DictionaryProcessor.IsMissingTranslationLog)} of which are likely missing translations). Navigate to a URL with '{_stopUrlString}' to stop.");
            }

            Console.WriteLine("******* Navigation complete... will now process the log entries. *****");

            // Write out everything
            File.WriteAllText($"{_newTranslationsFile}.bak", JsonConvert.SerializeObject(rawLogEntries));

            var translationEntryRows = rawLogEntries.Where(DictionaryProcessor.IsMissingTranslationLog).ToList();

            var newEntries = DictionaryProcessor.ProcessDictionary(translationEntryRows);

            File.WriteAllText(_newTranslationsFile, JsonConvert.SerializeObject(newEntries));
            Console.WriteLine($"******* Done. Wrote {newEntries.Count} new translations to {_newTranslationsFile}. *****");
        }
    }
}
