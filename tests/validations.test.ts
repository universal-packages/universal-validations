import GoodValidation from './__fixtures__/GoodValidation'
import NestedValidation from './__fixtures__/NestedValidation'
import LocationValidation from './__fixtures__/LocationValidation'

describe('validations', (): void => {
  it('holds internally the validations to run on a subject', async (): Promise<void> => {
    expect(GoodValidation.prototype['__validatorRecords']).toEqual({
      name: { validationsByPriority: { '0': [{ methodName: 'name', options: { priority: 0, message: 'name failed name validation' } }] }, priorities: new Set([0]) },
      multiple: {
        validationsByPriority: {
          '0': [
            { methodName: 'multiple1', options: { priority: 0, message: 'multiple failed multiple1 validation' } },
            { methodName: 'multiple2', options: { priority: 0, message: 'multiple failed multiple2 validation' } }
          ]
        },
        priorities: new Set([0])
      },
      inverse: {
        validationsByPriority: { '0': [{ methodName: 'inverse', options: { priority: 0, message: 'inverse failed inverse validation', inverse: true } }] },
        priorities: new Set([0])
      },
      message: { validationsByPriority: { '0': [{ methodName: 'message', options: { priority: 0, message: 'Custom message for invalid' } }] }, priorities: new Set([0]) },
      optional: {
        validationsByPriority: { '0': [{ methodName: 'optional', options: { priority: 0, message: 'optional failed optional validation', optional: true } }] },
        priorities: new Set([0])
      },
      priority: {
        validationsByPriority: {
          '0': [{ methodName: 'priority1', options: { priority: 0, message: 'priority failed priority1 validation' } }],
          '1': [
            { methodName: 'priority2A', options: { priority: 1, message: 'priority failed priority2A validation' } },
            { methodName: 'priority2B', options: { priority: 1, message: 'priority failed priority2B validation' } }
          ]
        },
        priorities: new Set([0, 1])
      },
      'initial-value': {
        validationsByPriority: {
          '0': [
            {
              methodName: 'initialValue',
              options: {
                message: 'initial-value failed initialValue validation',
                optional: true,
                priority: 0
              }
            }
          ]
        },
        priorities: new Set([0])
      }
    })
  })

  it('returns a valid record without errors if all validators pass', async (): Promise<void> => {
    const result = await GoodValidation.validate({
      name: 'right name',
      multiple: 'right multiple',
      inverse: 'wrong inverse',
      message: 'right message',
      optional: 'right optional',
      priority: 50
    })

    expect(result).toEqual({ errors: {}, valid: true })
  })

  it('returns an invalid record and errors with a single validation not passing', async (): Promise<void> => {
    const result = await GoodValidation.validate({
      name: 'wrong name',
      multiple: 'right multiple',
      inverse: 'wrong inverse',
      message: 'right message',
      optional: 'right optional',
      priority: 50
    })

    expect(result).toEqual({ errors: { name: ['name failed name validation'] }, valid: false })
  })

  it('returns multiple errors from multiple validators', async (): Promise<void> => {
    const result = await GoodValidation.validate({
      name: 'right name',
      multiple: 10,
      inverse: 'wrong inverse',
      message: 'right message',
      optional: 'right optional',
      priority: 50
    })

    expect(result).toEqual({ errors: { multiple: ['multiple failed multiple1 validation', 'multiple failed multiple2 validation'] }, valid: false })
  })

  it('can be configured to validate inversely', async (): Promise<void> => {
    const result = await GoodValidation.validate({
      name: 'right name',
      multiple: 'right multiple',
      inverse: 'right inverse',
      message: 'right message',
      optional: 'right optional',
      priority: 50
    })

    expect(result).toEqual({ errors: { inverse: ['inverse failed inverse validation'] }, valid: false })
  })

  it('can be configured with custom messages', async (): Promise<void> => {
    const result = await GoodValidation.validate({
      name: 'right name',
      multiple: 'right multiple',
      inverse: 'wrong inverse',
      message: 'wrong message',
      optional: 'right optional',
      priority: 50
    })

    expect(result).toEqual({ errors: { message: ['Custom message for invalid'] }, valid: false })
  })

  it('can be configured to not run the validator if the property is not set', async (): Promise<void> => {
    let result = await GoodValidation.validate({
      name: 'right name',
      multiple: 'right multiple',
      inverse: 'wrong inverse',
      message: 'right message',
      optional: 'wrong optional',
      priority: 50
    })

    expect(result).toEqual({ errors: { optional: ['optional failed optional validation'] }, valid: false })

    result = await GoodValidation.validate({
      multiple: 'right multiple',
      inverse: 'wrong inverse',
      message: 'right message',
      optional: 'right optional',
      priority: 50
    })

    expect(result).toEqual({ errors: { name: ['name failed name validation'] }, valid: false })

    result = await GoodValidation.validate({
      name: 'right name',
      multiple: 'right multiple',
      inverse: 'wrong inverse',
      message: 'right message',
      optional: null,
      priority: 50
    })

    expect(result).toEqual({ errors: {}, valid: true })
  })

  it('validators can be configured to run by priority', async (): Promise<void> => {
    let result = await GoodValidation.validate({
      name: 'right name',
      multiple: 'right multiple',
      inverse: 'wrong inverse',
      message: 'right message',
      optional: 'right optional',
      priority: 'not a number'
    })

    expect(result).toEqual({ errors: { priority: ['priority failed priority1 validation'] }, valid: false })

    result = await GoodValidation.validate({
      name: 'right name',
      multiple: 'right multiple',
      inverse: 'wrong inverse',
      message: 'right message',
      optional: 'right optional',
      priority: 1000
    })

    expect(result).toEqual({ errors: { priority: ['priority failed priority2B validation'] }, valid: false })

    result = await GoodValidation.validate({
      name: 'right name',
      multiple: 'right multiple',
      inverse: 'wrong inverse',
      message: 'right message',
      optional: 'right optional',
      priority: 5
    })

    expect(result).toEqual({ errors: { priority: ['priority failed priority2A validation'] }, valid: false })
  })

  it('validators can access initial values', async (): Promise<void> => {
    const validation = new GoodValidation({ 'initial-value': 'Initial' })

    let result = await validation.validate({
      name: 'right name',
      multiple: 'right multiple',
      inverse: 'wrong inverse',
      message: 'right message',
      optional: 'right optional',
      priority: 50,
      'initial-value': 'Initial'
    })

    expect(result).toEqual({ errors: {}, valid: true })

    result = await validation.validate({
      name: 'right name',
      multiple: 'right multiple',
      inverse: 'wrong inverse',
      message: 'right message',
      optional: 'right optional',
      priority: 50,
      'initial-value': 'Not initial'
    })

    expect(result).toEqual({
      errors: {
        'initial-value': ['initial-value failed initialValue validation']
      },
      valid: false
    })
  })

  describe('nested validation', (): void => {
    it('validates nested objects using validation classes', async (): Promise<void> => {
      const result = await NestedValidation.validate({
        name: 'valid-name',
        location: {
          longitude: 100,
          latitude: 45
        }
      })

      expect(result).toEqual({ errors: {}, valid: true })
    })

    it('returns errors for invalid nested objects with prefixed error messages', async (): Promise<void> => {
      const result = await NestedValidation.validate({
        name: 'valid-name',
        location: {
          longitude: 200, // Invalid: > 180
          latitude: 45
        }
      })

      expect(result).toEqual({
        errors: {
          location: ['location-longitude failed validateLongitude validation']
        },
        valid: false
      })
    })

    it('returns errors for both parent and nested validations', async (): Promise<void> => {
      const result = await NestedValidation.validate({
        name: 'invalid-name',
        location: {
          longitude: 100,
          latitude: 100 // Invalid: > 90
        }
      })

      expect(result).toEqual({
        errors: {
          name: ['name failed validateName validation'],
          location: ['location-latitude failed validateLatitude validation']
        },
        valid: false
      })
    })

    it('allows optional nested objects', async (): Promise<void> => {
      const result = await NestedValidation.validate({
        name: 'valid-name',
        location: {
          longitude: 100,
          latitude: 45
        },
        optionalLocation: null
      })

      expect(result).toEqual({ errors: {}, valid: true })
    })

    it('passes initial values to nested validations', async (): Promise<void> => {
      // Create a location validation with initial values
      const initialLocation = {
        longitude: 100,
        latitude: 45
      }

      // Create a nested validation with initial values for the location
      const validation = new NestedValidation({
        location: initialLocation
      })

      // Create a mock function to verify if validate gets called with correct params
      const originalValidateMethod = LocationValidation.prototype.validate
      let receivedInitialValues = null

      try {
        // Replace the validate method with a mock that captures the initial values
        LocationValidation.prototype.validate = jest.fn(async function(subject, schema) {
          // 'this' now refers to the instance
          receivedInitialValues = this.initialValues
          // Call the original method with the right context
          return originalValidateMethod.call(this, subject, schema)
        })

        await validation.validate({
          name: 'valid-name',
          location: {
            longitude: 100,
            latitude: 45
          }
        })

        // Verify the initial values were passed to the nested validation
        expect(receivedInitialValues).toEqual(initialLocation)
      } finally {
        // Restore the original method
        LocationValidation.prototype.validate = originalValidateMethod
      }
    })
  })
})
