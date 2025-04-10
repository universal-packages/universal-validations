import SchemaValidation from './__fixtures__/SchemaValidation'

describe('schema validations', (): void => {
  it('runs only non-schema validators when no schema is provided', async (): Promise<void> => {
    // Valid email format but would fail the 'create' schema uniqueness check
    const result = await SchemaValidation.validate({
      email: 'taken@example.com',
      password: 'password'
    })

    expect(result).toEqual({ errors: {}, valid: true })
  })

  it('runs specific schema validators along with non-schema validators', async (): Promise<void> => {
    // Should fail the 'create' schema uniqueness check
    const result = await SchemaValidation.validate({
      email: 'taken@example.com',
      password: 'password',
      name: 'John' // Valid name length for the 'create' schema
    }, 'create')

    expect(result).toEqual({
      errors: {
        email: ['email failed uniqueEmail validation']
      },
      valid: false
    })
  })

  it('validates against multiple schemas when provided as an array', async (): Promise<void> => {
    const validation = new SchemaValidation({ password: 'oldpassword' })
    
    // Should fail both 'update' and 'reset' schema validators
    const result = await validation.validate({
      email: 'valid@example.com',
      password: 'oldpassword',
      name: 'J' // Too short for create/update schema
    }, ['update', 'reset'])

    expect(result).toEqual({
      errors: {
        password: ['password failed differentPassword validation'],
        name: ['name failed validName validation']
      },
      valid: false
    })
  })

  it('respects validation priorities across schemas', async (): Promise<void> => {
    // Invalid email format should fail before schema-specific validators
    const result = await SchemaValidation.validate({
      email: 'not-an-email',
      password: 'short', // Would fail strongPassword in 'create' schema
      name: 'J' // Too short for create/update schema
    }, 'create')

    expect(result).toEqual({
      errors: {
        email: ['email failed validFormat validation'],
        password: ['password failed strongPassword validation'],
        name: ['name failed validName validation']
      },
      valid: false
    })
  })

  it('handles the create schema correctly with all passing validations', async (): Promise<void> => {
    const result = await SchemaValidation.validate({
      email: 'new@example.com', // Not taken
      password: 'strongpassword', // Strong enough
      name: 'John' // Long enough
    }, 'create')

    expect(result).toEqual({ errors: {}, valid: true })
  })

  it('handles the update schema correctly with all passing validations', async (): Promise<void> => {
    const validation = new SchemaValidation({ password: 'oldpassword' })
    
    const result = await validation.validate({
      email: 'update@example.com',
      password: 'newpassword', // Different from old
      name: 'Jane' // Long enough
    }, 'update')

    expect(result).toEqual({ errors: {}, valid: true })
  })

  it('correctly handles when both initialValues and schema are provided', async (): Promise<void> => {
    // Pass both initialValues and schema as separate arguments
    const result = await SchemaValidation.validate(
      {
        email: 'email@example.com',
        password: 'newpassword', 
        name: 'Jane'
      }, 
      { password: 'oldpassword' }, 
      'update'
    )

    expect(result).toEqual({ errors: {}, valid: true })
  })
}) 
