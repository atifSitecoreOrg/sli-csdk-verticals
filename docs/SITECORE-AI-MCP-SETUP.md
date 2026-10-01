# Sitecore AI Marketer MCP Setup

This document describes how to set up and use the **Sitecore AI Marketer MCP** (Model Context Protocol) with Cursor IDE against an XM Cloud tenant for this industry-verticals repo.

## What is Marketer MCP?

The Marketer MCP is Sitecore's official Model Context Protocol server for marketing. It connects AI agents to Sitecore tools through the Agent APIs, providing secure access across the entire digital experience platform.

With the Marketer MCP, you can:
- Create pages and add components using natural language
- Manage campaigns and run marketing automation
- Update content and handle content management
- Work with AI-powered content creation

## Prerequisites

- **Sitecore XM Cloud subscription** with access to the industry-verticals tenant
- **Sitecore Cloud Portal Account** with appropriate permissions
- **Cursor IDE** (with MCP support)

## Setting Up Marketer MCP in Cursor

### Step 1: Open MCP Settings

1. Open **Cursor IDE**
2. Go to **Settings > MCP**
3. Click **New MCP Server**

### Step 2: Add MCP Configuration

Copy and paste the following configuration into your `mcp.json` file:

```json
{
  "mcpServers": {
    "marketer": {
      "url": "https://edge-platform.sitecorecloud.io/mcp/marketer-mcp-prod",
      "auth": "external"
    }
  }
}
```

Save the file.

### Step 3: Connect to the MCP Server

1. The Marketer MCP now appears in your list of available tools
2. Click **Connect**
3. Cursor will prompt you to confirm opening an external website
4. Click **Open** to launch the authorization page in your browser

### Step 4: Authorize Access

1. In the **Marketer MCP authorization request** dialog, click **Allow Access**
2. Select the **organization** and **tenant** you want to use (Brother site tenant)
3. When prompted, click **Open Cursor** to complete the setup

## Verification

After setup, under **Tools**, you should see the Marketer MCP tools enabled and ready to use.

## Available Tools

The Marketer MCP provides tools grouped by use case:

### Content Creation
- Create pages
- Add components to pages
- Update content fields
- Manage media

### Campaign Management
- Plan campaign strategy
- Run marketing automation
- Design components

### Content Management
- Publish content
- Manage workflows
- Get performance insights

## Example Prompts for Brother Site

Once connected, you can interact with the Brother site using natural language:

### Create a New Page
```
Create a new landing page titled "Brother Label Printers" under the Products section
```

### Add Components
```
Add a hero banner component to the Brother Label Printers page with the title "Professional Labeling Solutions"
```

### Update Content
```
Update the hero banner on the homepage to show "More time for life" as the tagline
```

### Get Site Information
```
List all pages under the Brother site in XM Cloud
```

### Search Content
```
Find all products tagged with "label printer" on the Brother site
```

## Troubleshooting

### "Resource parameter is required" Error

If you encounter this error during OAuth authentication:

1. Copy the entire URL shown in the dialog
2. Append the following resource parameter to the end:
   ```
   &resource=https%3A%2F%2Fedge-platform.sitecorecloud.io%2Fmcp%2Fmarketer-mcp-prod
   ```
3. Open the updated URL in a new browser window to continue authentication

### Connection Issues

- Ensure you have an active Sitecore Cloud Portal session
- Verify your account has permissions for the Brother site tenant
- Check your network allows connections to `edge-platform.sitecorecloud.io`

### Token Expiration

The MCP uses OAuth tokens that may expire. If you see authentication errors:
1. Disconnect the MCP server in Cursor settings
2. Reconnect and re-authorize

## Security

The Marketer MCP uses:
- **OAuth 2.0 authorization code flow** with interactive user authentication via Sitecore Identity
- **Tenant-level isolation** ensuring actions only affect your selected tenant
- **Secure token management** with automatic refresh

## Related Documentation

### Internal Docs
- [Sitecore Authoring API Guide](./SITECORE-AUTHORING-API.md) — bulk imports and template management
- [Documentation index](./README.md)

### Official Sitecore Docs
- [Sitecore AI Marketer MCP Documentation](https://doc.sitecore.com/sai/en/users/sitecoreai/marketer-mcp.html)
- [Marketer MCP and Agent API Overview](https://doc.sitecore.com/sai/en/users/sitecoreai/marketer-mcp-and-agent-api-overview.html)
- [Integrating Sitecore with Agentic Platforms](https://doc.sitecore.com/sai/en/users/sitecoreai/integrating-sitecore-with-agentic-platforms.html)
- [Authoring API Walkthrough](https://doc.sitecore.com/sai/en/developers/sitecoreai/walkthrough--enabling-and-authorizing-requests-to-the-authoring-and-management-api.html)

## Next Steps

After setting up the Marketer MCP:

1. Test the connection by asking for a list of available tools
2. Query the Brother site content structure
3. Try creating or modifying content using natural language prompts
4. Document any site-specific prompts that work well for your workflow

