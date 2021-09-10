using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DuffAndPhelps.FAMIS.UI.Common
{
    public static class DictionaryProcessor
    {
        private const string MissingTranslations = "Missing Translations";

        public static Dictionary<string, string> ProcessDictionary(List<string> translationEntryRows)
        {
            var newEntries = new Dictionary<string, string>();

            foreach (var translationEntryRow in translationEntryRows)
            {
                try
                {
                    var msgStart = translationEntryRow.IndexOf("\"{", StringComparison.Ordinal) + 1;
                    var msgEnd = translationEntryRow.LastIndexOf("}\"", StringComparison.Ordinal) + 1;
                    var escapedRow = translationEntryRow.Substring(msgStart, msgEnd - msgStart).Replace("\\\"", "\"");

                    var thisRowDictionary = JsonConvert.DeserializeObject<Dictionary<string, string>>(escapedRow);
                    foreach (var dictEntry in thisRowDictionary.OrderBy(x => x.Key))
                    {
                        if (newEntries.ContainsKey(dictEntry.Key)) continue;

                        var val = dictEntry.Value;
                        if (val.StartsWith("##"))
                            val = val.Substring(2);
                        if (val.EndsWith("##"))
                            val = val.Substring(0, val.Length - 2);
                        newEntries.Add(dictEntry.Key, val);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine($"Issue with row: '{translationEntryRow}'. Skipping. Exception detail: '{e}'");
                }
            }

            return newEntries;
        }

        public static bool IsMissingTranslationLog(string log)
        {
            return log.IndexOf(MissingTranslations, StringComparison.InvariantCultureIgnoreCase) != -1;
        }

    }
}
