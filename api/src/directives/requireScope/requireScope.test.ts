import { mockRedwoodDirective, getDirectiveName } from '@redwoodjs/testing/api'

import requireScope from './requireScope'

describe('requireScope directive', () => {
  it('declares the directive sdl as schema, with the correct name', () => {
    expect(requireScope.schema).toBeTruthy()
    expect(getDirectiveName(requireScope.schema)).toBe('requireScope')
  })

  it('has a requireScope throws an error if validation does not pass', () => {
    const mockExecution = mockRedwoodDirective(requireScope, {})

    expect(mockExecution).toThrowError(
      'Implementation missing for requireScope'
    )
  })
})
