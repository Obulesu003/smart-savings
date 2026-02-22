import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Lightbulb, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { InsightEngine, Insight } from '@/lib/ai/insight-engine';
import { KNOWLEDGE_BASE, Lesson } from '@/lib/ai/knowledge-base';
import { useTransactions } from '@/hooks/useTransactions';


export default function Learning() {
  const { transactions } = useTransactions();
  const [activeLesson, setActiveLesson] = useState<Lesson>(KNOWLEDGE_BASE[0]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transactions) {
        setLoading(true);
        // Simulate a small "AI Thinking" delay for UX
        setTimeout(() => {
            const generatedInsights = InsightEngine.analyze(transactions);
            setInsights(generatedInsights);
            
            // Auto-select a lesson based on insights
            // Only if we haven't manually selected one? Or always on load?
            // Let's done it once on mount/data load
            if (generatedInsights.length > 0) {
                 // For now just default to first lesson logic inside engine
                 // Or we can just let user browse.
            }
            setLoading(false);
        }, 800);
    }
  }, [transactions]);

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl">
        <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
                <Lightbulb className="h-8 w-8 text-yellow-500" />
                Smart Financial Tutor
            </h1>
            <p className="mt-1 text-muted-foreground">
                Personalized insights and financial wisdom based on your spending habits.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT COLUMN: INSIGHTS & MENU */}
            <div className="space-y-6">
                
                {/* AI INSIGHTS CARD */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Current Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="text-sm text-muted-foreground animate-pulse">Analyzing finances...</div>
                        ) : insights.length > 0 ? (
                            insights.map((insight, idx) => (
                                <div key={idx} className="p-3 bg-background rounded-lg border shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                        {insight.type === 'kudos' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                        {insight.type === 'tip' && <Lightbulb className="h-4 w-4 text-yellow-500" />}
                                        <span className="font-semibold text-sm">{insight.title}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">{insight.message}</p>
                                    {insight.relatedLessonId && (
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            className="w-full h-7 text-xs"
                                            onClick={() => {
                                                const l = InsightEngine.getLessonById(insight.relatedLessonId!);
                                                if (l) setActiveLesson(l);
                                            }}
                                        >
                                            Learn More
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No specific insights yet. Add more transactions!</p>
                        )}
                    </CardContent>
                </Card>

                {/* LIBRARY MENU */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Knowledge Library</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                         <div className="space-y-1">
                            {KNOWLEDGE_BASE.map(lesson => (
                                <Button
                                    key={lesson.id}
                                    variant={activeLesson.id === lesson.id ? "secondary" : "ghost"}
                                    className="w-full justify-start text-sm"
                                    onClick={() => setActiveLesson(lesson)}
                                >
                                    <BookOpen className="mr-2 h-4 w-4 opacity-70" />
                                    {lesson.title}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* RIGHT COLUMN: CONTENT */}
            <div className="md:col-span-2">
                <Card className="h-full min-h-[500px] flex flex-col">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <Badge variant="outline" className="mb-2">{activeLesson.category.toUpperCase()}</Badge>
                                <CardTitle className="text-2xl">{activeLesson.title}</CardTitle>
                                <CardDescription>Level: {activeLesson.level}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 flex-1">
                        <div className="prose dark:prose-invert max-w-none">
                            {/* Simple Markdown Rendering Replacement since we might not have react-markdown */}
                             {activeLesson.content.split('\n').map((line, i) => {
                                if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('### ', '')}</h3>;
                                if (line.startsWith('**')) return <p key={i} className="font-bold mb-2">{line.replace(/\*\*/g, '')}</p>;
                                if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
                                return <p key={i} className="mb-2">{line}</p>;
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
