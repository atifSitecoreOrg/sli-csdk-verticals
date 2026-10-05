using System;
using Sitecore.Data;
using Sitecore.Data.Events;
using Sitecore.Data.Items;
using Sitecore.Data.Managers;
using Sitecore.Events;

namespace XmCloudNextJsStarter.Rules
{
    /// <summary>
    /// Item-saved rule that keeps page search fields aligned with the item location.
    /// </summary>
    public class ProductPageSearchFieldsSaveRule
    {
        private const string MasterDatabaseName = "master";
        private const string PathFieldName = "scPath";
        private const string UrlFieldName = "scUrl";
        private const string HomeSegment = "/Home/";
        private static readonly ID BasePageTemplateId = new ID("{3F8A6A5D-7B1A-4566-8CD4-0A50F3030BD8}");
        private static readonly ID[] PageTemplateIds =
        {
            new ID("{98E60957-0783-4A9A-85CC-77DAD30E9711}"),
            new ID("{412BF445-B1A6-4AFF-8054-0B21A1FEBC47}"),
            new ID("{F6E44A9E-074A-4865-987E-0C2DC00B7AF5}"),
            new ID("{4D2B49E6-1130-444A-B22C-5C7E25D01B56}"),
            new ID("{B79B5166-C106-4F82-A8CA-11CEC6032D52}"),
            new ID("{2F814F03-C3EF-4229-854C-CBCED6D24704}"),
            new ID("{C0274E9D-2974-4766-A29A-0C4F9FAF8C86}")
        };

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

            var template = TemplateManager.GetTemplate(item);
            if (template == null)
            {
                return false;
            }

            if (template.InheritsFrom(BasePageTemplateId))
            {
                return true;
            }

            foreach (var pageTemplateId in PageTemplateIds)
            {
                if (template.InheritsFrom(pageTemplateId))
                {
                    return true;
                }
            }

            return false;
        }

        private static string ToPublicUrl(string fullPath)
        {
            var homeIndex = fullPath.IndexOf(HomeSegment, StringComparison.OrdinalIgnoreCase);
            if (homeIndex < 0)
            {
                return fullPath;
            }

            return fullPath.Substring(homeIndex + "/Home".Length).Replace(" ", "-");
        }
    }
}
