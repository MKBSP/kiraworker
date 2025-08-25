import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface RewriteField {
  path: string;
  text: string;
}

export interface RewriteRequest {
  tone: string;
  language: string;
  fields: RewriteField[];
  styleHints?: string;
  clientName?: string;
}

export interface RewriteResponse {
  rewrites: RewriteField[];
  warnings?: string[];
}

export async function rewriteContent(request: RewriteRequest): Promise<RewriteResponse> {
  const { tone, language, fields, styleHints, clientName } = request;
  
  const systemPrompt = `You are a brand-safe copy editor specializing in financial services marketing. 

CRITICAL RULES:
- Keep the meaning and promises identical
- Preserve all product names, fees, ETAs, and legal wording exactly
- Never add new claims or promises
- Maintain the same call-to-action intent
- Replace {Bank} with the actual client name when provided
- Preserve {Country} and other template variables exactly

Your task: Rewrite provided strings to match the requested tone and language while following these guidelines:

TONE GUIDELINES:
- Corporate: Professional, authoritative, third-person, formal language
- Neutral: Clear, straightforward, balanced between formal and casual
- Friendly: Warm, conversational, first/second person, approachable

LANGUAGE REQUIREMENTS:
- en: American English, financial services terminology
- es: Latin American Spanish, appropriate for US Hispanic market
- pt: Brazilian Portuguese, appropriate for Brazilian community in US

${styleHints ? `STYLE HINTS: ${styleHints}` : ''}

Output format: Return JSON with "rewrites" array containing objects with "path" and "text" keys. Include "warnings" array if any content couldn't be safely rewritten.`;

  const userPrompt = `Client: ${clientName || 'Financial Institution'}
Tone: ${tone}
Language: ${language}

Fields to rewrite:
${JSON.stringify(fields, null, 2)}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        const result = JSON.parse(content.text);
        return {
          rewrites: result.rewrites || [],
          warnings: result.warnings || []
        };
      } catch (parseError) {
        console.error('Failed to parse Anthropic response:', parseError);
        return {
          rewrites: [],
          warnings: ['Failed to parse rewrite response']
        };
      }
    }
    
    return {
      rewrites: [],
      warnings: ['Unexpected response format from AI service']
    };
  } catch (error) {
    console.error('Anthropic API error:', error);
    return {
      rewrites: [],
      warnings: ['AI rewrite service temporarily unavailable']
    };
  }
}