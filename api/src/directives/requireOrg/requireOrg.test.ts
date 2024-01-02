import { mockRedwoodDirective, getDirectiveName } from '@redwoodjs/testing/api'

import requireOrg from './requireOrg'

describe('requireOrg directive', () => {
  it('declares the directive sdl as schema, with the correct name', () => {
    expect(requireOrg.schema).toBeTruthy()
    expect(getDirectiveName(requireOrg.schema)).toBe('requireOrg')
  })

  it('has a requireOrg throws an error if validation does not pass', () => {
    const mockExecution = mockRedwoodDirective(requireOrg, {})

    expect(mockExecution).toThrowError('Implementation missing for requireOrg')
  })
})
