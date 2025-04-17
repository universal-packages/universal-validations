import { BaseValidation, Validator } from '../../src'

export default class LocationValidation extends BaseValidation {
  @Validator('longitude')
  public validateLongitude(subject: any): boolean {
    return typeof subject === 'number' && subject >= -180 && subject <= 180
  }

  @Validator('latitude')
  public validateLatitude(subject: any): boolean {
    return typeof subject === 'number' && subject >= -90 && subject <= 90
  }
} 
