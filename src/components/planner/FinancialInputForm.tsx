import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import {
  FinancialInputs,
  GoalType,
  RiskPreference,
  GOAL_TYPE_LABELS,
  RISK_LABELS,
  GOAL_PRESETS
} from '@/types/financial';
import { formatCurrency } from '@/lib/calculations';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  DollarSign,
  Calendar,
  Target,
  Shield,
  TrendingUp,
  Home,
  GraduationCap,
  Building2,
  Briefcase,
  AlertTriangle,
  Info
} from 'lucide-react';

interface FinancialInputFormProps {
  onSubmit: (inputs: FinancialInputs) => void;
  isLoading?: boolean;
  initialValues?: Partial<FinancialInputs>;
  isAIEngineLoading?: boolean;
  aiEngineProgress?: string;
}

const goalIcons: Record<GoalType, typeof Home> = {
  house: Home,
  education: GraduationCap,
  retirement: Building2,
  business: Briefcase,
};

export function FinancialInputForm({ 
  onSubmit, 
  isLoading, 
  initialValues,
  isAIEngineLoading,
  aiEngineProgress
}: FinancialInputFormProps) {
  const [monthlyIncome, setMonthlyIncome] = useState(initialValues?.monthlyIncome?.toString() || '');
  const [monthlyExpenses, setMonthlyExpenses] = useState(initialValues?.monthlyExpenses?.toString() || '');
  const [age, setAge] = useState(initialValues?.age?.toString() || '');
  const [goalType, setGoalType] = useState<GoalType>(initialValues?.goalType || 'retirement');
  const [goalAmount, setGoalAmount] = useState(initialValues?.goalAmount?.toString() || GOAL_PRESETS.retirement.amount.toString());
  const [timePeriod, setTimePeriod] = useState(initialValues?.timePeriod || GOAL_PRESETS.retirement.years);
  const [riskPreference, setRiskPreference] = useState<RiskPreference>(initialValues?.riskPreference || 'medium');

  const income = parseFloat(monthlyIncome) || 0;
  const expenses = parseFloat(monthlyExpenses) || 0;
  const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;

  const handleGoalTypeChange = (newGoalType: GoalType) => {
    setGoalType(newGoalType);
    const preset = GOAL_PRESETS[newGoalType];
    setGoalAmount(preset.amount.toString());
    setTimePeriod(preset.years);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      monthlyIncome: parseFloat(monthlyIncome),
      monthlyExpenses: parseFloat(monthlyExpenses),
      age: parseInt(age),
      goalType,
      goalAmount: parseFloat(goalAmount),
      timePeriod,
      riskPreference,
    });
  };

  const isValid =
    parseFloat(monthlyIncome) > 0 &&
    parseFloat(monthlyExpenses) >= 0 &&
    parseInt(age) > 0 &&
    parseInt(age) < 100 &&
    parseFloat(goalAmount) > 0 &&
    timePeriod > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Income & Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Income & Expenses
          </CardTitle>
          <CardDescription>
            Enter your monthly financial details
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="income">Monthly Income</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="income"
                type="number"
                placeholder="5000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="pl-7"
                min="0"
                step="100"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expenses">Monthly Expenses</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="expenses"
                type="number"
                placeholder="3000"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                className="pl-7"
                min="0"
                step="100"
                required
              />
            </div>
          </div>

          {expenseRatio > 80 && income > 0 && (
            <div className="sm:col-span-2 flex items-start gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-warning flex-shrink-0" />
              <div>
                <p className="font-medium text-warning">High Expense Ratio ({expenseRatio.toFixed(0)}%)</p>
                <p className="text-muted-foreground">
                  Your expenses are {expenseRatio > 90 ? 'critically' : 'significantly'} high.
                  Consider reducing discretionary spending to increase your savings potential.
                </p>
              </div>
            </div>
          )}

          {income > 0 && expenses >= 0 && (
            <div className="sm:col-span-2 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Remaining Income</span>
                <span className={`font-semibold ${income - expenses < 0 ? 'text-destructive' : 'text-accent'}`}>
                  {formatCurrency(income - expenses)}/month
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Personal Details
          </CardTitle>
          <CardDescription>
            Your age helps us tailor recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs space-y-2">
            <Label htmlFor="age">Your Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="18"
              max="99"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Financial Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Financial Goal
          </CardTitle>
          <CardDescription>
            What are you saving for?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(GOAL_TYPE_LABELS) as GoalType[]).map((type) => {
              const Icon = goalIcons[type];
              const isSelected = goalType === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleGoalTypeChange(type)}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${isSelected
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                >
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {GOAL_TYPE_LABELS[type]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goalAmount">Target Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="goalAmount"
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="pl-7"
                  min="1000"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Time Period</Label>
                <span className="text-sm font-medium text-primary">{timePeriod} years</span>
              </div>
              <Slider
                value={[timePeriod]}
                onValueChange={([value]) => setTimePeriod(value)}
                min={1}
                max={40}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 year</span>
                <span>40 years</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Risk Preference
          </CardTitle>
          <CardDescription>
            Choose your investment risk tolerance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={riskPreference}
            onValueChange={(value) => setRiskPreference(value as RiskPreference)}
            className="grid gap-4 sm:grid-cols-3"
          >
            {[
              { value: 'low', label: 'Conservative', desc: 'Stable returns, lower risk', color: 'text-accent' },
              { value: 'medium', label: 'Balanced', desc: 'Mix of growth and stability', color: 'text-primary' },
              { value: 'high', label: 'Aggressive', desc: 'Higher returns, higher risk', color: 'text-warning' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${riskPreference === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                  }`}
              >
                <RadioGroupItem value={option.value} className="mt-0.5" />
                <div>
                  <p className={`font-medium ${option.color}`}>{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.desc}</p>
                </div>
              </label>
            ))}
          </RadioGroup>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
            <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <p className="text-muted-foreground">
              Our AI will analyze your profile and may suggest adjustments to your risk preference
              based on your age, goals, and timeline.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex flex-col items-end gap-2">
        {!isValid && !isAIEngineLoading && (
          <p className="text-sm text-muted-foreground">
            Please fill in all fields correctly to generate a plan.
          </p>
        )}
        {isAIEngineLoading && (
          <div className="flex flex-col items-end gap-1 mb-2">
            <p className="text-sm font-medium text-primary">Initializing WebLLM AI Engine...</p>
            <p className="text-xs text-muted-foreground">{aiEngineProgress || 'Downloading model to secure local storage (~2GB)'}</p>
          </div>
        )}
        <Button 
          type="submit" 
          size="lg" 
          disabled={!isValid || isLoading || isAIEngineLoading} 
          className="gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="h-5 w-5" />
              Generate Plan
            </>
          )}
        </Button>
      </div>
    </form>
  );
}