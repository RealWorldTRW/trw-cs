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

        // Intelligent Sampling: Prevent sending 5000+ records to OpenAI
        // 1. Sort all reports by human effort (count_conversation_parts) descending
        // 2. Prioritize escalations and threads with actual friction reasons
        const sortedReports = [...reports].sort((a: any, b: any) =>
            (b.count_conversation_parts || 0) - (a.count_conversation_parts || 0)
        );

        const escalations = sortedReports.filter(r => r.resolution_status === 'escalated_to_support');
        const others = sortedReports.filter(r => r.resolution_status !== 'escalated_to_support');

        // Take top 150 escalations, and top 50 other high-effort threads (Max 200 records total)
        const sampledReports = [...escalations.slice(0, 150), ...others.slice(0, 50)];

        const reportsForAnalysis = sampledReports.map((r: any) => ({
            category: r.category,
            status: r.resolution_status,
            friction_reason: r.leaky_bucket_reason,
            tags: r.tags,
            effort_parts: r.count_conversation_parts,
            summary: r.summary,
        }));

        const prompt = `
You are an executive CS operator. You have raw chat routing intelligence from our tickets over the ${timeframeTitle}.

Analyze this data. 
CRITICAL RULE: DO NOT WAFFLE. The reader has no time. Use ONLY extremely short bullet points (max 5-10 words per bullet). No paragraphs. No fluff. Every recommendation must tie to a specific friction pattern found in the tags or friction_reason fields.

Format EXACTLY like this:

### 1. Top Friction Points
- [Category A]: [Specific Root Cause finding]
- [Category B]: [Specific Root Cause finding]

### 2. What To Fix Next
- [Actionable fix for Pattern 1]
- [Actionable fix for Pattern 2]

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
