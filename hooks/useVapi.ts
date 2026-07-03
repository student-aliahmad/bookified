import { startVoiceSession } from "@/lib/actions/session.actions";
import { ASSISTANT_ID, DEFAULT_VOICE, VOICE_SETTINGS } from "@/lib/constants";
import {IBook, Messages} from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import Vapi from '@vapi-ai/web'
import { getVoice } from "@/lib/utils";

type VapiTranscriptMessage = {
    type: 'transcript' | "transcript[transcriptType='final']";
    transcriptType?: 'partial' | 'final';
    role?: 'assistant' | 'user';
    transcript?: string;
};

const isTranscriptMessage = (message: unknown): message is VapiTranscriptMessage => {
    if (typeof message !== 'object' || !message) return false;

    const maybeMessage = message as Record<string, unknown>;

    return typeof maybeMessage.type === 'string' && (
        maybeMessage.type === 'transcript' ||
        maybeMessage.type === "transcript[transcriptType='final']"
    );
};

export type CallStatus = 'idle' | 'connecting' | 'starting' | 'listening' | 'thinking' | 'speaking';

const useLatestRef = <T>(value: T) => {
    const ref = useRef(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref;
};

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;

let vapi: InstanceType<typeof Vapi>;

function getVapi() {
         if(!vapi) {
            if(!VAPI_API_KEY) {
                throw new Error('NEXT_PUBLIC_VAPI_API_KEY not found. Please set it in the .env file.')
            }
            vapi = new Vapi(VAPI_API_KEY);
         }
         return vapi;
}

export const useVapi = (book: IBook) => {
    const { userId } = useAuth();
    //TODO: Implement limits

    const [status,setStatus] = useState<CallStatus>('idle')
    const [messages, setMessages] = useState<Messages[]>([]);
    const [currentMessage,setCurrentMessage] = useState('')
    const [currentUserMessage, setCurrentUserMessage] = useState('')
    const [duration, setDuration] = useState(0);
    const [limitError, setLimitError] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimerRef = useRef<NodeJS.Timeout | null>(null);
    const sessionIdRef = useRef<string | null>(null);
    const isStoppingRef = useRef<boolean>(false);

    const bookRef = useLatestRef(book);
    const durationRef = useLatestRef(duration);
    const voice = book.persona || DEFAULT_VOICE;

    const isActive = status === 'listening' || status === 'thinking' || status === 'speaking' || status === 'starting';

    //* Limits:
    // const maxDurationRef = useLatestRef(limits.maxSesionMinutes * 60)
    // const mxDurationSeconds
    // const remainingSeconds
    // const showTimeWarning

    useEffect(() => {
        const handleMessage = (message: unknown) => {
            if (!isTranscriptMessage(message)) return;

            const role = message.role === 'assistant' ? 'assistant' : 'user';
            const transcript = message.transcript?.trim() ?? '';
            const isFinal = message.type === "transcript[transcriptType='final']" || message.transcriptType === 'final';

            if (!transcript) return;

            if (role === 'user') {
                if (isFinal) {
                    setStatus('thinking');
                    setCurrentUserMessage('');
                    setMessages((prev) => {
                        const isDuplicate = prev.some((entry) => entry.role === 'user' && entry.content === transcript);
                        return isDuplicate ? prev : [...prev, { role: 'user', content: transcript }];
                    });
                    return;
                }

                setStatus('listening');
                setCurrentUserMessage(transcript);
                return;
            }

            if (isFinal) {
                setStatus('listening');
                setCurrentMessage('');
                setMessages((prev) => {
                    const isDuplicate = prev.some((entry) => entry.role === 'assistant' && entry.content === transcript);
                    return isDuplicate ? prev : [...prev, { role: 'assistant', content: transcript }];
                });
                return;
            }

            setStatus('speaking');
            setCurrentMessage(transcript);
        };

        if (!VAPI_API_KEY) return;

        const vapiInstance = getVapi();
        vapiInstance.on('message', handleMessage);

        return () => {
            vapiInstance.off?.('message', handleMessage);
        };
    }, []);

    const start = async () => {
        if(!userId) return setLimitError('Please login to start a conversation');

        setLimitError(null);
        setStatus('connecting');

        try {
            const result = await startVoiceSession(userId, book._id);

            if(!result.success){
                setLimitError(result.error || 'Session limit reached. Please upgrade your plan');
                setStatus('idle');
                return;
            }

            sessionIdRef.current = result.sessionId || null;
            
            const firstMessage = 'Hey, good to meet you. Quick question, before we dive in: have you actually read ${book.title} yet? or are we starting fresh ?'
            
            await getVapi().start(ASSISTANT_ID, {
                firstMessage,
                variableValues: {
                    title: book.title, author: book.author, bookId: book._id
                },
                // voice: {
                //     provider: '11labs' as const,
                //     voiceId: getVoice(voice).id,
                //     model: "eleven_turbo_v2_5" as const,
                //     stability: VOICE_SETTINGS.stability,
                //     similarityBoost: VOICE_SETTINGS.similarityBoost,
                //     style: VOICE_SETTINGS.style,
                //     useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
                // }
            })

        } catch (e) {
            console.error('Error starting call', e);
            setStatus('idle');
            setLimitError('An error occured while starting the call');
        }
    }
    const stop = async () => {
        isStoppingRef.current = true;
        try {
            await getVapi().stop();
        } catch (error) {
            console.error('Error stopping call', error);
        } finally {
            setStatus('idle');
            isStoppingRef.current = false;
        }
    }
    const clearErrors = async () => {}

    return {
        status, isActive, messages, currentMessage, currentUserMessage, duration,
        start, stop, clearErrors,
        // maxDurationSeconds, remainingSeconds, showTimeWarning

    }

}

export default useVapi;