import { BaseValidation, Validator } from '../../src'

export default class TagValidation extends BaseValidation {
  @Validator('name')
  public validateName(subject: any): boolean {
    return subject === 'valid'
  }
} 
