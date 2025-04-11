import { SchemaDescriptor, ValidationResult, ValidatorOptions, ValidatorRecords } from './types'

export default class BaseValidation {
  public readonly initialValues: Record<string, any>
  private __validatorRecords: ValidatorRecords

  public constructor(initialValues?: Record<string, any>) {
    this.initialValues = initialValues || {}
  }

  public static async validate(
    subject: Record<string, any>,
    initialValuesOrSchema?: Record<string, any> | string | string[],
    schema?: string | string[]
  ): Promise<ValidationResult> {
    // Determine if the second argument is a schema or initial values
    let actualInitialValues: Record<string, any> | undefined
    let actualSchema: string | string[] | undefined

    if (initialValuesOrSchema === undefined) {
      actualInitialValues = undefined
      actualSchema = schema
    } else if (typeof initialValuesOrSchema === 'string' || Array.isArray(initialValuesOrSchema)) {
      // Second argument is actually a schema
      actualInitialValues = undefined
      actualSchema = initialValuesOrSchema
    } else {
      // Second argument is initial values
      actualInitialValues = initialValuesOrSchema
      actualSchema = schema
    }

    return new this(actualInitialValues).validate(subject, actualSchema)
  }

  public async validate(subject: Record<string, any>, schema?: string | string[]): Promise<ValidationResult> {
    const errors = {}
    let valid = true

    const propertiesToValidate = Object.keys(this.__validatorRecords)

    for (let i = 0; i < propertiesToValidate.length; i++) {
      const currentProperty = propertiesToValidate[i]
      const subjectValue = subject[currentProperty]
      const initialSubjectValue = this.initialValues[currentProperty]
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

            // Check if validator should run and get schema-specific options if applicable
            const schemaResult = this.shouldRunValidator(currentValidation.options.schema, schema)

            // Skip validation if schema doesn't match
            if (schemaResult === false) continue

            // Merge schema-specific options with the validator's default options if applicable
            const validationOptions = typeof schemaResult === 'object' ? { ...currentValidation.options, ...schemaResult } : currentValidation.options

            if ((subjectValue === undefined || subjectValue === null) && validationOptions.optional) {
              activeOptional = true
            } else {
              const validatorValid = await this[currentValidation.methodName](subject[currentProperty], initialSubjectValue, subject)
              const finalValidity = validationOptions.inverse ? !validatorValid : validatorValid

              if (!finalValidity) {
                if (!errors[currentProperty]) errors[currentProperty] = []

                errors[currentProperty].push(validationOptions.message || `${currentProperty} failed ${currentValidation.methodName} validation`)

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

  private shouldRunValidator(validatorSchema?: ValidatorOptions['schema'], requestedSchema?: string | string[]): boolean | ValidatorOptions {
    // If validator has no schema, it runs with all schemas (default validator)
    if (!validatorSchema) return true

    // If no schema was requested, only run validators without a specific schema
    if (!requestedSchema) return false

    // Convert requestedSchema to array for easier handling
    const requestedSchemas = Array.isArray(requestedSchema) ? requestedSchema : [requestedSchema]

    // Handle string schema
    if (typeof validatorSchema === 'string') {
      return requestedSchemas.includes(validatorSchema)
    }

    // Handle SchemaDescriptor
    if (!Array.isArray(validatorSchema) && typeof validatorSchema === 'object') {
      if (requestedSchemas.includes(validatorSchema.for)) {
        // Return the schema-specific options to override the default validator options
        return validatorSchema.options || {}
      }
      return false
    }

    // Handle mixed array of strings and SchemaDescriptors
    if (Array.isArray(validatorSchema)) {
      for (const item of validatorSchema) {
        if (typeof item === 'string') {
          if (requestedSchemas.includes(item)) {
            return true
          }
        } else if (typeof item === 'object' && requestedSchemas.includes(item.for)) {
          return item.options || {}
        }
      }
    }

    return false
  }
}
