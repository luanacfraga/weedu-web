'use client'

import { useState, useEffect } from 'react'
import { companiesApi } from '@/lib/api/endpoints/companies'
import { useCompanyStore } from '@/lib/stores/company-store'
import { usePermissions } from '@/lib/hooks/use-permissions'

interface UseCompanyDataResult {
  companies: any[]
  selectedCompany: any
  isLoading: boolean
  error: Error | null
  selectCompany: (company: any) => void
  refreshCompanies: () => Promise<void>
}

/**
 * Hook para gerenciar dados de empresas
 * Responsabilidade única: Buscar e gerenciar estado de empresas
 *
 * Aplica SRP: Separa lógica de dados da apresentação
 * Aplica DIP: Abstrai chamadas de API
 */
export function useCompanyData(): UseCompanyDataResult {
  const { isAdmin } = usePermissions()
  const {
    companies,
    selectedCompany,
    setCompanies,
    selectCompany,
    isLoading,
    setLoading,
  } = useCompanyStore()
  const [error, setError] = useState<Error | null>(null)

  const loadCompanies = async () => {
    if (!isAdmin) return

    try {
      setLoading(true)
      setError(null)
      const data = await companiesApi.getMyCompanies()
      setCompanies(data || [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao carregar empresas')
      setError(error)
      console.error('Error loading companies:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Carregar apenas se não tiver empresas e for admin
    if (companies.length === 0 && isAdmin) {
      loadCompanies()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, companies.length])

  return {
    companies,
    selectedCompany,
    isLoading,
    error,
    selectCompany,
    refreshCompanies: loadCompanies,
  }
}
