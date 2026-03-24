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
You are an expert Customer Success Analyst at a digital subscription company. You have been provided with the raw chat summaries and resolution statuses from our customer support tickets over the ${timeframeTitle}.

Your job is to analyze this data and extract deep, actionable intelligence. We need to know where we are failing and where we can save users.

Provide your analysis in the following structured format (be concise, professional, and omit greetings/closings):

### 1. Primary Commonalities & Trends
(Identify the most frequent issues, confusing systems, or trending questions across the top buckets.)

### 2. Root Causes for Cancellations & Refunds
(Look specifically at the Cancel, Refund, Frustration, and Bug categories. What exactly is driving users to leave or ask for money back? Are there specific usability or billing problems?)

### 3. "Where Can We Save Us?" (Actionable Recommendations)
(Provide 3 highly specific, operational or product recommendations to reduce cancellation volume, fix bottlenecks, and immediately improve user retention based on this raw data.)

Here is the JSON dataset of the recent ticket summaries:
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
