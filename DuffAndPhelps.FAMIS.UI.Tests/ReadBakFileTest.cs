using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using DuffAndPhelps.FAMIS.UI.Common;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;

namespace DuffAndPhelps.FAMIS.UI.Tests
{
    [TestClass]
    public class ReadBakFileTest
    {
        private static string _newTranslationsFile = "c:\\temp\\newTranslations.json";

        [TestMethod]
        public void RecoverBakFileTest()
        {
            var rawLogEntries = JsonConvert.DeserializeObject<List<string>>(File.ReadAllText($"{_newTranslationsFile}.bak"));

            var translationEntryRows = rawLogEntries.Where(DictionaryProcessor.IsMissingTranslationLog).ToList();

            var newEntries = DictionaryProcessor.ProcessDictionary(translationEntryRows);

            File.WriteAllText(_newTranslationsFile, JsonConvert.SerializeObject(newEntries));
            Console.WriteLine($"******* Done. Wrote {newEntries.Count} new translations to {_newTranslationsFile}. *****");


        }

        [TestMethod]
        public void ExtractJsonValueTest()
        {
            var jsonDict = JsonConvert.DeserializeObject<Dictionary<string, string>>(File.ReadAllText(@"C:\DP\FamisUI\DuffAndPhelps.FAMIS.UI\client-src\assets\i18n\en-us.json"));
            File.WriteAllLines(@"c:\temp\values.txt", jsonDict.Select(x=> x.Value));
        }



    }
}
