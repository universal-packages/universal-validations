import { ValidatorOptions, ValidatorRecords } from './Validations.types'

export default function Validator(property: string, options?: ValidatorOptions): (target: any, methodName: string, descriptor: PropertyDescriptor) => PropertyDescriptor {
  return (target: any, methodName: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const finalOptions: ValidatorOptions = { priority: 0, message: `${property} failed ${methodName} validation`, ...options }
    const validatorRecords: ValidatorRecords = target.__validatorRecords || {}

    target.__validatorRecords = validatorRecords

    if (!validatorRecords[property]) validatorRecords[property] = { validationsByPriority: {}, priorities: new Set() }
    if (!validatorRecords[property].validationsByPriority[finalOptions.priority]) validatorRecords[property].validationsByPriority[finalOptions.priority] = []

    validatorRecords[property].validationsByPriority[finalOptions.priority].push({ methodName, options: finalOptions })
    validatorRecords[property].priorities.add(finalOptions.priority)

    return descriptor
  }
}
