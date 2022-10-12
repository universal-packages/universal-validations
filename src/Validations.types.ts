export interface ValidationsOptions {
  validationsLocation: string
}

export interface ValidationResult {
  errors: { [name: string]: string[] }
  valid: boolean
}

export interface ValidatorOptions {
  inverse?: boolean
  message?: string
  optional?: boolean
  priority?: number
}

export interface ValidatorRecords {
  [name: string]: ValidatorRecord
}

export interface ValidatorRecord {
  validationsByPriority: { [priority: number]: { methodName: string; options: ValidatorOptions }[] }
  priorities: Set<number>
}
