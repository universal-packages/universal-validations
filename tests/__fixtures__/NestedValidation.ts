import { BaseValidation, Validator } from '../../src'
import LocationValidation from './LocationValidation'
import SchemaValidation from './SchemaValidation'
import TagValidation from './TagValidation'

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

export class OptionalLocationNestedValidation extends BaseValidation {
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

export class TagsNestedValidation extends BaseValidation {
  @Validator('name')
  public validateName(subject: any): boolean {
    return subject === 'valid-name'
  }

  @Validator('tags', TagValidation)
  public validateTags(tags: any[]): any {
    return tags
  }
}

export class SchemaNestedValidation extends BaseValidation {
  @Validator('name')
  public validateName(subject: any): boolean {
    return subject === 'valid-name'
  }

  @Validator('schema', SchemaValidation, 'create')
  public validateSchemaLocation(location: any): any {
    return location
  }
}
