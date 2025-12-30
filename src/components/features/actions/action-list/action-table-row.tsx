'use client';

import { format } from 'date-fns';
import { MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '../shared/status-badge';
import { PriorityBadge } from '../shared/priority-badge';
import { LateIndicator } from '../shared/late-indicator';
import { BlockedBadge } from '../shared/blocked-badge';
import type { Action } from '@/lib/types/action';

interface ActionTableRowProps {
  action: Action;
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (id: string) => void;
}

export function ActionTableRow({ action, canEdit, canDelete, onDelete }: ActionTableRowProps) {
  const checklistProgress = action.checklistItems
    ? `${action.checklistItems.filter((i) => i.isCompleted).length}/${action.checklistItems.length}`
    : '—';

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50">
      <TableCell>
        <Link href={`/actions/${action.id}/edit`} className="block">
          <div className="font-medium">{action.title}</div>
          <div className="flex gap-2 mt-1">
            <LateIndicator isLate={action.isLate} />
            <BlockedBadge isBlocked={action.isBlocked} reason={action.blockedReason} />
          </div>
        </Link>
      </TableCell>
      <TableCell>
        <StatusBadge status={action.status} />
      </TableCell>
      <TableCell>
        <PriorityBadge priority={action.priority} />
      </TableCell>
      <TableCell>{action.responsibleId ? `#${action.responsibleId.slice(0, 8)}` : '—'}</TableCell>
      <TableCell>{format(new Date(action.estimatedEndDate), 'MMM d, yyyy')}</TableCell>
      <TableCell>{checklistProgress}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/actions/${action.id}/edit`}>Editar</Link>
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem asChild>
                <Link href={`/actions/${action.id}/edit`}>Edit</Link>
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(action.id)}
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
