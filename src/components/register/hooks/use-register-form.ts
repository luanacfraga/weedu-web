import { AuthService, type RegisterRequest } from '@/lib/api/services/auth.service'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function useRegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true)
      await AuthService.register(data)

      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        } else {
          router.push('/login')
        }
      }, 100)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    register,
    isLoading,
  }
}

