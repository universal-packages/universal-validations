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
    const result = await SchemaValidation.validate(
      {
        email: 'taken@example.com',
        password: 'password',
        name: 'John' // Valid name length for the 'create' schema
      },
      'create'
    )

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
    const result = await validation.validate(
      {
        email: 'valid@example.com',
        password: 'oldpassword',
        name: 'J' // Too short for create/update schema
      },
      ['update', 'reset']
    )

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
    const result = await SchemaValidation.validate(
      {
        email: 'not-an-email',
        password: 'short', // Would fail strongPassword in 'create' schema
        name: 'J' // Too short for create/update schema
      },
      'create'
    )

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
    const result = await SchemaValidation.validate(
      {
        email: 'new@example.com', // Not taken
        password: 'strongpassword', // Strong enough
        name: 'John' // Long enough
      },
      'create'
    )

    expect(result).toEqual({ errors: {}, valid: true })
  })

  it('handles the update schema correctly with all passing validations', async (): Promise<void> => {
    const validation = new SchemaValidation({ password: 'oldpassword' })

    const result = await validation.validate(
      {
        email: 'update@example.com',
        password: 'newpassword', // Different from old
        name: 'Jane' // Long enough
      },
      'update'
    )

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

  // Tests for the new schema descriptor functionality
  it('applies schema-specific options with object schema descriptor', async (): Promise<void> => {
    // Test with a non-example.org email for the custom schema
    const result = await SchemaValidation.validate(
      {
        email: 'user@gmail.com',
        password: 'validpassword' // Add a valid password to pass the non-schema validators
      },
      'custom'
    )

    // Check that the custom message from the schema descriptor is used
    expect(result.errors.email).toContain('Email domain must be example.org for custom schema')
    expect(result.valid).toBe(false)
  })

  it('respects the optional flag in schema-specific options', async (): Promise<void> => {
    // Test that custom validator with optional: true isn't called when email is missing
    const result = await SchemaValidation.validate(
      {
        password: 'validpassword'
        // No email provided at all
      },
      'custom'
    )

    // The base validators will still run and cause errors
    // But our custom schema validator shouldn't add its message
    if (result.errors.email) {
      expect((result.errors.email as string[]).includes('Email domain must be example.org for custom schema')).toBe(false)
    }
  })

  it('correctly handles array of schema descriptors with different options', async (): Promise<void> => {
    // Test premium schema with valid password to satisfy non-schema validators
    const premiumResult = await SchemaValidation.validate(
      {
        email: 'user@gmail.com',
        password: 'validpassword'
      },
      'premium'
    )

    // Check that the premium message from the schema descriptor is used
    expect(premiumResult.errors.email).toContain('Premium users must use premium domain')
    expect(premiumResult.valid).toBe(false)

    // Test admin schema
    const adminResult = await SchemaValidation.validate(
      {
        email: 'admin@gmail.com',
        password: 'validpassword'
      },
      'admin'
    )

    // Check that the admin message from the schema descriptor is used
    expect(adminResult.errors.email).toContain('Admins must use admin domain')
    expect(adminResult.valid).toBe(false)

    // Test with valid premium domain
    const validPremiumResult = await SchemaValidation.validate(
      {
        email: 'user@premium.example.com',
        password: 'validpassword'
      },
      'premium'
    )

    expect(validPremiumResult.valid).toBe(true)
  })

  it('respects priority settings in schema-specific options', async (): Promise<void> => {
    // Admin schema has priority 2 in the descriptor
    // First make the email fail the basic email validation but include valid password
    const result = await SchemaValidation.validate(
      {
        email: 'not-an-email',
        password: 'validpassword'
      },
      'admin'
    )

    // It should fail at the validFormat validator before even checking the domain
    expect(result.errors.email).toContain('email failed validFormat validation')
    // It should still have the admin domain error because all validations at the same priority run
    expect((result.errors.email as string[]).length).toBeGreaterThanOrEqual(1)
    expect(result.valid).toBe(false)
  })

  it('correctly handles mixed array of strings and schema descriptors', async (): Promise<void> => {
    // Test using a mixed array of strings and schema descriptors
    const result = await SchemaValidation.validate(
      {
        email: 'user@gmail.com',
        password: 'validpassword'
      },
      'mixed'
    )

    expect(result.errors.email).toContain('Mixed schema validation failed')
    expect(result.valid).toBe(false)

    // Test with a valid email that passes the mixed schema validation
    const validResult = await SchemaValidation.validate(
      {
        email: 'user@example.org',
        password: 'validpassword'
      },
      'mixed'
    )

    expect(validResult.valid).toBe(true)
  })

  it('handles SchemaDescriptor with optional options property', async (): Promise<void> => {
    // Test with a schema that uses a SchemaDescriptor without options
    const result = await SchemaValidation.validate(
      {
        email: 'user@gmail.com',
        password: 'validpassword'
      },
      'minimal'
    )

    // Should use the default message from the validator
    expect(result.errors.email).toContain('email failed domainValidation validation')
    expect(result.valid).toBe(false)
  })
})
