import { TrendingUp } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold text-foreground">
              WealthPlanner
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            AI-powered savings and investment planning for your financial goals.
          </p>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} WealthPlanner. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}