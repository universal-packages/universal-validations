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

## Decorators

#### **`@Validator(property: string, [options])`**

The validator decorator enable a class method to act as a validator, the method should return a boolean to tell teh validation if the property is valid or not. The first argument of the decorator is the property to be validated.

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

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
