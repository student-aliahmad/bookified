import { HandleUploadBody } from '@vercel/blob/client';
import {NextResponse} from "next/server";
import { auth } from '@clerk/nextjs/server';
import { handleUpload } from '@vercel/blob/client';
import { MAX_FILE_SIZE } from '@/lib/constants';



export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;
    console.log("Token:", process.env.BLOB_READ_WRITE_TOKEN);
console.log("Exists:", !!process.env.BLOB_READ_WRITE_TOKEN);
    try {
        const token = process.env.VERCEL_BLOB_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;

        if (!token) {
            throw new Error('Missing Vercel Blob token. Set VERCEL_BLOB_TOKEN or BLOB_READ_WRITE_TOKEN.');
        }

        const jsonResponse = await handleUpload({ 
            token,
            body,
            request,
            onBeforeGenerateToken: async () => {
            const { userId } = await auth();

            if(!userId) {
                throw new Error('Unauthorized: User not authenticated');
            }

            return {
                allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
                addRandomSuffix: true,
                maximumSizeInBytes: MAX_FILE_SIZE,
                tokenPayload: JSON.stringify({ userId })
            }
        },
        onUploadCompleted: async ({ blob, tokenPayload}) => {
            console.log('File uploaded to blob: ', blob.url)

            const payload = tokenPayload ? JSON.parse(tokenPayload): null
            const userId = payload?.userId;

            //TODO : PostHog

           
        }
    })
            return NextResponse.json(jsonResponse)
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        const status = message.includes('Unauthorized') ? 401 : 500;
       return NextResponse.json(
        { error: message },
        { status }
    );
    }

}