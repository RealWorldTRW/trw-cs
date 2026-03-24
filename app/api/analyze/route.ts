import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || "dummy",
        });

        const { reports, timeframeTitle } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        if (!reports || reports.length === 0) {
            return NextResponse.json({
                analysis: "No data available for analysis in this timeframe.",
            });
        }

        const reportsForAnalysis = reports.map((r: any) => ({
            category: r.category,
            status: r.resolution_status,
            summary: r.summary,
            insight: r.quick_insight || undefined,
        }));

        const prompt = `
You are an executive CS analyst. You have raw chat summaries from our tickets over the ${timeframeTitle}.

Analyze this data and provide insights. 
CRITICAL RULE: DO NOT WAFFLE. The reader has no time. Use ONLY extremely short bullet points (max 5-10 words per bullet). No paragraphs. No fluff.

Format:

### 1. Commonalities
- [Short point 1]
- [Short point 2]

### 2. Why Users Cancel/Refund
- [Root cause 1]
- [Root cause 2]

### 3. Quick Wins (Save Us)
- [Action 1]
- [Action 2]

Raw Data:
${JSON.stringify(reportsForAnalysis)}
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a brilliant, data-driven Customer Success Analyst and Director.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.3,
        });

        const analysis = response.choices[0]?.message?.content || "No analysis generated.";

        return NextResponse.json({ analysis });
    } catch (error) {
        console.error('Error analyzing reports:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI analysis' },
            { status: 500 }
        );
    }
}
