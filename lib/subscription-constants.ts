export const CLERK_SUBSCRIPTION_PLAN_SLUGS = {
    standard: 'standard',
    pro: 'pro',
} as const;

export type ClerkSubscriptionPlanSlug = (typeof CLERK_SUBSCRIPTION_PLAN_SLUGS)[keyof typeof CLERK_SUBSCRIPTION_PLAN_SLUGS];

export type PlanType = 'free' | 'standard' | 'pro';

export interface PlanLimits {
    label: string;
    description: string;
    price: string;
    billingPeriod: string;
    maxBooks: number;
    maxSessionsPerMonth: number | null;
    maxSessionMinutes: number;
    hasSessionHistory: boolean;
    clerkPlanSlug?: ClerkSubscriptionPlanSlug;
}

export const PLANS: Record<PlanType, PlanLimits> = {
    free: {
        label: 'Free',
        description: 'Try the app with a single book and shorter guided sessions.',
        price: '$0',
        billingPeriod: 'Always free',
        maxBooks: 1,
        maxSessionsPerMonth: 5,
        maxSessionMinutes: 5,
        hasSessionHistory: false,
    },
    standard: {
        label: 'Standard',
        description: 'Build a bigger personal library with longer monthly usage.',
        price: '$7.99',
        billingPeriod: '/month',
        maxBooks: 10,
        maxSessionsPerMonth: 100,
        maxSessionMinutes: 15,
        hasSessionHistory: true,
        clerkPlanSlug: CLERK_SUBSCRIPTION_PLAN_SLUGS.standard,
    },
    pro: {
        label: 'Pro',
        description: 'Power users get the largest library and the longest sessions.',
        price: '$15',
        billingPeriod: '/month',
        maxBooks: 100,
        maxSessionsPerMonth: null,
        maxSessionMinutes: 60,
        hasSessionHistory: true,
        clerkPlanSlug: CLERK_SUBSCRIPTION_PLAN_SLUGS.pro,
    },
};

export const getPlanLimits = (plan: PlanType): PlanLimits => PLANS[plan];

export const getCurrentBillingPeriodStart = (date: Date = new Date()): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
};

export const getBillingPeriodKey = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

export const resolvePlanFromHas = (has: (params: { plan: ClerkSubscriptionPlanSlug }) => boolean): PlanType => {
    if (has({ plan: CLERK_SUBSCRIPTION_PLAN_SLUGS.pro })) {
        return 'pro';
    }

    if (has({ plan: CLERK_SUBSCRIPTION_PLAN_SLUGS.standard })) {
        return 'standard';
    }

    return 'free';
};