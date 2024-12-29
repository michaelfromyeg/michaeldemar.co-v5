// app/page.tsx
import { ChevronDown } from "lucide-react";
import DynamicResume from "@/components/resume";
import TypingHero from "@/components/hero";

import { processResumeData } from '@/lib/utils';
import rawCvData from '@/data/cv.json';
import rawResumeData from '@/data/resume.json';

const { cv: cvData, resume: resumeData } = processResumeData(rawCvData, rawResumeData);

export default function Home() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="min-h-[70vh] flex flex-col relative">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <TypingHero />
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="h-6 w-6 text-muted-foreground animate-bounce" />
        </div>
      </section>

      {/* Resume Section */}
      <section className="py-16">
        {/* @ts-expect-error Server Component */}
        <DynamicResume cvData={cvData} resumeData={resumeData} />
      </section>
    </main>
  );
}