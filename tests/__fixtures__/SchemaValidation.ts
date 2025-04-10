import { BaseValidation, Validator } from '../../src'

export default class SchemaValidation extends BaseValidation {
  @Validator('email')
  public isString(subject: any): boolean {
    return typeof subject === 'string'
  }

  @Validator('email')
  public validFormat(subject: any): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subject)
  }

  @Validator('email', { schema: 'create' })
  public uniqueEmail(subject: any): boolean {
    // In a real app, this would check if the email is already in use
    return subject !== 'taken@example.com'
  }

  @Validator('password')
  public isPasswordString(subject: any): boolean {
    return typeof subject === 'string'
  }

  @Validator('password', { schema: 'create' })
  public strongPassword(subject: any): boolean {
    return subject && subject.length >= 8
  }

  @Validator('password', { schema: ['update', 'reset'] })
  public differentPassword(subject: any, initialValue: any): boolean {
    return subject !== initialValue
  }

  @Validator('name', { schema: ['create', 'update'] })
  public validName(subject: any): boolean {
    return subject && subject.length >= 2
  }
} 
