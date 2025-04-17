export interface ValidationResult {
  errors: { 
    [name: string]: string[] | ValidationResult | ValidationResult[]
  }
  valid: boolean
}

export interface SchemaDescriptor {
  for: string
  options?: Omit<ValidatorOptions, 'schema'>
}

export interface ValidatorOptions {
  inverse?: boolean
  message?: string
  optional?: boolean
  priority?: number
  schema?: string | SchemaDescriptor | (string | SchemaDescriptor)[]
  validationClass?: any
  validationClassSchema?: string | string[]
}

export interface ValidatorRecords {
  [name: string]: ValidatorRecord
}

export interface ValidatorRecord {
  validationsByPriority: { [priority: number]: { methodName: string; options: ValidatorOptions }[] }
  priorities: Set<number>
}
