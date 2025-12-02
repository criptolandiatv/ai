import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import 'dotenv/config';

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { LangfuseExporter } from 'langfuse-vercel';

const sdk = new NodeSDK({
  traceExporter: new LangfuseExporter({
    secretKey: 'sk-lf-ba21144e-1dc9-460c-bd44-6aae9b73c2f7',
    publicKey: 'pk-lf-1fae110e-5b2f-4855-a931-b2c0246cf5a6',
    baseUrl: 'https://us.cloud.langfuse.com', 
    }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// Simulated trace ID (would come from langfuse or similar in real usage)
const langfuseTraceId = 'trace-123';

async function main() {
  console.log('Starting parallel LLM calls with different telemetry metadata...\n');

  const model = openai('gpt-4o-mini');

  // Run three parallel calls with DIFFERENT names in telemetry
  const results = await Promise.all([
    generateText({
      model,
      prompt: 'Say the word "fruit" and nothing else',
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'fruit-generation',
        metadata: {
          langfuseTraceId,
          langfuseUpdateParent: false,
        },
      },
    }),
    generateText({
      model,
      prompt: 'Say the word "color" and nothing else',
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'color-generation',
        metadata: {
          langfuseTraceId,
          langfuseUpdateParent: false,
        },
      },
    }),
    generateText({
      model,
      prompt: 'Say the word "animal" and nothing else',
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'animal-generation',
        metadata: {
          langfuseTraceId,
          langfuseUpdateParent: false,
        },
      },
    }),
  ]);

  console.log('\n--- Results ---');
  console.log('Fruit result:', results[0].text);
  console.log('Color result:', results[1].text);
  console.log('Animal result:', results[2].text);

  console.log('\n--- Check the trace logs above ---');
  console.log('Expected: Three separate traces with functionIds:');
  console.log('  - fruit-generation');
  console.log('  - color-generation');
  console.log('  - animal-generation');
  console.log('\nActual: Check if all traces incorrectly use the same functionId');

  await sdk.shutdown();
}

main().catch(console.error);

