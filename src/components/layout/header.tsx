"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { useEffect, useState } from "react";

const navigation = [
    { name: "Blog", href: "/blog" },
    { name: "Projects", href: "/projects" },
    { name: "Design", href: "/design" },
    { name: "About", href: "/about" },
] as const;

const EMOJIS = ["🤠", "🐢", "👾", "🤖", "⚡", "🦅", "🦕", "🐧"] as const;

export default function Header() {
    const [emoji, setEmoji] = useState<string>("👋");

    useEffect(() => {
        setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
    }, []);

    return (
        <header className="border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link
                        href="/"
                        className="text-lg font-semibold hover:opacity-80 transition-opacity flex items-center gap-2"
                    >
                        <span>{emoji}</span>
                        <span>michaeldemar.co</span>
                    </Link>
                    <nav className="flex items-center gap-4 sm:gap-6">
                        <div className="hidden md:flex items-center gap-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    [{item.name}]
                                </Link>
                            ))}
                        </div>
                        <ModeToggle />
                    </nav>
                </div>
            </div>
        </header>
    );
}