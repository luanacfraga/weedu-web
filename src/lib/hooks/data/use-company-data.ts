'use client'

import { useEffect } from 'react'
import { useCompanyStore } from '@/lib/stores/company-store'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useCompanies } from '@/lib/services/queries/use-companies'
import type { Company } from '@/lib/types/api'

interface UseCompanyDataResult {
  companies: Company[]
  selectedCompany: Company | null
  isLoading: boolean
  error: Error | null
  selectCompany: (company: Company) => void
  refetch: () => void
}

export function useCompanyData(): UseCompanyDataResult {
  const { isAdmin } = usePermissions()
  const { data: companies = [], isLoading, error, refetch } = useCompanies()
  const { selectedCompany, selectCompany, setCompanies } = useCompanyStore()

  useEffect(() => {
    if (companies.length > 0 && isAdmin) {
      setCompanies(companies)
    }
  }, [companies, isAdmin, setCompanies])

  return {
    companies,
    selectedCompany,
    isLoading,
    error: error as Error | null,
    selectCompany,
    refetch,
  }
}
