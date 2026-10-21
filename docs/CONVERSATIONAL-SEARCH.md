# Conversational Search

Page Builder component that answers a question from one or more SitecoreAI Search indexes.

| Site | Host folder | Page | Local URL |
| --- | --- | --- | --- |
| Nova Medical | `industry-verticals/healthcare` | `/sitecore/content/industry-verticals/nova-medical/Home/AI Doctor Assistant` | http://localhost:3000/AI-Doctor-Assistant |
| FormaLux | `industry-verticals/retail` | `/sitecore/content/industry-verticals/forma-lux/Home/AI Search` | http://localhost:3000/AI-Search |

The React component, API route, and search library are copied in both hosts. They do not share code. Change both copies when the behavior should match.

Doctor Finder on Nova Medical stays the directory search. FormaLux product and article listing pages stay the directory search.

## What a question does

Each question runs one SitecoreAI Search query per configured index, using the question as the keyphrase. Each index contributes up to 4 hits. The combined list stops at 12, so a later index is not dropped when the first index fills the list.

One `gpt-5-mini` chat completion then writes the answer from those hits. The request uses `reasoning_effort: low` and does not set `temperature`. The model is not called a second time, and the component does not prefetch the catalog.

Each hit sent to the model includes `sourceName`. A specialty chip is added only when that item’s type field is a specialty, such as Job Title. A SKU or product code is not a specialty.

If the Foundry key is missing or the model call fails, the same search hits are still shown and the answer is a short grounded summary. The API `provider` is `grounded-fallback` in that case, and `openai-compatible` when Foundry answers.

`systemInstructions` on the datasource are sent only on the Foundry call.

**Include Web Search** is off unless the datasource checkbox or the visitor turns it on. That path uses Tavily when `TAVILY_API_KEY` is set, otherwise the DuckDuckGo Instant Answer API. Web notes are separate from the index cards.

## What is in this repo

Serialized items and the rendering host code are in git once they are committed. Sitecore Search sources and widgets are not.

| Piece | Where it lives |
| --- | --- |
| Template and rendering | `Project.IndustryVerticals` under `authoring/items/industry-verticals/common` |
| Nova Medical page and datasource | `Project.Healthcare-Content` |
| FormaLux page, datasources, and Available Renderings | `Project.Retail-Content` |
| Healthcare code | `industry-verticals/healthcare/src/components/conversational-search`, `src/lib/conversational-search`, `src/pages/api/conversational-search.ts` |
| FormaLux code | The same three paths under `industry-verticals/retail` |
| Component registration | Each host’s `.sitecore/component-map.ts` |

FormaLux datasources:

| Item | Role |
| --- | --- |
| `.../forma-lux/Data/Search Experiences/AI Product Search` | Conversational Search datasource. **Search** is the products widget `dd32f7fe-b1c7-489e-aba8-abb51ad5194f`. |
| `.../forma-lux/Data/Search Experiences/Article Search` | Search Experience item for the articles widget `083bdb25-f6af-4d2c-9f7d-865af20a15d4`. Selected on **Additional search sources**. |
| `.../forma-lux/Home/AI Search` | Page. JSS layout, `ConversationalSearch` on `headless-main`, datasource AI Product Search. |

Nova Medical datasource `AI Doctor Assistant` uses the doctors widget `3654e4b7-43ed-49df-ad2b-4f8857e3195f`, with type mapped to Job Title.

These widget ids belong to the Sitecore Search app for this environment. They are stored in the datasource **Search** field JSON. Creating a new XM Cloud environment does not create the sources, the widgets, or the indexed documents. Recreate those in Sitecore Search, then point the datasource **Search** fields at the new widget ids.

`Article Search` on disk is the full serialized item pulled from Sitecore. A clone that deploys `Project.Retail-Content` gets that item and its mapping. It does not get the articles index itself.

## Local setup

1. Copy the host’s `.env.remote.site` to `.env.local` in that host folder. Do not commit `.env.local`.
2. Set the Sitecore Edge context id and editing secret for the environment you are reading.
3. Set Foundry on every host that should write answers. `GITHUB_MODELS_TOKEN` and `GITHUB_TOKEN` are read before `OPENAI_API_KEY`. Remove them if they are present.

```powershell
AI_BASE_URL=https://YOUR-RESOURCE.services.ai.azure.com/openai/v1/chat/completions
AI_MODEL=gpt-5-mini
OPENAI_API_KEY=your-foundry-key
```

`AI_BASE_URL` must end in `/openai/v1/chat/completions`. A Foundry sample that ends in `/responses` will not work. `AI_MODEL` is the deployment name.

Optional:

```powershell
TAVILY_API_KEY=tvly-...
```

4. From the host folder, install and start:

```powershell
cd industry-verticals/healthcare
npm install
npm run dev
```

Use `industry-verticals/retail` for FormaLux. Both default to port 3000, so run only one host on that port, or start the other with `npm run next:dev -- --port 3010`.

On XM Cloud or Vercel, set `AI_BASE_URL`, `AI_MODEL`, and `OPENAI_API_KEY` on that rendering host. Redeploy or restart the host. The route that reads them is `POST /api/conversational-search`.

## Get a Foundry key

You need an Azure subscription and permission to deploy a model in Microsoft Foundry.

1. Open [Microsoft Foundry](https://ai.azure.com) and sign in.
2. Create or open a project.
3. Deploy **gpt-5-mini**. Wait until the deployment status is Succeeded. Do not deploy `gpt-4o-mini`.
4. Copy the resource endpoint, Key 1, and the deployment name.
5. Send a short prompt in the Foundry playground. Continue only after that reply succeeds.

Do not prefix the key with `NEXT_PUBLIC_`, store it in a Sitecore field, or commit it.

## Confirm Foundry is connected

On Nova Medical, ask “I’ve had chest tightness when I climb stairs.” On FormaLux, ask “Show me velvet sofas.”

- Foundry is connected when the reply is written for that question and the cards come from the index. The API `provider` is `openai-compatible`.
- Foundry is not connected when the cards are right and the answer is the fixed grounded summary. The API `provider` is `grounded-fallback`. Check the playground call, remove any GitHub token, and confirm `AI_MODEL` is the deployment name. The host log prints `Conversational search model call failed` with the HTTP status.

FormaLux product cards should not show a **Specialty:** chip for a SKU such as `SOF0004`. Nova Medical doctor cards should show a specialty such as Neurologist.

## Attach another index

The **Search** field stores one widget. To search a second content type:

1. In Sitecore Search, create a source and a widget for that content. Map the attributes the card needs: title, image, description, type, and link.
2. Under the site’s `Data/Search Experiences` folder, create a **Search Experience** item. On its **Search** field, select that widget and map the same attributes. Changing the widget in that dialog clears the mappings, so set them again after a switch.
3. On the Conversational Search datasource, leave **Search** on the primary widget. In **Additional search sources**, select the new Search Experience item.
4. Publish the Search Experience item and the datasource.

Duplicate widget ids are ignored. The layout must expand the treelist to items that include `fields.search`. An id with no search JSON does not query anything.

FormaLux is already wired this way: products on **AI Product Search**, articles on **Article Search**.

The articles widget currently returns `scUrl` as empty. Article cards will not have a working link until that attribute is filled in the Articles source and the source is reindexed. The ArticlePage template has no link field. The page URL is the item path, which Sitecore Search is expected to store in `scUrl`.

Article **Tags** is a treelist of tag items and is not an attribute on the articles widget. Product documents do not include a tag attribute. Content tags appear on cards only after those attributes are added to the widgets and reindexed. Until then, the answer shows **Grounded in:** with the datasource title, such as Ask FormaLux.

## Authoring fields

| Field | What it controls |
| --- | --- |
| Search | Primary widget and field mapping. One widget only. |
| Additional search sources | Other Search Experience items. Each item’s **Search** field is another widget. |
| Title, Subtitle, Welcome message, Input placeholder | Copy on the component. The title is also the primary source label when the layout does not include the datasource item name. |
| Suggested prompts | One question per line. |
| System instructions | Extra rules for the model. Used only when Foundry answers. |
| Enable web search | Default for **Include Web Search**. |

Rendering parameters:

| Parameter | Effect |
| --- | --- |
| Variant `Default` | Chat and results in one column. |
| Variant `Compact` | Chat with the latest matches in a side panel. |
| `columns` | `1` opens list view. Any other value opens cards. |

## Deploy

From the repository root, with the Sitecore CLI logged into the target environment:

```powershell
dotnet sitecore serialization push -n verticals_sli -i Project.IndustryVerticals -i Project.Healthcare-Content -i Project.Retail-Content
```

Run the same command with `-w` first to list creates and updates without writing them.

Publish the shared rendering and the pages you changed:

```powershell
dotnet sitecore publish item -n verticals_sli -p "/sitecore/layout/Renderings/Project/industry-verticals/Search/ConversationalSearch"
dotnet sitecore publish item -n verticals_sli -p "/sitecore/content/industry-verticals/nova-medical/Home/AI Doctor Assistant" --subitems
dotnet sitecore publish item -n verticals_sli -p "/sitecore/content/industry-verticals/nova-medical/Data/Search Experiences/AI Doctor Assistant"
dotnet sitecore publish item -n verticals_sli -p "/sitecore/content/industry-verticals/forma-lux/Home/AI Search"
dotnet sitecore publish item -n verticals_sli -p "/sitecore/content/industry-verticals/forma-lux/Data/Search Experiences/AI Product Search"
dotnet sitecore publish item -n verticals_sli -p "/sitecore/content/industry-verticals/forma-lux/Data/Search Experiences/Article Search"
```

The rendering host build must contain that host’s conversational search component, library, API route, and `ConversationalSearch` in `.sitecore/component-map.ts`. Regenerate the map from the host folder when the component folder is new there:

```powershell
npm run sitecore-tools:generate-map
```

Cloud editing for FormaLux uses the `nextjsstarter` rendering host. That host shows the component only after a retail build that includes it is deployed.

To refresh disk from Sitecore after an authoring change:

```powershell
dotnet sitecore serialization pull -n verticals_sli -i Project.Retail-Content -i Project.Healthcare-Content -i Project.IndustryVerticals
```
