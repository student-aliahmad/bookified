import SubscriptionPricingTable from '@/components/SubscriptionPricingTable';

const page = () => {
    return (
        <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-16 pt-24">
            <section className="mx-auto max-w-[1200px] rounded-[22px] border border-black/10 bg-[var(--bg-primary)] px-6 py-6 shadow-[0_1px_0_rgba(0,0,0,0.08)] sm:px-8 sm:py-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="font-serif text-[30px] font-semibold tracking-[-0.02em] text-[#2d3742] sm:text-[38px]">
                        Choose Your Plan
                    </h1>
                    <p className="mt-3 text-sm text-[#9a8f82] sm:text-base">
                        Upgrade to unlock more books, longer sessions, and advanced features.
                    </p>
                </div>

                <div className="mx-auto mt-10 max-w-[880px] overflow-hidden rounded-[14px] border border-black/10 bg-white/40 p-3 shadow-[0_14px_28px_rgba(0,0,0,0.08)]">
                    <SubscriptionPricingTable />
                </div>
            </section>
        </main>
    );
};

export default page;