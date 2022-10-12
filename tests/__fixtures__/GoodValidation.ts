import { BaseValidation, Validator } from '../../src'

export default class GoodValidation extends BaseValidation {
  @Validator('name')
  public name(subject: any): boolean {
    return subject === 'right name'
  }

  @Validator('multiple')
  public multiple1(subject: any): boolean {
    return subject === 'right multiple'
  }

  @Validator('multiple')
  public multiple2(subject: any): boolean {
    return typeof subject === 'string'
  }

  @Validator('inverse', { inverse: true })
  public inverse(subject: any): boolean {
    return subject === 'right inverse'
  }

  @Validator('message', { message: 'Custom message for invalid' })
  public message(subject: any): boolean {
    return subject === 'right message'
  }

  @Validator('optional', { optional: true })
  public optional(subject: any): boolean {
    return subject === 'right optional'
  }

  @Validator('priority')
  public priority1(subject: any): boolean {
    return typeof subject === 'number'
  }

  @Validator('priority', { priority: 1 })
  public priority2A(subject: any): boolean {
    return subject > 10
  }

  @Validator('priority', { priority: 1 })
  public priority2B(subject: any): boolean {
    return subject < 100
  }
}
