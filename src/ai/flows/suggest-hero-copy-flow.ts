
'use server';
/**
 * @fileOverview Provides AI-powered suggestions for hero section copy.
 *
 * - suggestHeroCopy - A function that generates copy suggestions.
 * - SuggestHeroCopyInput - The input type for the suggestHeroCopy function.
 * - SuggestHeroCopyOutput - The return type for the suggestHeroCopy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHeroCopyInputSchema = z.object({
  copyType: z.enum(['headline', 'subHeadline', 'ctaText'])
    .describe('The type of copy to suggest (e.g., headline, subHeadline, ctaText).'),
  currentText: z.string().optional()
    .describe('Optional current text or keywords to base suggestions on.'),
  productName: z.string().default('SecureTomorrow Life Insurance').describe('The name of the product or service.'),
  productDescription: z.string().default('Provides financial security for families. Offers The Real Reward™: 10% cash back after the first year and a free legal will. Focuses on simple application and flexible cover.').describe('A brief description of the product or service.'),
  count: z.number().default(3).describe('The number of suggestions to generate.'),
  campaignFocus: z.string().optional().describe('Optional campaign focus, theme, or keywords to guide the AI suggestions (e.g., "young families," "holiday promotion," "easy application process").'),
});
export type SuggestHeroCopyInput = z.infer<typeof SuggestHeroCopyInputSchema>;

const SuggestHeroCopyOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of generated copy suggestions.'),
});
export type SuggestHeroCopyOutput = z.infer<typeof SuggestHeroCopyOutputSchema>;

export async function suggestHeroCopy(input: SuggestHeroCopyInput): Promise<SuggestHeroCopyOutput> {
  return suggestHeroCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestHeroCopyPrompt',
  input: {schema: SuggestHeroCopyInputSchema},
  output: {schema: SuggestHeroCopyOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in compelling and concise text for landing page hero sections for a product called "{{productName}}".
Product Description: {{productDescription}}

The user needs suggestions for a {{copyType}}.
{{#if campaignFocus}}
The current campaign focus or keywords are: "{{campaignFocus}}". Please heavily tailor your suggestions to align with this focus. This might describe a target audience, a specific product feature to highlight, a seasonal promotion, or key marketing keywords.
{{/if}}
{{#if currentText}}
They have provided the following current text or keywords as inspiration: "{{currentText}}". Generate suggestions that are variations or improvements on this, or inspired by it, while also considering the campaign focus if provided.
{{else}}
Please generate fresh suggestions for a {{copyType}}{{#if campaignFocus}}, keeping the campaign focus "{{campaignFocus}}" in mind{{/if}}.
{{/if}}

Generate {{count}} distinct suggestions. Each suggestion should be suitable for a hero section.

If generating headlines: They should be impactful and grab attention.
If generating sub-headlines: They should complement a headline and provide more context or a key benefit, often enclosed in parentheses.
If generating CTA texts: They should be action-oriented and clear.

Return the suggestions in the specified JSON format.
`,
});

const suggestHeroCopyFlow = ai.defineFlow(
  {
    name: 'suggestHeroCopyFlow',
    inputSchema: SuggestHeroCopyInputSchema,
    outputSchema: SuggestHeroCopyOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        return { suggestions: [] };
    }
    return output;
  }
);

