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

  @Validator('email', { 
    schema: { 
      for: 'custom', 
      options: { 
        message: 'Email domain must be example.org for custom schema',
        optional: true 
      } 
    } 
  })
  public customDomainEmail(subject: any): boolean {
    return subject.endsWith('@example.org')
  }

  @Validator('email', { 
    schema: [
      { for: 'premium', options: { message: 'Premium users must use premium domain' } },
      { for: 'admin', options: { message: 'Admins must use admin domain', priority: 2 } }
    ]
  })
  public specialDomainEmail(subject: any): boolean {
    if (subject.endsWith('@premium.example.com') || subject.endsWith('@admin.example.com')) {
      return true
    }
    return false
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
