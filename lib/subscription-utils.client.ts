'use client';

import { useAuth } from '@clerk/nextjs';
import { getPlanLimits, PlanType, resolvePlanFromHas } from '@/lib/subscription-constants';

export const useCurrentUserPlan = () => {
    const { has, isLoaded, isSignedIn } = useAuth();
    const plan = !isLoaded || !isSignedIn ? 'free' : resolvePlanFromHas(has);

    return {
        plan,
        limits: getPlanLimits(plan),
        isLoaded,
        isSignedIn,
    };
};

export const useHasSubscriptionPlan = (plan: PlanType): boolean => {
    const { has, isLoaded, isSignedIn } = useAuth();

    if (!isLoaded || !isSignedIn) {
        return plan === 'free';
    }

    if (plan === 'free') {
        return true;
    }

    return resolvePlanFromHas(has) === plan;
};