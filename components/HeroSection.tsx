import Image from "next/image";
import Link from 'next/link'


const HeroSection = () => {
    return (
        <section className="py-10">
            <div className="library-hero-card">
                <div className="library-hero-content">
                    <div className="library-hero-text">
                        <p className="text-sm uppercase tracking-[0.3em] text-[#3d485e] font-semibold">
                            Your Library
                        </p>
                        <h1 className="library-hero-title">
                            Convert your books into interactive AI conversations.
                        </h1>
                        <p className="library-hero-description">
                            Listen, learn, and discuss your favorite reads with a book library built for thoughtful, voice-enabled exploration.
                        </p>

                        <Link href="/books/new" className="bg-white rounded-lg px-6 py-4 shadow-sm mt-4 flex items-center justify-center">
                            <span className="text-3xl font-light mb-1 mr-2">+</span>
                            <span className="text-[#212a3b]">Add new book</span>
                        </Link>
                    </div>

                    <div className="library-hero-illustration-desktop">
                        <Image
                            src="/assets/hero-illustration.png"
                            alt="Vintage books and globe illustration"
                            width={400}
                            height={400}
                            className="object-contain"
                        />
                    </div>

                    <div className="library-hero-illustration">
                        <Image
                            src="/assets/hero-illustration.png"
                            alt="Vintage books and globe illustration"
                            width={300}
                            height={300}
                            className="object-contain"
                        />
                    </div>

                    <div className="library-steps-card mt-4 lg:mt-0">
                        <div className="library-step-item">
                            <span className="library-step-number">1</span>
                            <div>
                                <p className="library-step-title">Upload PDF</p>
                                <p className="library-step-description">Add your book file</p>
                            </div>
                        </div>
                        <div className="library-step-item">
                            <span className="library-step-number">2</span>
                            <div>
                                <p className="library-step-title">AI Processing</p>
                                <p className="library-step-description">We analyze the content</p>
                            </div>
                        </div>
                        <div className="library-step-item">
                            <span className="library-step-number">3</span>
                            <div>
                                <p className="library-step-title">Voice Chat</p>
                                <p className="library-step-description">Discuss with AI</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
