import gql from 'graphql-tag'

import type { ValidatorDirectiveFunc } from '@redwoodjs/graphql-server'
import { createValidatorDirective } from '@redwoodjs/graphql-server'

import { requireAuth as applicationRequireAuth } from 'src/lib/auth'

export const schema = gql`
  """
  Use to check whether or not a user is authenticated
  """
  directive @requireAuth on FIELD_DEFINITION
`

const validate: ValidatorDirectiveFunc = () => {
  applicationRequireAuth()
}


const requireAuth = createValidatorDirective(schema, validate)

export default requireAuth
