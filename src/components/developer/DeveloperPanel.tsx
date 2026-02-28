import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Download } from 'lucide-react';
import { generateSyntheticTrainingData, exportTrainingDataCSV } from '@/lib/synthetic-data';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function DeveloperPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleGenerateData = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const count = await generateSyntheticTrainingData(user.id, 24);
      toast({
        title: "Training Dataset Generated",
        description: `Successfully injected ${count} transaction records into IndexedDB for Machine Learning.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate training data.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const csv = await exportTrainingDataCSV(user.id);
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `academic_training_data_${user.id.substring(0, 6)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Dataset Exported",
        description: "The CSV file is ready for Academic formatting/presentation.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Export Failed",
        description: "Could not export training data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Academic Validation Panel
            </CardTitle>
            <CardDescription>Generate internal training data for TensorFlow.js models.</CardDescription>
          </div>
          <Badge variant="outline" className="border-primary text-primary">Developer Mode</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          To demonstrate the localized Machine Learning architecture, the system requires a robust transaction history. Click below to synthesize 24 months of statistically realistic financial data into your local IndexedDB environment.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleGenerateData} 
            disabled={isGenerating || !user}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synthesizing Data...</>
            ) : (
              <><Database className="mr-2 h-4 w-4" /> Generate 24M Dataset</>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportCSV} 
            disabled={isExporting || isGenerating || !user}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...</>
            ) : (
              <><Download className="mr-2 h-4 w-4" /> Export Training Data (CSV)</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
