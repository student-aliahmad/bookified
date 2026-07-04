"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";




const navItems = [
    { label: "Library", href: "/" },
    { label: "Add New", href: "/books/new" },
    { label: "Billing", href: "/subscriptions" },
]

const Navbar = () => {
    const pathName = usePathname();
    const { isLoaded, isSignedIn } = useAuth();

    return (
        <header className="w-full fixed z-50 bg-[var(--bg-primary)]">
            <div className="wrapper navbag-height py-4 flex justify-between items-center">
                <Link href="/" className="flex gap-0.5 items-center">
                    <Image src="/assets/logo.png" alt="Bookfied" width={42} height={26} />
                    <span className="logo-text">Bookified</span>
                </Link>
                <nav className="w-fit flex gap-7.5 items-center">
                    {navItems.map(({ label, href }) => {
                        const isActive = pathName === href || (href !== '/' && pathName.startsWith(href));

                        return (
                            <Link href={href} key={label} className={cn('nav-link-base', isActive ? 'nav-link-active' : 'text-black hover:opacity-70')}>
                                {label}
                            </Link>
                        )
                    })}

                    <div className="flex gap-7.5 items-center">
                        {!isLoaded ? (
                            <div className="nav-user-link">
                                <span className="h-10 w-10 rounded-full bg-black/10 animate-pulse" aria-hidden="true" />
                            </div>
                        ) : isSignedIn ? (
                            <div className="nav-user-link">
                                <UserButton />
                            </div>
                        ) : (
                            <SignInButton mode="modal" />
                        )}
                    </div>


                </nav>
            </div>
        </header>
    );
}

export default Navbar;
