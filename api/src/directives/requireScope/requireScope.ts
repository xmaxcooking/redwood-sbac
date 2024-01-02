import {
  createValidatorDirective,
  ValidatorDirectiveFunc,
} from '@redwoodjs/graphql-server'

export const schema = gql`
  """
  Use @requireScope to validate access to a field, query or mutation.
  """
  directive @requireScope(input: String, scope: String) on FIELD_DEFINITION
`

import { requireScope as applicationRequireScope } from 'src/lib/scope'

const validate: ValidatorDirectiveFunc = ({ context, directiveArgs }) => {
  const { input, scope } = directiveArgs
  const orgId = Number(context.params['variables'][input])
  applicationRequireScope({ orgId, scope })
}

const requireScope = createValidatorDirective(schema, validate)

export default requireScope
