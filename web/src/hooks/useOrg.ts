import { useState } from 'react'

import { useAuth } from 'src/auth'

export const useOrg = (orgId: number) => {
  const [id] = useState<number>(orgId)
  const { currentUser, isAuthenticated } = useAuth()

  const isMember = () => {
    if (!isAuthenticated) return false
    if (!currentUser.Memberships) return false
    return currentUser.Memberships.find((m) => m.Organization.id === id)
  }

  const hasScope = (scope: string) => {
    if (!isAuthenticated) return false
    if (!currentUser.Memberships) return false
    return currentUser.Memberships.find(
      (m) =>
        m.Organization.id === orgId &&
        m.Role.Scopes.find((s) => s.Scope.name === scope)
    )
  }

  return { isMember, hasScope }
}
