import { NextResponse } from 'next/server';
import { searchBookSegments } from '@/lib/actions/book.actions';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const toolCalls = Array.isArray(body?.toolCalls) ? body.toolCalls : [];
        const searchCall = toolCalls.find((call: any) => {
            const name = String(call?.function?.name ?? call?.name ?? '').toLowerCase();
            return name.includes('search') && name.includes('book');
        });

        if (!searchCall) {
            return NextResponse.json({ result: 'No search book tool call was provided.' });
        }

        const parameters = searchCall?.function?.parameters ?? searchCall?.parameters ?? {};
        const bookId = String(parameters?.bookId ?? parameters?.book_id ?? '').trim();
        const query = String(parameters?.query ?? parameters?.question ?? '').trim();
        const segmentCount = Number(parameters?.segmentCount ?? parameters?.segment_count ?? 3);

        const segmentedMatches = await searchBookSegments(bookId, query, segmentCount);

        if (!segmentedMatches.success || !Array.isArray(segmentedMatches.data) || segmentedMatches.data.length === 0) {
            return NextResponse.json({ result: 'No information found about this topic.' });
        }

        const combinedText = segmentedMatches.data
            .map((segment: any) => {
                const content = typeof segment?.content === 'string' ? segment.content.trim() : '';
                const index = segment?.segmentIndex ?? '';
                return content ? `Segment ${index}: ${content}`.trim() : '';
            })
            .filter(Boolean)
            .join('\n\n');

        return NextResponse.json({ result: combinedText || 'No information found about this topic.' });
    } catch (error) {
        console.error('Error handling Vapi search-book tool call:', error);
        return NextResponse.json(
            { result: 'No information found about this topic.' },
            { status: 500 }
        );
    }
}


