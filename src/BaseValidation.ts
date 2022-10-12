import { ValidationResult, ValidatorRecords } from './Validations.types'

export default class BaseValidation {
  private __validatorRecords: ValidatorRecords

  public static async validate(subject: Record<string, any>): Promise<ValidationResult> {
    return new this().validate(subject)
  }

  public async validate(subject: Record<string, any>): Promise<ValidationResult> {
    const errors = {}
    let valid = true

    const propertiesToValidate = Object.keys(this.__validatorRecords)

    for (let i = 0; i < propertiesToValidate.length; i++) {
      const currentProperty = propertiesToValidate[i]
      const subjectValue = subject[currentProperty]
      const currentValidatorRecord = this.__validatorRecords[currentProperty]
      const sortedPriorities = Array.from(currentValidatorRecord.priorities).sort()
      let propertyValid = true
      let activeOptional = false

      for (let j = 0; j < sortedPriorities.length; j++) {
        const currentPriority = sortedPriorities[j]
        const priorityValidations = currentValidatorRecord.validationsByPriority[currentPriority]

        if (propertyValid || activeOptional) {
          for (let k = 0; k < priorityValidations.length; k++) {
            const currentValidation = priorityValidations[k]

            if (subjectValue === undefined && currentValidation.options.optional) {
              activeOptional = true
            } else {
              const validatorValid = await this[currentValidation.methodName](subject[currentProperty], subject)
              const finalValidity = currentValidation.options.inverse ? !validatorValid : validatorValid

              if (!finalValidity) {
                if (!errors[currentProperty]) errors[currentProperty] = []

                errors[currentProperty].push(currentValidation.options.message)

                valid = false
                propertyValid = false
              }
            }
          }
        } else {
          break
        }
      }
    }

    return { errors, valid }
  }
}
