import {
  createProviderToolFactoryWithOutputSchema,
  lazySchema,
  zodSchema,
} from '@ai-sdk/provider-utils';
import { z } from 'zod';

/**
 * Configuration options for the Parallel Search tool.
 * These are developer-specified defaults that constrain tool behavior.
 */
export interface ParallelSearchConfig {
  /**
   * Default search type controlling the depth vs breadth tradeoff:
   * - "list": Broad search, 20 results, 1500 chars each (default)
   * - "targeted": Specific sources, 5 results, 16000 chars each
   * - "general": Balanced, 10 results, 9000 chars each
   * - "single_page": Deep extraction, 2 results, 30000 chars each
   */
  searchType?: 'list' | 'general' | 'single_page' | 'targeted';

  /**
   * Default list of domains to restrict search results to.
   * Example: ['wikipedia.org', 'nature.com']
   */
  includeDomains?: string[];

  /**
   * Default maximum number of results to return.
   * When not specified, defaults based on searchType.
   */
  maxResults?: number;

  /**
   * Default maximum characters per result.
   * When not specified, defaults based on searchType.
   */
  maxCharsPerResult?: number;
}

/**
 * Individual search result from Parallel AI
 */
export interface ParallelSearchResult {
  /** URL of the search result */
  url: string;
  /** Title of the search result */
  title: string;
  /** Extracted text excerpt/content from the page */
  excerpt: string;
  /** Publication date of the content (may be null) */
  publishDate?: string | null;
  /** Relevance score for the result */
  relevanceScore?: number;
}

/**
 * Successful response from Parallel Search API
 */
export interface ParallelSearchResponse {
  /** Unique identifier for this search request */
  searchId: string;
  /** Array of search results */
  results: ParallelSearchResult[];
}

/**
 * Error response from Parallel Search API
 */
export interface ParallelSearchError {
  /** Error type */
  error:
    | 'api_error'
    | 'rate_limit'
    | 'timeout'
    | 'invalid_input'
    | 'configuration_error'
    | 'unknown';
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Human-readable error message */
  message: string;
}

/**
 * Input parameters for Parallel Search.
 * These are the parameters the LLM can provide when calling the tool.
 */
export interface ParallelSearchInput {
  /**
   * Natural-language description of the web research goal.
   * Specifies the broad intent of the search query.
   * Should include any source or freshness guidance.
   * Limit to 200 characters.
   */
  objective: string;

  /**
   * Search type controlling the depth vs breadth tradeoff.
   */
  search_type?: 'list' | 'general' | 'single_page' | 'targeted';

  /**
   * List of keyword search queries (1-6 words each).
   * Related to the objective. Limited to 5 entries of 200 characters each.
   */
  search_queries?: string[];

  /**
   * List of domains to restrict search results to.
   * Example: ['wikipedia.org', 'nature.com']. Maximum 10 entries.
   */
  include_domains?: string[];

  /**
   * Maximum number of results to return.
   */
  max_results?: number;

  /**
   * Maximum characters per result.
   */
  max_chars_per_result?: number;
}

export type ParallelSearchOutput = ParallelSearchResponse | ParallelSearchError;

const parallelSearchInputSchema = lazySchema(() =>
  zodSchema(
    z.object({
      objective: z
        .string()
        .describe(
          'Natural-language description of the web research goal. Specifies the broad intent of the search query. Include any source or freshness guidance. Limit to 200 characters.',
        ),

      search_type: z
        .enum(['list', 'general', 'single_page', 'targeted'])
        .optional()
        .describe(
          'Search type controlling depth vs breadth: "list" for broad search (20 results), "targeted" for specific sources (5 results), "general" for balanced (10 results), "single_page" for deep extraction (2 results).',
        ),

      search_queries: z
        .array(z.string())
        .optional()
        .describe(
          'List of keyword search queries (1-6 words each). Related to the objective. Limited to 5 entries of 200 characters each. Usually 1-3 queries are ideal.',
        ),

      include_domains: z
        .array(z.string())
        .optional()
        .describe(
          "List of domains to restrict search results to. Example: ['wikipedia.org', 'nature.com']. Maximum 10 entries.",
        ),

      max_results: z
        .number()
        .optional()
        .describe(
          'Maximum number of results to return. When not specified, defaults based on search_type.',
        ),

      max_chars_per_result: z
        .number()
        .optional()
        .describe(
          'Maximum characters per result. When not specified, defaults based on search_type.',
        ),
    }),
  ),
);

const parallelSearchOutputSchema = lazySchema(() =>
  zodSchema(
    z.union([
      // Success response
      z.object({
        searchId: z.string(),
        results: z.array(
          z.object({
            url: z.string(),
            title: z.string(),
            excerpt: z.string(),
            publishDate: z.string().nullable().optional(),
            relevanceScore: z.number().optional(),
          }),
        ),
      }),
      // Error response
      z.object({
        error: z.enum([
          'api_error',
          'rate_limit',
          'timeout',
          'invalid_input',
          'configuration_error',
          'unknown',
        ]),
        statusCode: z.number().optional(),
        message: z.string(),
      }),
    ]),
  ),
);

export const parallelSearchToolFactory =
  createProviderToolFactoryWithOutputSchema<
    ParallelSearchInput,
    ParallelSearchOutput,
    ParallelSearchConfig
  >({
    id: 'gateway.parallel_search',
    inputSchema: parallelSearchInputSchema,
    outputSchema: parallelSearchOutputSchema,
  });

/**
 * Creates a Parallel Search tool for searching the web using Parallel AI's Search API.
 *
 * The Parallel Search API takes a natural language objective and returns
 * relevant excerpts optimized for LLMs, replacing multiple keyword searches
 * with a single call for broad or complex queries.
 *
 * @param config - Optional configuration to constrain tool behavior
 * @returns A provider-defined tool that can be used with the AI SDK
 *
 * @example
 * ```typescript
 * import { gateway, gatewayTools } from '@ai-sdk/gateway';
 *
 * const result = await generateText({
 *   model: gateway('anthropic/claude-sonnet-4'),
 *   tools: {
 *     parallelSearch: gatewayTools.parallelSearch({
 *       searchType: 'general',
 *       includeDomains: ['wikipedia.org'],
 *     }),
 *   },
 *   prompt: 'Search for information about the founding of the United Nations',
 * });
 * ```
 */
export const parallelSearch = (
  config: ParallelSearchConfig = {},
): ReturnType<typeof parallelSearchToolFactory> =>
  parallelSearchToolFactory(config);
