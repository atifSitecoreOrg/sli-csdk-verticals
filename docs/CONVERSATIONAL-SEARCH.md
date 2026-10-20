# Conversational Search

Standalone Page Builder component that lets a visitor ask a question in plain language and get answers grounded in one or more SitecoreAI Search indexes.

Nova Medical ships it on **AI Doctor Assistant** (`/AI-Doctor-Assistant`). Doctor Finder stays the directory search. The same Sitecore template and rendering can be reused on any site that has a Search Experience index. The React component, API route, and search library currently live in `industry-verticals/healthcare`. Copy those three areas into another host before you drop the rendering there.

## Purpose

The existing Search Experience component is a directory: filters, keywords, and result cards. Conversational Search sits in front of the same indexes and answers questions such as “Who can help with recurring migraines?” or “Which specialist should I see for a sports knee injury?”

It is designed for SitecoreAI and Pages:

- Authors drop one rendering on a page and point it at a Search Experience datasource.
- Answers and profile cards come from indexed Sitecore content. The assistant does not invent doctor names, bios, or profile URLs.
- Extra indexes (articles, services, products) can be attached later without a new component.
- Web search is optional and off by default. Directory answers stay grounded in Sitecore even when web search is on.
- The experience works with no model key. Microsoft Foundry supplies the written conversation. SitecoreAI Search remains the source of the records.

## What already works without Foundry

Nothing extra is required for the Nova Medical demo. With the site’s existing `SITECORE_EDGE_CONTEXT_ID`, the component:

1. Reads the Search Experience index and field mapping from the datasource (`search`) and any extra indexes from `additionalSearchSources`.
2. Loads the index catalog (categories such as Neurologist, Cardiologist, and their counts) through Sitecore Search.
3. Maps the question onto those categories. “Migraines” and “headaches” resolve to Neurologist. “Knee injury” resolves to Orthopedic Surgeon. A person’s name is matched directly.
4. Returns real indexed profiles as cards or a list, with a short written summary, specialty chips, and follow-up questions the visitor can click.
5. Keeps the last turns of the chat so a follow-up can reuse the previous topic.
6. Offers an **Include Web Search** toggle. That path does not use the Foundry key. It uses Tavily when `TAVILY_API_KEY` is set, otherwise the free DuckDuckGo Instant Answer API.

The API response `provider` is `grounded-fallback` on this path. The answer text is assembled from the matched records (name, specialty, and a trimmed bio). It is accurate to the index, and the sentence patterns are fixed.

`systemInstructions` on the datasource are stored and sent, but they are applied only when Foundry actually answers. Without a working model call they do not change the reply.

## What Foundry changes

GitHub Models was retired on 30 July 2026. A GitHub personal access token no longer reaches a chat model. Microsoft Foundry is the replacement: you deploy a model in Azure, and this component calls that deployment’s OpenAI-compatible chat completions endpoint.

When the Foundry call succeeds, the page, datasource, and indexes stay in place. The API gives the model two tools:

| Tool | When it runs | What it returns |
| --- | --- | --- |
| `search_sitecore_index` | Every question | Profiles from the configured SitecoreAI Search index. The model must call this before it answers. |
| `search_external_web` | Only if **Include Web Search** is on | Public web snippets, still shown separately from directory cards |

With Foundry connected, the model:

- Reads up to the last six chat turns and writes an answer for that question, instead of filling a fixed template.
- Chooses which returned records to show as cards.
- Writes the follow-up chips.
- Follows the datasource **System instructions** (tone, disclaimers, what to refuse).
- Still cannot cite a doctor who was not returned by Sitecore Search. The cards are the tool results, not text the model made up.

The API response `provider` becomes `openai-compatible`. If the key is missing, the call fails, or the endpoint is unreachable, the API falls back to the grounded engine above and the page keeps working. The response `provider` is `grounded-fallback` again.

Foundry usage is billed to the Azure subscription. Deploy `gpt-5-mini`. `gpt-4o-mini` is deprecated and is not the model for this assistant.

## Get a Foundry key

You need an Azure subscription with a payment method, and permission to deploy a model in Microsoft Foundry.

1. Open [Microsoft Foundry](https://ai.azure.com) and sign in with the Azure account. If the portal opens in the classic experience, switch to the new Foundry experience from the upper-right control.
2. Create or open a Foundry project.
3. Deploy **gpt-5-mini** from the model catalog. It supports tool calling. Leave the deployment name as `gpt-5-mini` unless you need another name. Wait until the deployment status is Succeeded. Do not deploy `gpt-4o-mini`.
4. Open the deployment and copy three values. They are not interchangeable:
   - **Endpoint.** The resource host, for example `https://YOUR-RESOURCE.openai.azure.com`. Foundry may also show `https://YOUR-RESOURCE.services.ai.azure.com`. Either host works when you append the path in the next section.
   - **Key.** Key 1 from the deployment or project keys. This is the bearer token. It is not a GitHub personal access token.
   - **Deployment name.** The name you gave the deployment. The catalog model name is not accepted unless you deployed it under that exact name.
5. In the Foundry playground, send a short prompt with that deployment. A normal text reply means the key and deployment are live. Do not continue to the rendering host until that playground call succeeds.

Treat the key as a server secret. Do not prefix it with `NEXT_PUBLIC_`, store it in a Sitecore field, or commit `.env.local`.

## Connect Foundry to the experience

Two connections are required. Foundry only writes. The Search Experience datasource decides which SitecoreAI Search index is queried.

### 1. Point the rendering host at the deployment

On the machine that runs the healthcare host, edit `industry-verticals/healthcare/.env.local`. Remove `GITHUB_MODELS_TOKEN` and `GITHUB_TOKEN` if they are present. Those names are read before `OPENAI_API_KEY`, so a leftover GitHub token is sent to Foundry and the call falls back to the templated summary.

```powershell
AI_BASE_URL=https://YOUR-RESOURCE.services.ai.azure.com/openai/v1/chat/completions
AI_MODEL=gpt-5-mini
OPENAI_API_KEY=your-foundry-key
```

`AI_BASE_URL` must be the chat completions URL on your resource host. Foundry’s code sample often shows `https://YOUR-RESOURCE.services.ai.azure.com/openai/v1/responses`. This assistant calls chat completions, so replace `responses` with `chat/completions`. `AI_MODEL` must be the deployment name. If you renamed the deployment in Foundry, use that name instead of `gpt-5-mini`. The host sends the key as `Authorization: Bearer`. The request does not set `temperature`, because `gpt-5-mini` only accepts the default.

Optional, unrelated to Foundry:

```powershell
TAVILY_API_KEY=tvly-...
```

Restart `npm run dev` from `industry-verticals/healthcare`. A content publish is not required for the key to take effect.

On XM Cloud or Vercel, set `AI_BASE_URL`, `AI_MODEL`, and `OPENAI_API_KEY` on the **healthcare** rendering host, then redeploy or restart that host. `POST /api/conversational-search` is the only route that reads them.

### 2. Point the component at a Search Experience

The Nova Medical page is already wired:

| Piece | Where it lives |
| --- | --- |
| Page | `/sitecore/content/industry-verticals/nova-medical/Home/AI Doctor Assistant` (`/AI-Doctor-Assistant`) |
| Rendering | `ConversationalSearch` in `headless-main` |
| Datasource | `/sitecore/content/industry-verticals/nova-medical/Data/Search Experiences/AI Doctor Assistant` |
| Index | The Doctors SitecoreAI Search index, selected on the datasource **Search** field, with title, image, description, type, and link mapped |

To attach another index, edit that datasource. **Search** is the primary index. **Additional search sources** accepts other Search Experience items; each item’s own **Search** field becomes another index. Duplicate index IDs are ignored. Publish the datasource after changing it.

For a new page, insert **ConversationalSearch**, create a **Conversational Search** datasource under the site’s `Data/Search Experiences` folder, select the index on **Search**, and publish both items. The Foundry key is shared by every page on that rendering host. Each page chooses its own indexes through its datasource.

### 3. Confirm the two sides are connected

Open [http://localhost:3000/AI-Doctor-Assistant](http://localhost:3000/AI-Doctor-Assistant) and ask “I’ve had chest tightness when I climb stairs.”

- Foundry is connected when the reply is written for that question and the cards are indexed cardiologists. The API `provider` is `openai-compatible`.
- Foundry is not connected when the cards are right but the sentences follow the fixed “Based on your question, I matched…” pattern. The API `provider` is `grounded-fallback`. Check that the playground call works, that `GITHUB_MODELS_TOKEN` is gone, and that `AI_MODEL` is the deployment name. The rendering host log prints `Conversational search model call failed` with the HTTP status.

## Use it on Nova Medical

Open [http://localhost:3000/AI-Doctor-Assistant](http://localhost:3000/AI-Doctor-Assistant) with `npm run dev` running in `industry-verticals/healthcare`.

Visitors can:

- Click a suggested prompt, or type a question and press **Ask AI**.
- Switch **Cards** and **List**.
- Turn on **Include Web Search** for that session. The datasource checkbox sets the default.
- Click a follow-up chip to continue the thread.
- Open **View profile** on a card. The link is the indexed doctor URL.
- Press **Reset** to clear the thread.

Authors edit the experience on the datasource item:

`/sitecore/content/industry-verticals/nova-medical/Data/Search Experiences/AI Doctor Assistant`

| Field | What it controls |
| --- | --- |
| Search | Primary SitecoreAI Search index and field mapping (title, image, description, type, link). Nova Medical uses the Doctors index. |
| Additional search sources | Other Search Experience items. Each one’s `search` field becomes another index. Duplicate index IDs are ignored. |
| Title, Subtitle, Welcome message, Input placeholder | Copy on the component. Editable inline in Pages. |
| Suggested prompts | One question per line. Shown as starter chips before the first question. |
| System instructions | Extra rules for the model. Used only when Foundry answers. |
| Enable web search | Default state of the visitor’s **Include Web Search** checkbox. |

Rendering parameters:

| Parameter | Effect |
| --- | --- |
| Variant `Default` | Chat and results in one column. This is what AI Doctor Assistant uses. |
| Variant `Compact` | Chat with the latest matches in a side panel. |
| `pageSize` | Maximum cards per answer. Defaults to 6, capped at 12. |
| `columns` | `1` opens the results in list view. Any other value opens cards. |

In Pages, while editing, the component also shows which indexes are connected.

## Deploy

The items are already serialized and, on the connected `verticals_sli` environment, have been pushed and published. Use this when you need to deploy them again or onto another environment.

From the repository root, with the Sitecore CLI logged in:

```powershell
dotnet sitecore serialization push -n verticals_sli -i Project.IndustryVerticals -i Project.Healthcare-Content
```

Run the same command with `-w` first if you want the list of creates and updates without writing them.

Publish the template (with children), the rendering, the datasource, Available Renderings, and the AI Doctor Assistant page:

```powershell
dotnet sitecore publish item -n verticals_sli -p "/sitecore/templates/Project/industry-verticals/Components/Search Experience/Conversational Search" --subitems
dotnet sitecore publish item -n verticals_sli -p "/sitecore/layout/Renderings/Project/industry-verticals/Search/ConversationalSearch"
dotnet sitecore publish item -n verticals_sli -p "/sitecore/content/industry-verticals/nova-medical/Data/Search Experiences/AI Doctor Assistant"
dotnet sitecore publish item -n verticals_sli -p "/sitecore/content/industry-verticals/nova-medical/Presentation/Available Renderings/Page Content"
dotnet sitecore publish item -n verticals_sli -p "/sitecore/content/industry-verticals/nova-medical/Home/AI Doctor Assistant" --subitems
```

The rendering host must be running a build that contains:

- `industry-verticals/healthcare/src/components/conversational-search/ConversationalSearch.tsx`
- `industry-verticals/healthcare/src/lib/conversational-search/`
- `industry-verticals/healthcare/src/pages/api/conversational-search.ts`
- `ConversationalSearch` registered in `industry-verticals/healthcare/.sitecore/component-map.ts`

Regenerate the map from `industry-verticals/healthcare` if the component folder is new on that machine:

```powershell
npm run sitecore-tools:generate-map
```

### Add it to another page or another site

1. In Pages, open the page and insert **ConversationalSearch** into `headless-main` (it is under the site’s Page Content available renderings on Nova Medical).
2. Create a datasource from **Conversational Search** under the site’s `Data/Search Experiences` folder. The folder insert option includes this template.
3. On **Search**, pick the SitecoreAI Search index and map title, image, description, type, and link the same way a normal Search Experience does.
4. Publish the datasource and the page.
5. For a host other than healthcare, copy the component folder, `src/lib/conversational-search`, and `src/pages/api/conversational-search.ts` into that host, run `sitecore-tools:generate-map`, and deploy the host. The shared template and rendering item do not need to be duplicated.

If the datasource has no index selected, the assistant says so and returns no cards.
