export type ActionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface ActionSuggestion {
  rootCause: string
  title: string
  description: string
  priority: ActionPriority
  estimatedStartDays: number
  estimatedDurationDays: number
  checklistItems: string[]
}

export interface UsageStats {
  used: number
  limit: number
  remaining: number
}

export interface GenerateActionPlanRequest {
  companyId: string
  teamId?: string
  goal: string
}

export interface GenerateActionPlanResponse {
  suggestions: ActionSuggestion[]
  usage: UsageStats
}

export interface AILimitExceededError {
  statusCode: 402
  message: string
  error: 'IALimitExceededException'
  timestamp: string
  metadata: {
    used: number
    limit: number
    planName?: string
  }
}
