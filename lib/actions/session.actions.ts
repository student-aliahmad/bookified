'use server'

import VoiceSession from "@/database/models/voiceSession.model";
import { connectToDatabase } from "@/database/mongoose";
import { auth } from "@clerk/nextjs/server";
import { getCurrentBillingPeriodStart, getPlanLimits, resolvePlanFromHas } from "@/lib/subscription-constants";
import { StartSessionResult, EndSessionResult } from "@/types";

export const startVoiceSession = async (clerkId: string, bookId: string): Promise<StartSessionResult> => {
    try {
        const { has, userId } = await auth();

        if (!userId) {
            return { success: false, error: 'Unauthorized: User not authenticated' };
        }

        await connectToDatabase();

        const plan = resolvePlanFromHas(has);
        const limits = getPlanLimits(plan);
        const billingPeriodStart = getCurrentBillingPeriodStart();
        const monthlySessionCount = await VoiceSession.countDocuments({
            clerkId: userId,
            billingPeriodStart,
        });

        if (limits.maxSessionsPerMonth !== null && monthlySessionCount >= limits.maxSessionsPerMonth) {
            return {
                success: false,
                error: `Your ${limits.label} plan allows up to ${limits.maxSessionsPerMonth} sessions per month. Upgrade to continue.`,
                isBillingError: true,
            };
        }

        const session = await VoiceSession.create({
            clerkId: userId,
            bookId,
            startedAt: new Date(),
            billingPeriodStart,
            durationSeconds: 0,
        });

        return {
             success: true,
             sessionId: session._id.toString(),
             maxDurationMinutes: limits.maxSessionMinutes,
        }
    } catch (e) {
        console.error('Error starting voice session', e);
        return { success: false, error: 'Failed to start voice session. Please try again later.'}
    }
} 

export const endVoiceSession = async (sessionId: string, durationSeconds: number): Promise<EndSessionResult> => {
    try {
        await connectToDatabase();

        const session = await VoiceSession.findByIdAndUpdate(
            sessionId,
            {
                endedAt: new Date(),
                durationSeconds,
            },
            { new: true }
        );

        if (!session) {
            return { success: false, error: 'Session not found' };
        }

        return { success: true };
    } catch (e) {
        console.error('Error ending voice session', e);
        return { success: false, error: 'Failed to end voice session. Please try again later.' };
    }
} 

