import { BaseValidation, Validator } from '../../src'
import LocationValidation from './LocationValidation'

export default class NestedValidation extends BaseValidation {
  @Validator('name')
  public validateName(subject: any): boolean {
    return subject === 'valid-name'
  }

  @Validator('location', LocationValidation)
  public validateLocation(location: any): any {
    return location
  }

  @Validator('optionalLocation', { validationClass: LocationValidation, optional: true })
  public validateOptionalLocation(location: any): any {
    return location
  }
} 
