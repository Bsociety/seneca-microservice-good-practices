# SenecaJS Microservice - Good Practices

![npm](https://img.shields.io/badge/npm-v5.6.1-blue.svg) ![yarn](https://img.shields.io/badge/yarn-v1.3.2-blue.svg) ![node](https://img.shields.io/badge/node-v8.9.0-brightgreen.svg)

## Table of Contents
1. [Packages](#packages)
1. [Files](#files)
1. [Functions](#functions)
    1. [Joi validation](#joi-validation)
    1. [Params formatation/validation](#params-formatationvalidation)
    1. [Promises Chaining](#promises-chaining)
    1. [Logging](#logging)
    1. [Message sending to another microservice](#message-sending-to-another-microservice)
1. [Responses](#responses)
    1. [In case of Error](#in-case-of-error)
    1. [In case of Success](#in-case-of-success)
1. [Tests](#tests)
    1. [Test file](#test-file)
    1. [Mocks](#mocks)
1. [Pull Requests](#pull-requests)
    1. [Recomendation](#recomendation)

## Packages

- Add [`Seneca Merge-Validate package`](https://www.npmjs.com/package/seneca-merge-validate):

```bash
$ npm i seneca-merge-validate@latest -S
```

## Files

- Use specific files for specific responsabilities. Example:

1. `create.js`
1. `select.js`
1. `update.js`
1. `delete.js`

### Recomendation

- In any file all lines **should** respect max **80** chars.

## Functions

- Use **private functions** for specific responsabilities. Examples: Joi validation, message sending to another microservice, etc.

- All private functions **must** return a `promise`. Exception: Joi validation.

### Joi validation

- The function responsible for defining Joi validation **must** have the signature `getValidateSchema ()`.

- This function **must** have a separator (`\n`) between field rules. Example:

```js
function getValidateSchema () {
  return {
    type: Joi.string()
    .required()
    .description('the type'),

    number: Joi.number()
    .required()
    .description('the number')
  }
}
```

### Params formatation/validation

- The params formatation and validation is going to use [`Seneca Merge-Validate package`](https://github.com/Bsociety/seneca-merge-validate)

- The validate method **must** send `args`, `PICK_FIELDS` constant, Joi `schema` defined on `getValidateSchema` function and `options`.

- Example:

```js
const SenecaMergeValidate = require('seneca-merge-validate')
const senecaMergeValidate = SenecaMergeValidate(seneca)
const Joi = senecaMergeValidate.Joi
const PICK_FIELDS = [
  'id'
]

  /* ... */

senecaMergeValidate.validate({
  args,
  pick: PICK_FIELDS,
  schema: getValidateSchema(),
  options: { abortEarly: false }
})
```

[Complete example](https://github.com/Bsociety/seneca-microservice-good-practices/blob/master/examples/validate.js)

### Promises Chaining

- The chaining promises responsible for executing bussiness rules
**must** respect `then` and `catch` as the pattern below:

```js
  senecaMergeValidate.validate({ /* ... */ })
    .then(params => yourFunction(params))
    .then(result => done(null, result))
    .catch(err => done(null, {
      status: false,
      message: err && err.message || err
    }))
```

### Logging

- The log tag **must** be declared in global scope as the pattern below:

```js
const LOG_TAG = 'LOG::[DOCUMENT | DELETE]'
```

### Message sending to another microservice

- The function responsible for sending a message to another microservice
**must** respect `err`, `response` and `logging` as the pattern below:

```js
function yourFunction (params) {
  return new Promise((resolve, reject) => {
    const pattern = definePattern()
    const payload = definePayload(params)
    seneca.act(pattern, payload, (err, response) => {
      if (err) {
        seneca.log.fatal(LOG_TAG, err)
        return reject(err)
      }
      if (!response.status) {
        seneca.log.error(LOG_TAG, response)
        return reject(response)
      }
      seneca.log.info(LOG_TAG, response)
      return resolve(response)
    })
  })
}
```

- The `pattern` and `payload` needed to send a message to another microservice
**must** be defined on specific functions, for each one. Example:

```js
function definePattern () {
  return { role: 'entity', get: 'service', method: 'update' }
}

function definePayload (formattedParams) {
  const params = {
    where: {
      id: formattedParams.id,
      deleted: formattedParams.deleted || false
    }
  }

  return { query: { params, data: { deleted: true } } }
}
```

## Responses

### In case of Error

- Error responses of a microservice **must** follow the pattern below.

- This pattern **must** be used for Joi validation or any other microservice that contains errors.

```js
{
  status: false,
  message: 'Error message here'
}
```

### In case of Success

- Success responses of a microservice **must** follow the pattern below. Exceptions: `entity`, `webapi`.

```js
{
  status: true,
  result: 'Success result here'
}
```

## Tests

- The test directory **must** follow the structure below, using `contributor` as an example:

```bash
├── test
│   ├── assets/
│   ├── mocks/
│   ├── contributor.test.js
│   ├── helpers.js
```


### Test file

- The file name responsible for testing the microservice **must** have the microservice name with `.test.js`.
Example: `contributor.test.js`.

- It **must** be only one file.

- If its a composite name it **must** be writen as the pattern below:

```js
composite_name.test.js
```

- The file **must** respect the order below:

1. Create/Upsert
1. Select
1. Update
1. Delete

- Into each test, `pattern` and `payload` constants **must** be used, example:

```js
describe('Complete Tests', () => {
  describe('Specific test', () => {
    it('Expect Joi validation to detect error on payload', (done) => {
      const pattern = Mock.pattern
      const payload = Mock.invalidPayload.payload
      seneca.act(pattern, payload, (err, response) => {
        try {
          expect(err).to.be.equal(null)
          expect(response.status).to.be.equal(false)
          expect(typeof response.message).to.be.equal('object')
          expect(response.message.name).to.be.equal('ValidationError')
          done(null)
        } catch (err) {
          done(err)
        }
      })
    })
  })
})
```

### Mocks

- Each responsability contained in the microservice **must** have a mock file, into `mocks` directory.
Example:

1. `upsert.js`
1. `select.js`
1. `delete.js`

## Pull Requests

### Recomendation

- Internal projects **should** name `branches` and `pull requests` with same ID as the Jira tasks. Example:

```
Jira task: B2-420

Branch: B2-420

Pull Request: B2 420
```

- Each `pull request` and `branch` created **should** have the ID of a main task and **not** sub-tasks.

- **Always** use Jira time-trackers on sub-tasks.

- Each `pull request` **should** contain *bussiness rules* (the task itself), *unit/behavior tests* and *WebAPI endpoints*.
