import { createServerFn } from '@tanstack/react-start'
import { enforceVerificationBudget } from './budget'
import type { DesignationCardRecord } from '../committees-public'
export function normalizeOfficeBearerId(value: unknown) {
  if (typeof value !== 'string' || !/^JAS-OB-\d{4}-[0-9A-F]{8}$/.test(value.trim().toUpperCase())) throw new Error('VERIFY_INVALID_NUMBER')
  return value.trim().toUpperCase()
}
export const verifyOfficeBearerAction = createServerFn({ method: 'POST' })
  .inputValidator((value: unknown) => normalizeOfficeBearerId(value))
  .handler(async ({ data }): Promise<DesignationCardRecord | null> => {
    try {
      const client = await enforceVerificationBudget(data)
      const result = await client.rpc('lookup_public_office_bearer', { _card_id: data })
      if (result.error) throw result.error
      return result.data as unknown as DesignationCardRecord | null
    } catch (error) {
      if (error instanceof Error && error.message === 'VERIFY_RATE_LIMITED') throw error
      throw new Error('VERIFY_UNAVAILABLE')
    }
  })
