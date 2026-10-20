import type { NextApiRequest, NextApiResponse } from 'next';
import scConfig from 'sitecore.config';
import { runConversationalSearch } from '@/lib/conversational-search/orchestrator';
import {
  ConversationalSearchRequest,
  ConversationalSearchResponse,
} from '@/lib/conversational-search/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConversationalSearchResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Partial<
      ConversationalSearchRequest & { contextId?: string; edgeUrl?: string }
    >;

    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (!question) {
      return res.status(400).json({ error: 'A question is required.' });
    }

    const contextId =
      body.contextId ||
      scConfig?.api?.edge?.contextId ||
      scConfig?.api?.edge?.clientContextId ||
      process.env.SITECORE_EDGE_CONTEXT_ID ||
      process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID ||
      '';

    const edgeUrl = body.edgeUrl || scConfig?.api?.edge?.edgeUrl;

    if (!contextId) {
      return res.status(500).json({
        error: 'Sitecore Edge Context ID is not configured.',
      });
    }

    const result = await runConversationalSearch(
      {
        question,
        history: Array.isArray(body.history) ? body.history : [],
        sources: Array.isArray(body.sources) ? body.sources : [],
        systemInstructions: body.systemInstructions,
        enableWebSearch: Boolean(body.enableWebSearch),
        maxResults: body.maxResults,
        locale: body.locale,
      },
      contextId,
      edgeUrl
    );

    return res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to process conversational search request.';
    return res.status(500).json({ error: message });
  }
}
