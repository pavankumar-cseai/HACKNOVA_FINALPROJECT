import { Logo } from '@/components/icons';
import VerbatimFlowClient from '@/components/verbatim-flow-client';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <h1 className="text-2xl font-bold font-headline tracking-tight">
            Speech to Text Intelligent AI
          </h1>
        </div>
      </header>
      <main className="flex-grow p-4 md:p-8 container mx-auto">
        <VerbatimFlowClient />
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>An Intelligent Low-Latency Speech Dictation Engine.</p>
      </footer>
    </div>
  );
}
