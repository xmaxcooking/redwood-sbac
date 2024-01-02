import { ForbiddenError } from '@redwoodjs/graphql-server'

export const hasOrg = (orgId: number) => {
  if (!context.currentUser) return false
  if (!context.currentUser.Memberships) return false
  return context.currentUser.Memberships.find(
    (m) => m.Organization.id === orgId
  )
}

export const requireOrg = ({ id }: { id: number }) => {
  if (id && !hasOrg(id)) {
    throw new ForbiddenError("You don't have access to this Organization.")
  }
}
