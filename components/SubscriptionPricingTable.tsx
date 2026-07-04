'use client';

import { PricingTable } from '@clerk/nextjs';

const SubscriptionPricingTable = () => {
	return (
		<PricingTable
			for="user"
			highlightedPlan="pro"
			ctaPosition="bottom"
			collapseFeatures={false}
			newSubscriptionRedirectUrl="/subscriptions"
		/>
	);
};

export default SubscriptionPricingTable;