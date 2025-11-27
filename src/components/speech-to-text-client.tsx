"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import {
  Mic,
  Square,
  Loader2,
  Timer,
  ChevronRight,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

import { transcribeSpeech } from "@/ai/flows/transcribe-speech";
import { removeFillerWords } from "@/ai/flows/remove-filler-words";
import { eliminateRepetitions } from "@/ai/flows/eliminate-repetitions";
import { correctGrammarAndFormat } from "@/ai/flows/correct-grammar-and-format";
import { adjustToneAndStyle } from "@/ai/flows/adjust-tone-and-style";

type Style = "Formal" | "Casual" | "Concise" | "Neutral";
type LatencySteps =
  | "Transcription"
  | "Filler Word Removal"
  | "Repetition Removal"
  | "Grammar Correction"
  | "Tone & Style"
  | "Total";

export default function SpeechToTextClient() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, startTransition] = useTransition();
  const [rawText, setRawText] = useState("");
  const [processedText, setProcessedText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<Style>("Neutral");
  const [latencies, setLatencies] = useState<
    Partial<Record<LatencySteps, number>>
  >({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        processAudio(audioBlob);
        audioChunksRef.current = [];
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRawText("Recording... Speak now.");
      setProcessedText("");
      setLatencies({});
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description:
          "Could not access the microphone. Please check your browser permissions.",
        variant: "destructive",
      });
      setRawText("Microphone access denied. Please enable it in your browser settings.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRawText("Processing your speech...");
    }
  };

  const processAudio = (audioBlob: Blob) => {
    startTransition(async () => {
      let currentText = "";
      const newLatencies: Partial<Record<LatencySteps, number>> = {};
      let totalLatency = 0;

      try {
        const audioDataUri = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(audioBlob);
        });
        
        let startTime, endTime, stepLatency;
        
        // 1. Transcription
        startTime = performance.now();
        const transcriptionResult = await transcribeSpeech({ audioDataUri });
        endTime = performance.now();
        stepLatency = endTime - startTime;
        totalLatency += stepLatency;
        currentText = transcriptionResult.transcription;
        setRawText(currentText);
        newLatencies["Transcription"] = stepLatency;
        setLatencies({ ...newLatencies });
        setProcessedText("Processing: Removing filler words...");

        // 2. Filler Word Removal
        startTime = performance.now();
        const fillerResult = await removeFillerWords({ text: currentText });
        endTime = performance.now();
        stepLatency = endTime - startTime;
        totalLatency += stepLatency;
        currentText = fillerResult.cleanedText;
        newLatencies["Filler Word Removal"] = stepLatency;
        setLatencies({ ...newLatencies });
        setProcessedText("Processing: Eliminating repetitions...");

        // 3. Repetition Removal
        startTime = performance.now();
        const repetitionResult = await eliminateRepetitions({ text: currentText });
        endTime = performance.now();
        stepLatency = endTime - startTime;
        totalLatency += stepLatency;
        currentText = repetitionResult.cleanedText;
        newLatencies["Repetition Removal"] = stepLatency;
        setLatencies({ ...newLatencies });
        setProcessedText("Processing: Correcting grammar...");
        
        // 4. Grammar Correction
        startTime = performance.now();
        const grammarResult = await correctGrammarAndFormat({ text: currentText });
        endTime = performance.now();
        stepLatency = endTime - startTime;
        totalLatency += stepLatency;
        currentText = grammarResult.formattedText;
        newLatencies["Grammar Correction"] = stepLatency;
        setLatencies({ ...newLatencies });
        setProcessedText("Processing: Adjusting tone and style...");

        // 5. Tone and Style Adjustment
        startTime = performance.now();
        const toneResult = await adjustToneAndStyle({ text: currentText, style: selectedStyle });
        endTime = performance.now();
        stepLatency = endTime - startTime;
        totalLatency += stepLatency;
        currentText = toneResult.adjustedText;
        newLatencies["Tone & Style"] = stepLatency;
        newLatencies["Total"] = totalLatency;
        setLatencies({ ...newLatencies });
        setProcessedText(currentText);

      } catch (error) {
        console.error("Processing failed:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
          title: "Processing Error",
          description: `Failed to process audio. ${errorMessage}`,
          variant: "destructive",
        });
        setRawText("An error occurred during processing.");
        setProcessedText("");
      }
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle>Dictation Controls</CardTitle>
            <CardDescription>
              Click record, speak, and stop. Your text will be processed automatically.
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="style-select" className="text-sm font-medium">
                Tone & Style
              </Label>
              <Select
                value={selectedStyle}
                onValueChange={(value) => setSelectedStyle(value as Style)}
                disabled={isRecording || isProcessing}
              >
                <SelectTrigger id="style-select" className="w-[150px]">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Concise">Concise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isProcessing}
              className="w-32"
              variant={isRecording ? "destructive" : "default"}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isRecording ? (
                <Square className="mr-2 h-4 w-4" />
              ) : (
                <Mic className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? "Processing" : isRecording ? "Stop" : "Record"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Raw Transcript</CardTitle>
            <CardDescription>
              The direct speech-to-text output, as you spoke it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={rawText}
              readOnly
              className="h-64 resize-none font-code"
              placeholder="Raw audio transcription will appear here..."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Processed Text</CardTitle>
            <CardDescription>
              Cleaned, formatted, and styled text ready for use.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={processedText}
              readOnly
              className="h-64 resize-none font-code"
              placeholder="Your polished text will appear here..."
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Processing Latency
            </CardTitle>
            <CardDescription>
              Time taken for each step after you stop speaking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(latencies).length > 0 ? (
              <>
                <ul className="space-y-2 text-sm font-code">
                  {(Object.keys(latencies) as LatencySteps[])
                    .filter((step) => step !== "Total")
                    .map((step) => (
                      <li key={step} className="flex justify-between items-center">
                        <span>{step}</span>
                        <span className="text-muted-foreground">
                          {latencies[step]?.toFixed(0)}ms
                        </span>
                      </li>
                    ))}
                </ul>
                <Separator className="my-3" />
                <div
                  className={`flex justify-between font-bold font-code text-base ${
                    latencies.Total != null && latencies.Total > 2500
                      ? "text-destructive"
                      : "text-[hsl(var(--chart-2))]"
                  }`}
                >
                  <span>Total:</span>
                  <span>{latencies.Total?.toFixed(0)}ms</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Latency metrics will appear here after processing.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    How It Works
                </CardTitle>
                <CardDescription>The intelligent pipeline that transforms your speech.</CardDescription>
            </CardHeader>
            <CardContent>
                <ol className="relative border-l border-border/50 space-y-4">
                    <li className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-primary rounded-full -left-3 ring-4 ring-background text-primary-foreground">
                            <Mic className="w-3.5 h-3.5" />
                        </span>
                        <h3 className="font-semibold">1. Transcription</h3>
                        <p className="text-sm text-muted-foreground">Your speech is converted to raw text in real-time.</p>
                    </li>
                    <li className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-primary rounded-full -left-3 ring-4 ring-background text-primary-foreground">
                           <span className="text-xs font-bold">...</span>
                        </span>
                        <h3 className="font-semibold">2. Filler & Repetition Removal</h3>
                        <p className="text-sm text-muted-foreground">"Umms", "ahhs", and repeated phrases are eliminated.</p>
                    </li>
                    <li className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-primary rounded-full -left-3 ring-4 ring-background text-primary-foreground">
                           <span className="font-bold">A!</span>
                        </span>
                        <h3 className="font-semibold">3. Grammar & Formatting</h3>
                        <p className="text-sm text-muted-foreground">Punctuation, capitalization, and structure are corrected.</p>
                    </li>
                    <li className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-accent rounded-full -left-3 ring-4 ring-background text-accent-foreground">
                            <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                        <h3 className="font-semibold">4. Tone & Style Adjustment</h3>
                        <p className="text-sm text-muted-foreground">The final text is adapted to your selected style.</p>
                    </li>
                </ol>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
