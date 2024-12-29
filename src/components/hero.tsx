"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const typingTexts = [
    "Michael DeMarco",
    "a software engineer at Notion",
    "passionate about teaching, mentorship, and research",
    "excited to meet you!",
];

export default function TypingHero() {
    const [textIndex, setTextIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setIsTyping(false);
            setTimeout(() => {
                setTextIndex((prev) => (prev + 1) % typingTexts.length);
                setIsTyping(true);
            }, 500);
        }, 4000);

        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <h1 className="text-4xl sm:text-6xl font-bold">
                Hi, I&apos;m{" "}
                <AnimatePresence mode="wait">
                    {isTyping && (
                        <motion.span
                            key={textIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-primary"
                        >
                            {typingTexts[textIndex]}
                        </motion.span>
                    )}
                </AnimatePresence>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                I&apos;m a software engineer at Notion, passionate about building tools
                that empower people. I graduated from the University of British Columbia
                with a degree in Computer Science.
            </p>
        </motion.div>
    );
}