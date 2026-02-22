
import { ElementType } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Star, Award, Zap, Target } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Badge {
    id: string;
    name: string;
    icon: ElementType;
    description: string;
    achieved: boolean;
    color: string;
}

interface GamificationCardProps {
    goalsCompleted?: number;
    savingsRate?: number; // 0-100
    totalBudgets?: number;
}

export function GamificationCard({ goalsCompleted = 0, savingsRate = 0, totalBudgets = 0 }: GamificationCardProps) {
    // Calculate Level
    // Simple logic: Base level 1.
    // +1 level for every 2 goals completed.
    // +1 level if savings rate > 20%

    // Level calculation logic
    const goalsPoints = goalsCompleted * 50;
    const savingsPoints = savingsRate > 20 ? 100 : (savingsRate * 5);
    const budgetPoints = totalBudgets * 20;

    const totalPoints = goalsPoints + savingsPoints + budgetPoints;
    const pointsPerLevel = 200;

    const level = Math.floor(totalPoints / pointsPerLevel) + 1;
    // Fix progress calculation: if pointsPerLevel is 200, and points is 250, level 2 (200-399).
    // Progress should be (50 / 200) * 100 = 25%.
    const currentLevelPoints = totalPoints % pointsPerLevel;
    const nextLevelProgress = (currentLevelPoints / pointsPerLevel) * 100;

    const badges = [
        {
            id: 'beginner',
            name: 'Financial Rookie',
            icon: Star,
            description: 'Started your journey',
            achieved: true,
            color: 'text-yellow-500'
        },
        {
            id: 'saver',
            name: 'Super Saver',
            icon: Zap,
            description: 'Savings rate > 20%',
            achieved: savingsRate > 20,
            color: 'text-blue-500'
        },
        {
            id: 'goal-setter',
            name: 'Goal Getter',
            icon: Target,
            description: 'Completed 1+ goals',
            achieved: goalsCompleted > 0,
            color: 'text-emerald-500'
        },
        {
            id: 'budget-master',
            name: 'Budget Master',
            icon: Award,
            description: 'Created 3+ budgets',
            achieved: totalBudgets >= 3,
            color: 'text-purple-500'
        },
        {
            id: 'expert',
            name: 'Finance Guru',
            icon: Trophy,
            description: 'Reached Level 5',
            achieved: level >= 5,
            color: 'text-orange-500'
        }
    ];

    return (
        <Card className="overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-background via-background to-primary/5 h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Your Progress</CardTitle>
                        <CardDescription>Level {level} Financial Explorer</CardDescription>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Trophy className="h-6 w-6" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-6 space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span>XP: {totalPoints}</span>
                        <span>Next Level: {pointsPerLevel - currentLevelPoints} XP</span>
                    </div>
                    <Progress value={nextLevelProgress} className="h-2" />
                </div>

                <div>
                    <h4 className="mb-3 text-sm font-semibold">Badges</h4>
                    <div className="flex flex-wrap gap-3">
                        <TooltipProvider>
                            {badges.map((badge) => (
                                <Tooltip key={badge.id}>
                                    <TooltipTrigger asChild>
                                        <div className={`
                                            flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:scale-110 cursor-help
                                            ${badge.achieved
                                                ? `bg-background ${badge.color} border-primary/20 shadow-sm`
                                                : 'bg-muted text-muted-foreground opacity-50 grayscale'}
                                        `}>
                                            <badge.icon className="h-5 w-5" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-semibold">{badge.name}</p>
                                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                                        {!badge.achieved && <p className="mt-1 text-xs font-medium text-destructive">Locked</p>}
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </TooltipProvider>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
