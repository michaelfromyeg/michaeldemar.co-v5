# Website Rewrite: Analyzing Old and New Code
`2024-12-31 22:43:30`

_Prompt_:
Let's continue with the website re-write. Before we start, take a look at the old code and new code, and provide a rough outline of next steps.

_Claude_:
I'll help analyze both codebases and outline next steps. Let me first take a look at both directories.

_Prompt_:
I've actually gone with a new approach for content handling. I'm now using Notion as a kind of CMS; in the new code, you can see it under scripts/ and src/lib/notion. Take another look at the new code and some of the files to see how much progress I've made.

_Claude_:
I'll take a closer look at the new approach with Notion integration.

_Prompt_:
We already have dynamic routes and such too! Take a look at src/app and the files within to see what it looks like.

_Claude_:
I'll check out the app directory structure and routing implementation.

_Prompt_:
I like your suggestions, but let's come to those later. One thing I miss about the old site is the dynamic resume. Here's the data I'm using. Look at the old code first to understand how the dynamic homepage resume is written.

_Claude_:
I'll check the old code's implementation of the dynamic resume feature.

_Prompt_:
Take a look at my existing homepage for the new Next app. src/app/page.tsx. Output a new version of that with the resume section.

_Claude_:
Let me check your current homepage implementation:

_Prompt_:
Two errors: (1) Unhandled Runtime Error
Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used
- A server/client branch if (typeof window !== 'undefined'). - Variable input such as Date.now() or Math.random() which changes each time it's called. - Date formatting in a user's locale which doesn't match the server. - External changing data without sending a snapshot of it along with the HTML. - Invalid HTML tag nesting. It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.
See more info here: https://nextjs.org/docs/messages/react-hydration-error


(2) Error: async/await is not yet supported in Client Components, only Server Components. This error is often caused by accidentally adding 'use client' to a module that was originally written for the server.

_Claude_:
Ah, I see two issues that need to be fixed:

2. Date formatting hydration mismatch
4. MDXRemote in a client component

Let me fix both issues. We'll need to:

2. Move the date formatting to be consistent between server and client
4. Split the components to handle MDX rendering on the server side

_Prompt_:
How can I strip the strings in the resume?

_Claude_:
Looking at the resume data, you want to strip out extra whitespace and escape characters from the strings. We can add a utility function for this when we process the resume data. Let's modify the DynamicResume component to handle this:

_Prompt_:
The chevron down is overlapping with the resume section here. // app/page.tsx import { ChevronDown } from "lucide-react"; import DynamicResume from "@/components/resume"; import TypingHero from "@/components/hero";  import { processResumeData } from '@/lib/utils'; import rawCvData from '@/data/cv.json'; import rawResumeData from '@/data/resume.json';  const { cv: cvData, resume: resumeData } = processResumeData(rawCvData, rawResumeData);  export default function Home() {   return (     <main className="container mx-auto px-4 sm:px-6 lg:px-8">       {/* Hero Section */}       <section className="min-h-[70vh] flex flex-col items-center justify-center text-center">         <TypingHero />         <div className="absolute bottom-8">           <ChevronDown className="h-6 w-6 text-muted-foreground animate-bounce" />         </div>       </section>        {/* Resume Section */}       <section className="py-16">         {/* @ts-expect-error Server Component */}         <DynamicResume cvData={cvData} resumeData={resumeData} />       </section>     </main>   ); } 

_Claude_:
The issue is that we're using absolute positioning for the chevron within a flex container. Let's fix this by adjusting the hero section's structure and using relative positioning:

```typescript
export default function Home() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="min-h-[70vh] relative">
        <div className="h-full flex flex-col items-center justify-center text-center">
          <TypingHero />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <ChevronDown className="h-6 w-6 text-muted-foreground animate-bounce" />
          </div>
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
```

Key changes:

2. Made the section relative to contain the absolute positioning
4. Added a wrapper div with h-full to maintain the flex layout
6. Centered the chevron using left-1/2 and -translate-x-1/2
8. The chevron will now stay within the hero section and not overlap with the resume section

This should maintain the visual design while fixing the overlap issue.

_Prompt_:
The hero text should be in the middle-center of the screen when the page loads. This change broke that.

_Claude_:
Ah yes, let's fix the centering while maintaining the proper chevron positioning. Here's the corrected version:

```typescript
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
```

Key changes:

2. Made the section a flex container with flex-col to enable vertical layout
4. Added flex-1 to the content wrapper to make it fill available space
6. Maintained the center alignment with justify-center and items-center
8. Kept the chevron absolutely positioned at the bottom

Now the hero text will be perfectly centered vertically and horizontally in the viewport when the page loads, and the chevron will stay at the bottom without overlapping the resume section.

_Prompt_:
Next, let's copy over the about page from the old site.

_Claude_:
Let me check the old about page first:

_Prompt_:
Looks good. Let's polish of my resume now. So far we only have the Experience section. Take a look at my old site, and the current implementation, and flesh out the rest. Work step by step.

_Claude_:
I'll help build out the complete resume section step by step. Let me first analyze how the old site structured the other resume sections:

_Prompt_:
This is not bad, but this is the current resume implementation. Can we extend this to re-use more common components?

_Claude_:
Ah yes, I see what you mean. We can create a more generic/reusable structure for the resume sections. Let me refactor this:

_Prompt_:
What's processEntry?

_Claude_:
Let me show you the processEntry utility function I created - it standardizes different types of resume entries (work, education, projects) into a common format that our ResumeEntry component can display:

```typescript
export function processEntry(entry: any, type: 'work' | 'education' | 'projects') {
    // Common fields that all entries share
    const base = {
        id: entry.id,
        location: entry.location,
        startDate: formatDate(entry.startDate),
        endDate: entry.endDate ? formatDate(entry.endDate) : null,
    };

    // Transform different entry types into a common format
    switch (type) {
        case 'work':
            return {
                ...base,
                title: entry.position,      // "Software Engineer"
                subtitle: entry.name,       // "Tesla"
                tags: entry.teams,          // ["Energy UI", "Supercharger"]
            };

        case 'education':
            return {
                ...base,
                title: entry.studyType,     // "B.Sc. Honours Computer Science"
                subtitle: entry.institution, // "The University of British Columbia"
                tags: entry.courses?.map((course: any) => course.name) || [], // ["Algorithms", "OS"]
            };

        case 'projects':
            return {
                ...base,
                title: entry.name,          // "CheetCode"
                subtitle: entry.summary,     // "LLM-powered interview tool"
                links: [
                    entry.githubUrl && { href: entry.githubUrl, label: 'GitHub Repository' },
                    entry.url && { href: entry.url, label: 'Live Demo' },
                ].filter(Boolean),
            };

        default:
            return base;
    }
}
```

It transforms entries like this:

```typescript
// Work experience entry
{
    id: "tesla",
    position: "Software Engineer",
    name: "Tesla",
    location: "Palo Alto, CA",
    startDate: "2022-09-01",
    endDate: "2022-12-31",
    teams: ["Energy UI"]
}

// Gets transformed into
{
    id: "tesla",
    title: "Software Engineer",
    subtitle: "Tesla",
    location: "Palo Alto, CA",
    startDate: "Sep 2022",
    endDate: "Dec 2022",
    tags: ["Energy UI"]
}
```

This way, our ResumeEntry component can handle all types of entries with a single, consistent interface:

```typescript
<ResumeEntry
    title="Software Engineer"    // position/studyType/name
    subtitle="Tesla"            // company/institution/summary
    location="Palo Alto, CA"
    startDate="Sep 2022"
    endDate="Dec 2022"
    tags={["Energy UI"]}        // teams/courses
    highlightsHtml={...}        // processed MDX content
    links={...}                 // optional GitHub/demo links
/>
```

Would you like me to:

2. Add additional entry types?
4. Add more fields to the common format?
6. Improve the type safety?
8. Add validation for required fields?

