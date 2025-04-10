import { ValidationResult, ValidatorRecords } from './types'

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
    let actualInitialValues: Record<string, any> | undefined;
    let actualSchema: string | string[] | undefined;

    if (initialValuesOrSchema === undefined) {
      actualInitialValues = undefined;
      actualSchema = schema;
    } else if (typeof initialValuesOrSchema === 'string' || Array.isArray(initialValuesOrSchema)) {
      // Second argument is actually a schema
      actualInitialValues = undefined;
      actualSchema = initialValuesOrSchema;
    } else {
      // Second argument is initial values
      actualInitialValues = initialValuesOrSchema;
      actualSchema = schema;
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
            
            // Skip validations that don't match the schema criteria
            if (!this.shouldRunValidator(currentValidation.options.schema, schema)) {
              continue
            }

            if ((subjectValue === undefined || subjectValue === null) && currentValidation.options.optional) {
              activeOptional = true
            } else {
              const validatorValid = await this[currentValidation.methodName](subject[currentProperty], initialSubjectValue, subject)
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
  
  private shouldRunValidator(validatorSchema?: string | string[], requestedSchema?: string | string[]): boolean {
    // If validator has no schema, it runs with all schemas (default validator)
    if (!validatorSchema) return true
    
    // If no schema was requested, only run validators without a specific schema
    if (!requestedSchema) return false
    
    // Convert to arrays for easier handling
    const validatorSchemas = Array.isArray(validatorSchema) ? validatorSchema : [validatorSchema]
    const requestedSchemas = Array.isArray(requestedSchema) ? requestedSchema : [requestedSchema]
    
    // Run validator if any of its schemas match any of the requested schemas
    return validatorSchemas.some(vs => requestedSchemas.includes(vs))
  }
}
