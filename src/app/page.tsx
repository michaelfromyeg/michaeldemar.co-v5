// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const typingTexts = [
  "Michael DeMarco",
  "a software engineer at Notion",
  "passionate about teaching, mentorship, and research",
  "excited to meet you!",
];

export default function Home() {
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center">
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
            I&apos;m a software engineer at Notion, passionate about building tools that empower people.
            I graduated from the University of British Columbia with a degree in Computer Science.
          </p>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8"
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </motion.div>
      </section>
    </div>
  );
}