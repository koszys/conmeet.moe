'use client';

import type { LucideIcon } from 'lucide-react';
import { Button, LinkButton, EmptyState } from '@/shared/components/ui';

export interface BoardEmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  primary?: boolean;
}

export interface BoardEmptyStateProps {
  icon?: LucideIcon;
  speech?: string;
  title: string;
  description: string;
  action?: BoardEmptyStateAction;
}

export function BoardEmptyState({ speech, title, description, action }: BoardEmptyStateProps) {
  return (
    <EmptyState
      mascot
      mascotSpeech={speech}
      title={title}
      description={description}
      shadow
      action={
        action ? (
          action.href ? (
            <LinkButton variant={action.primary ? 'primary' : 'secondary'} href={action.href}>
              {action.icon ? <action.icon className="h-4 w-4" /> : null}
              <span>{action.label}</span>
            </LinkButton>
          ) : (
            <Button variant={action.primary ? 'primary' : 'secondary'} onClick={action.onClick}>
              {action.icon ? <action.icon className="h-4 w-4" /> : null}
              <span>{action.label}</span>
            </Button>
          )
        ) : null
      }
    />
  );
}
