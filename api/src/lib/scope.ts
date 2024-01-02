import { ForbiddenError } from '@redwoodjs/graphql-server'

export const hasScope = (orgId: number, scope: string) => {
  if (!context.currentUser) return false
  if (!context.currentUser.Memberships) return false
  return context.currentUser.Memberships.find(
    (m) =>
      m.Organization.id === orgId &&
      m.Role.Scopes.find((s) => s.Scope.name === scope)
  )
}

export const requireScope = ({
  orgId,
  scope,
}: {
  orgId: number
  scope: string
}) => {
  if (orgId && scope && !hasScope(orgId, scope)) {
    throw new ForbiddenError("You don't have access to this Resource.")
  }
}
