# Validations

[![npm version](https://badge.fury.io/js/@universal-packages%2Fvalidations.svg)](https://www.npmjs.com/package/@universal-packages/validations)
[![Testing](https://github.com/universal-packages/universal-validations/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-validations/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-validations/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-validations)

Simple validation system based on decorators to enable a class to validate a subject properties.

## Install

```shell
npm install @universal-packages/validations
```

## BaseValidation

Extend the base validation to start building a class validation, when running the validation you will get validation record containing errors if any and a `valid` flag to quick knowing if if was successful.

```js
import { BaseValidation, Validator } from '@universal-packages/validations'

export default class UserValidation extends BaseValidation {
  @Validator('name')
  rightNameSize(value) {
    return value.length > 5 && value.length < 128
  }
}

console.log(await UserValidation.validate({ name: 'sm' }))

// > { errors: { name: ['name failed rightNameSize validation'] }, valid: false }
```

### Initial values

You can pass initial values so that you can reference them in your validators, for example when you don't want to perform heavy validations on values that were already validated.

```js
import { BaseValidation, Validator } from '@universal-packages/validations'

export default class UpdateUserValidation extends BaseValidation {
  @Validator('email')
  alreadyInDb(value, initialName) {
    if (value === initialName) return true
    return !await db.exists({ email: value })
  }
}

const validation = new UpdateUserValidation({ name: 'email' })

console.log(await validation.validate({ name: 'email' }))

// > { errors: {}, valid: true }
```

### Schema-based validation

You can create validators that only run for specific validation schemas. This is useful when you want to have different validation rules for different operations (e.g., create, update, delete).

```js
import { BaseValidation, Validator } from '@universal-packages/validations'

export default class UserValidation extends BaseValidation {
  // This validator runs for all schemas (default)
  @Validator('email')
  isValidFormat(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  // This validator only runs when the 'create' schema is specified
  @Validator('email', { schema: 'create' })
  isUniqueEmail(value) {
    return !await db.exists({ email: value })
  }

  // This validator runs for both 'update' and 'reset' schemas
  @Validator('password', { schema: ['update', 'reset'] })
  isDifferentPassword(value, initialValue) {
    return value !== initialValue
  }

  // Schema descriptor with custom options for specific schema
  @Validator('email', { 
    schema: { 
      for: 'custom', 
      options: { 
        message: 'Custom validation failed',
        optional: true 
      } 
    } 
  })
  customValidation(value) {
    return value.endsWith('@example.org')
  }

  // Multiple schema descriptors with different options for each
  @Validator('email', { 
    schema: [
      { for: 'premium', options: { message: 'Premium users require special validation' } },
      { for: 'admin', options: { message: 'Admin users require special validation', priority: 2 } }
    ]
  })
  specialValidation(value) {
    return value.includes('special')
  }
}

// Run default validators only (no schema-specific validators)
console.log(await UserValidation.validate({ email: 'invalid' }))
// > { errors: { email: ['email failed isValidFormat validation'] }, valid: false }

// Run default validators and 'create' schema validators
console.log(await UserValidation.validate({ email: 'existing@example.com' }, 'create'))
// > { errors: { email: ['email failed isUniqueEmail validation'] }, valid: false }

// Run default validators and multiple schema validators
const validation = new UserValidation({ password: 'oldpass' })
console.log(await validation.validate({ password: 'oldpass' }, ['update', 'reset']))
// > { errors: { password: ['password failed isDifferentPassword validation'] }, valid: false }

// When passing both initialValues and schema
console.log(await UserValidation.validate(
  { password: 'oldpass' },
  { password: 'originalpass' },
  'update'
))
// > { errors: { password: ['password failed isDifferentPassword validation'] }, valid: false }

// Using schema with custom options
console.log(await UserValidation.validate({ email: 'user@gmail.com' }, 'custom'))
// > { errors: { email: ['Custom validation failed'] }, valid: false }
```

When running validation:

- Without a schema: Only validators without a schema option will run.
- With a specific schema: All validators without a schema option AND validators with a matching schema will run.
- With multiple schemas (array): All validators without a schema option AND validators matching ANY of the provided schemas will run.

#### Schema Descriptors

Schema descriptors allow you to specify different validation options for different schemas:

```js
// Simple schema (string or string[])
@Validator('email', { schema: 'create' })
@Validator('email', { schema: ['create', 'update'] })

// Schema descriptor with custom options
@Validator('email', { 
  schema: { 
    for: 'custom',  // The schema name this applies to
    options: {      // Override validator options for this schema (optional)
      message: 'Custom error message for this schema',
      optional: true,
      priority: 2
    } 
  } 
})

// Multiple schema descriptors
@Validator('email', { 
  schema: [
    { for: 'schema1', options: { message: 'Error for schema1' } },
    { for: 'schema2', options: { optional: true } }
  ] 
})

// Mixed array of strings and schema descriptors
@Validator('email', {
  schema: [
    'create',
    'update',
    { for: 'custom', options: { message: 'Custom validation' } }
  ]
})

// Schema descriptor with optional options
@Validator('email', {
  schema: { for: 'minimal' } // options is optional
})
```

Schema descriptor options override the default validator options when validating with the matching schema. The options that can be overridden include:
- `message`: Custom error message for this schema
- `optional`: Whether the field is optional for this schema
- `priority`: Validation priority for this schema
- `inverse`: Whether to invert the validation result for this schema

### Nested Validations

You can validate nested objects by composing validation classes. This allows you to create reusable validation components for complex data structures.

```js
import { BaseValidation, Validator } from '@universal-packages/validations'

// Define a validation class for location objects
class LocationValidation extends BaseValidation {
  @Validator('longitude')
  validateLongitude(value) {
    return typeof value === 'number' && value >= -180 && value <= 180
  }

  @Validator('latitude')
  validateLatitude(value) {
    return typeof value === 'number' && value >= -90 && value <= 90
  }
}

// Use the location validation in a user validation class
class UserValidation extends BaseValidation {
  @Validator('name')
  validateName(value) {
    return typeof value === 'string' && value.length > 0
  }

  // Pass the validation class directly
  @Validator('location', LocationValidation)
  validateLocation(location) {
    return location // Return the location object to be validated
  }
  
  // Alternatively, use the validationClass option
  @Validator('alternateLocation', { validationClass: LocationValidation, optional: true })
  validateAlternateLocation(location) {
    return location
  }
}

// Validate a user with a nested location
const result = await UserValidation.validate({
  name: 'John',
  location: {
    longitude: 200, // Invalid: > 180
    latitude: 45
  }
})

console.log(result)
// > {
// >   errors: {
// >     location: ['location-longitude failed validateLongitude validation']
// >   },
// >   valid: false
// > }
```

#### Error messages for nested validations

Error messages from nested validations are prefixed with the parent property name, allowing you to identify which nested property failed validation.

## Decorators

#### **`@Validator(property: string, [options | validationClass])`**

The validator decorator enable a class method to act as a validator, the method should return a boolean to tell teh validation if the property is valid or not. The first argument of the decorator is the property to be validated. The second argument can be either options or a validation class for nested validation.

You can use several methods to validate a single property:

```js
import { BaseValidation, Validator } from '@universal-packages/validations'

export default class UserValidation extends BaseValidation {
  @Validator('name')
  isAString(value) {
    return typeof value === 'string'
  }

  @Validator('name')
  rightNameSize(value) {
    return value.length > 5 && value.length < 128
  }
}

console.log(await UserValidation.validate({ name: 50 }))

// > { errors: { name: ['name failed isAString validation', 'name failed rightNameSize validation'] }, valid: false }
```

#### Options

- **`inverse`** `Boolean`
  Inverts the validator validity of the method returns true the property is invalid.

  ```js
  @Validator('name', { inverse: true })
  isPretty(value) {
    return value === 'ugly'
  }
  ```

- **`message`** `String`
  When the validation fails set the error with a custom message.

  ```js
  @Validator('name', { message: 'Name is not pretty' })
  isPretty(value) {
    return value !== 'ugly'
  }
  ```

- **`optional`** `Boolean`
  The validation will run only if the property is set (not undefined nor null).

  ```js
  @Validator('name', { optional: true })
  isStrong(password) {
    return password.length > 69
  }
  ```

- **`priority`** `Number`
  The priority level for the validation, if a validation with a lower number fails validations with a upper number will not run, but all validations in the same priority will run.

  Use this so validations don't throw an error reading an unexpected type.

  ```js
  @Validator('name')
  isString(value) {
    return typeof value === 'string'
  }

  @Validator('name', { priority: 1})
  containsWord(value) {
    return value.indexOf('word') !== -1
  }
  ```
  
- **`validationClass`** `Class`
  Specifies a validation class to use for validating a nested object. The validation method should return the nested object to be validated.

  ```js
  // Pass the validation class as the second argument
  @Validator('location', LocationValidation)
  validateLocation(location) {
    return location
  }

  // Or use the validationClass option
  @Validator('location', { validationClass: LocationValidation, optional: true })
  validateLocation(location) {
    return location
  }
  ```

- **`schema`** `String | SchemaDescriptor | (String | SchemaDescriptor)[]`
  Specifies that the validator should only run for specific validation schemas. If not provided, the validator runs for all schemas.

  ```js
  // Only runs when validating with the 'create' schema
  @Validator('email', { schema: 'create' })
  isUnique(value) {
    return !userExists(value)
  }

  // Runs when validating with either 'update' or 'reset' schemas
  @Validator('password', { schema: ['update', 'reset'] })
  isDifferent(value, initialValue) {
    return value !== initialValue
  }
  
  // Using SchemaDescriptor to provide schema-specific options
  @Validator('email', { 
    schema: { for: 'custom', options: { message: 'Custom message' } } 
  })
  customValidation(value) {
    return isCustomValid(value)
  }
  
  // Using mixed array of strings and SchemaDescriptor objects
  @Validator('email', { 
    schema: [
      'create', 
      'update', 
      { for: 'custom', options: { message: 'Custom message' } }
    ]
  })
  mixedSchemaValidation(value) {
    return isMixedSchemaValid(value)
  }
  ```

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
