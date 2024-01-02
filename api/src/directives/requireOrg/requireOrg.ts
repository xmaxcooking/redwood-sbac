import {
  createValidatorDirective,
  ValidatorDirectiveFunc,
} from '@redwoodjs/graphql-server'

export const schema = gql`
  """
  Use @requireOrg to validate access to a field, query or mutation.
  """
  directive @requireOrg(input: String) on FIELD_DEFINITION
`

import { requireOrg as applicationRequireOrg } from 'src/lib/org'

const validate: ValidatorDirectiveFunc = ({ context, directiveArgs }) => {
  const id = Number(context.params['variables'][directiveArgs.input])
  applicationRequireOrg({ id })
}

const requireOrg = createValidatorDirective(schema, validate)

export default requireOrg
