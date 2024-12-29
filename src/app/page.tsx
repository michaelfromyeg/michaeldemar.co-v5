import { ChevronDown } from "lucide-react";
import DynamicResume from "@/components/resume";
import TypingHero from "@/components/hero";
import Logo from "@/components/logo";

import { processResumeData } from '@/lib/utils';
import rawCvData from '@/data/cv.json';
import rawResumeData from '@/data/resume.json';

const { cv: cvData, resume: resumeData } = processResumeData(rawCvData, rawResumeData);

export default function Home() {
  return (
    <>
      {/* Hero Section - taking up full viewport minus navbar */}
      <section className="h-[calc(100vh-64px)] flex flex-col relative overflow-hidden">
        {/* Background Logo - contained within section bounds */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[90vh] h-[90vh] relative">
            <Logo 
              className="absolute inset-0 w-full h-full object-contain fill-foreground opacity-10 dark:opacity-5 transition-opacity duration-200" 
            />
          </div>
        </div>
        
        {/* Content Container - with flex to distribute space */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full">
          {/* Center content with flex-grow */}
          <div className="flex-grow flex flex-col items-center justify-center text-center relative z-10">
            <TypingHero />
          </div>
          
          {/* Scroll Indicator - at bottom with specific margin */}
          <div className="flex justify-center mb-8 relative z-10">
            <ChevronDown className="h-6 w-6 text-muted-foreground animate-bounce" />
          </div>
        </div>
      </section>

      {/* Resume Section - scrolls below the fold */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* @ts-expect-error Server Component */}
        <DynamicResume cvData={cvData} resumeData={resumeData} />
      </section>
    </>
  );
}