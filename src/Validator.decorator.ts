import BaseValidation from './BaseValidation'
import { ValidatorOptions, ValidatorRecords } from './types'

export default function Validator(property: string): (target: any, methodName: string, descriptor: PropertyDescriptor) => PropertyDescriptor
export default function Validator(property: string, options: ValidatorOptions): (target: any, methodName: string, descriptor: PropertyDescriptor) => PropertyDescriptor
export default function Validator(
  property: string,
  validationClass: typeof BaseValidation
): (target: any, methodName: string, descriptor: PropertyDescriptor, validationClassSchema?: string | string[]) => PropertyDescriptor
export default function Validator(
  property: string,
  validationClass: typeof BaseValidation,
  validationClassSchema: string | string[]
): (target: any, methodName: string, descriptor: PropertyDescriptor) => PropertyDescriptor
export default function Validator(
  property: string,
  optionsOrValidationClass?: ValidatorOptions | typeof BaseValidation,
  validationClassSchema?: string | string[]
): (target: any, methodName: string, descriptor: PropertyDescriptor) => PropertyDescriptor {
  return (target: any, methodName: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    let finalOptions: ValidatorOptions = { priority: 0, message: `${property} failed ${methodName} validation` }

    if (optionsOrValidationClass) {
      if (typeof optionsOrValidationClass === 'function') {
        // If second argument is a validation class
        finalOptions.validationClass = optionsOrValidationClass
        finalOptions.validationClassSchema = validationClassSchema
      } else {
        // If second argument is options object
        finalOptions = { ...finalOptions, ...optionsOrValidationClass }
      }
    }

    const validatorRecords: ValidatorRecords = target.__validatorRecords || {}

    target.__validatorRecords = validatorRecords

    if (!validatorRecords[property]) validatorRecords[property] = { validationsByPriority: {}, priorities: new Set() }
    if (!validatorRecords[property].validationsByPriority[finalOptions.priority]) validatorRecords[property].validationsByPriority[finalOptions.priority] = []

    validatorRecords[property].validationsByPriority[finalOptions.priority].push({ methodName, options: finalOptions })
    validatorRecords[property].priorities.add(finalOptions.priority)

    return descriptor
  }
}
