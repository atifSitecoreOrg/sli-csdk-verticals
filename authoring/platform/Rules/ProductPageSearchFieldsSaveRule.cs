using System;
using Sitecore.Data;
using Sitecore.Data.Events;
using Sitecore.Data.Items;
using Sitecore.Events;

namespace XmCloudNextJsStarter.Rules
{
    /// <summary>
    /// Item-saved rule that keeps the product search fields aligned with the item location.
    /// </summary>
    public class ProductPageSearchFieldsSaveRule
    {
        private const string MasterDatabaseName = "master";
        private const string PathFieldName = "scPath";
        private const string UrlFieldName = "scUrl";
        private const string HomeSegment = "/Home/";
        private static readonly ID ProductPageTemplateId = new ID("{F6E44A9E-074A-4865-987E-0C2DC00B7AF5}");

        public void OnItemSaved(object sender, EventArgs args)
        {
            var item = Event.ExtractParameter(args, 0) as Item;
            if (!ShouldUpdate(item))
            {
                return;
            }

            var path = item.Paths.FullPath;
            var url = ToPublicUrl(path);
            if (string.Equals(item[PathFieldName], path, StringComparison.Ordinal)
                && string.Equals(item[UrlFieldName], url, StringComparison.Ordinal))
            {
                return;
            }

            using (new EventDisabler())
            {
                item.Editing.BeginEdit();
                try
                {
                    item[PathFieldName] = path;
                    item[UrlFieldName] = url;
                    item.Editing.EndEdit();
                }
                catch
                {
                    item.Editing.CancelEdit();
                    throw;
                }
            }
        }

        private static bool ShouldUpdate(Item item)
        {
            if (item == null
                || item.Database == null
                || !string.Equals(item.Database.Name, MasterDatabaseName, StringComparison.OrdinalIgnoreCase)
                || string.Equals(item.Name, "__Standard Values", StringComparison.OrdinalIgnoreCase)
                || item.Fields[PathFieldName] == null
                || item.Fields[UrlFieldName] == null)
            {
                return false;
            }

            return item.TemplateID == ProductPageTemplateId;
        }

        private static string ToPublicUrl(string fullPath)
        {
            var homeIndex = fullPath.IndexOf(HomeSegment, StringComparison.OrdinalIgnoreCase);
            if (homeIndex < 0)
            {
                return fullPath;
            }

            return fullPath.Substring(homeIndex + "/Home".Length);
        }
    }
}
