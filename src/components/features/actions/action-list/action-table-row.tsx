'use client';

import { format } from 'date-fns';
import { Eye, MoreVertical } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { ActionButton } from '@/components/ui/action-button';
import { LateIndicator } from '../shared/late-indicator';
import { BlockedBadge } from '../shared/blocked-badge';
import { actionStatusUI } from '../shared/action-status-ui';
import { useMoveAction } from '@/lib/hooks/use-actions';
import { ActionStatus, type Action } from '@/lib/types/action';
import { toast } from 'sonner';

interface ActionTableRowProps {
  action: Action;
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (id: string) => void;
  onView: () => void;
}

export function ActionTableRow({ action, canEdit, canDelete, onDelete, onView }: ActionTableRowProps) {
  const moveAction = useMoveAction();

  const checklistProgress = action.checklistItems
    ? `${action.checklistItems.filter((i) => i.isCompleted).length}/${action.checklistItems.length}`
    : '—';
  const responsibleName =
    action.responsible?.firstName && action.responsible?.lastName
      ? `${action.responsible.firstName} ${action.responsible.lastName}`
      : '—';

  const handleStatusChange = async (newStatus: ActionStatus) => {
    try {
      await moveAction.mutateAsync({
        id: action.id,
        data: { toStatus: newStatus },
      });
      toast.success('Status atualizado com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onView}>
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{action.title}</span>
          <div className="flex flex-wrap gap-2 items-center">
             {/* Mobile-only status/priority indicators could go here if needed, 
                 but table is hidden on mobile anyway in favor of cards */}
            <LateIndicator isLate={action.isLate} />
            <BlockedBadge isBlocked={action.isBlocked} reason={action.blockedReason} />
          </div>
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Select
          disabled={action.isBlocked || !canEdit}
          value={action.status}
          onValueChange={(value) => handleStatusChange(value as ActionStatus)}
        >
          <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent hover:bg-transparent shadow-none focus:ring-0 [&>svg]:hidden">
            <StatusBadge status={action.status} />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ActionStatus).map((status) => (
              <SelectItem key={status} value={status}>
                <StatusBadge status={status} className="border-0 px-0 bg-transparent shadow-none" />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <PriorityBadge priority={action.priority} />
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">{responsibleName}</TableCell>
      <TableCell className="text-muted-foreground text-sm">{format(new Date(action.estimatedEndDate), 'dd/MM/yyyy')}</TableCell>
      <TableCell className="text-muted-foreground text-sm">{checklistProgress}</TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
            <ActionButton 
                action="view" 
                onClick={(e) => {
                    e.stopPropagation();
                    onView();
                }}
                showLabel={false}
                size="sm"
                className="h-8 w-8"
            />
            
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
                className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Menu de ações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onView();
              }}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Ver detalhes
            </DropdownMenuItem>
            {canDelete && (
              <DropdownMenuItem
                    className="text-destructive gap-2 focus:text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  onDelete(action.id);
                }}
              >
                    <ActionButton 
                        action="delete" 
                        className="h-4 w-4 p-0 border-0 bg-transparent text-destructive hover:bg-transparent hover:text-destructive shadow-none" 
                        showLabel={false}
                        onClick={(e) => e.preventDefault()} // handled by parent
                    />
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
