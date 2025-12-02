import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { plansApi, type CreatePlanRequest, type UpdatePlanRequest } from '@/lib/api/endpoints/plans'

const PLANS_KEY = ['plans'] as const

export function usePlans() {
  return useQuery({
    queryKey: PLANS_KEY,
    queryFn: () => plansApi.getAll(),
    select: (data) => data || [],
  })
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: [...PLANS_KEY, id],
    queryFn: () => plansApi.getById(id),
    enabled: !!id,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePlanRequest) => plansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANS_KEY })
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequest }) =>
      plansApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PLANS_KEY })
      queryClient.invalidateQueries({ queryKey: [...PLANS_KEY, variables.id] })
    },
  })
}

