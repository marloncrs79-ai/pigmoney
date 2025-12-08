import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  learnMoreSection?: string;
}

export function PageHeader({ title, description, action, learnMoreSection }: PageHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {description && (
              <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
            )}
            {learnMoreSection && (
              <Link 
                to={`/guia#${learnMoreSection}`}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <HelpCircle className="h-3 w-3" />
                Saiba mais
              </Link>
            )}
          </div>
        </div>
        {action && <div className="w-full sm:w-auto">{action}</div>}
      </div>
    </div>
  );
}
