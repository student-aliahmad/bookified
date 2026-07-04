'use server';

import { auth } from '@clerk/nextjs/server';
import { getPlanLimits, PlanType, resolvePlanFromHas } from '@/lib/subscription-constants';

export const getCurrentUserPlan = async (): Promise<PlanType> => {
    const { has, userId } = await auth();

    if (!userId) {
        return 'free';
    }

    return resolvePlanFromHas(has);
};

export const getCurrentUserPlanLimits = async () => {
    const plan = await getCurrentUserPlan();
    return { plan, limits: getPlanLimits(plan) };
};

export const hasCurrentUserPlan = async (plan: PlanType): Promise<boolean> => {
    const { has, userId } = await auth();

    if (!userId) {
        return plan === 'free';
    }

    if (plan === 'free') {
        return true;
    }

    return resolvePlanFromHas(has) === plan;
};