import GoodValidation from './__fixtures__/GoodValidation'

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
})
