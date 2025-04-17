import { BaseValidation, Validator } from '../../src'
import LocationValidation from './LocationValidation'
import TagValidation from './TagValidation'

// Validation with location
export class LocationNestedValidation extends BaseValidation {
  @Validator('name')
  public validateName(subject: any): boolean {
    return subject === 'valid-name'
  }

  @Validator('location', LocationValidation)
  public validateLocation(location: any): any {
    return location
  }
}

// Validation with optional location
export class OptionalLocationValidation extends BaseValidation {
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

// Validation with tags array
export class TagsValidation extends BaseValidation {
  @Validator('name')
  public validateName(subject: any): boolean {
    return subject === 'valid-name'
  }

  @Validator('tags', TagValidation)
  public validateTags(tags: any[]): any {
    return tags
  }
}
