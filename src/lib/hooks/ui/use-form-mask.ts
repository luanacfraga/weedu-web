import { useState, useEffect } from 'react'
import { UseFormSetValue, UseFormWatch } from 'react-hook-form'

type MaskFunction = (value: string) => string
type UnmaskFunction = (value: string) => string

interface UseFormMaskOptions<T extends Record<string, any>> {
  fieldName: keyof T
  mask: MaskFunction
  unmask: UnmaskFunction
  watch: UseFormWatch<T>
  setValue: UseFormSetValue<T>
}

/**
 * Hook para gerenciar máscaras de campos de formulário
 * Responsabilidade única: Aplicar e sincronizar máscaras
 *
 * Aplica SRP: Separa lógica de máscaras do componente
 */
export function useFormMask<T extends Record<string, any>>({
  fieldName,
  mask,
  unmask,
  watch,
  setValue,
}: UseFormMaskOptions<T>) {
  const fieldValue = watch(fieldName as any)
  const [maskedValue, setMaskedValue] = useState('')

  useEffect(() => {
    if (fieldValue) {
      const unmaskedValue = unmask(maskedValue)
      if (fieldValue !== unmaskedValue) {
        setMaskedValue(mask(fieldValue))
      }
    }
  }, [fieldValue, maskedValue, mask, unmask])

  const handleChange = (value: string) => {
    const masked = mask(value)
    const unmasked = unmask(masked)
    setMaskedValue(masked)
    setValue(fieldName as any, unmasked as any)
  }

  return {
    maskedValue,
    setMaskedValue,
    handleChange,
  }
}
