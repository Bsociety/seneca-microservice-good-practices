# Code Style BTime V2 - Microservice

## Files

- Use specific files for specific responsabilities. Example:

1. `create.js`
1. `select.js`
1. `update.js`
1. `delete.js`

## Functions

- Use **private functions** for specific responsabilities. Examples: Joi validation, the message sending to another microservice, etc.

- All private functions **must** return a `promise`. Exceptions: Joi validation.

### Using Parameters Fomatation and Joi Validation on Validate Package

- Example:

```js
const MergeValidate = require('btime-merge-validate-package')
const mergeValidate = MergeValidate(seneca)

  ...

mergeValidate.validate({
  args,
  pick: PICK_FIELDS,
  schema: getValidateSchema(),
  options: { abortEarly: false }
})
  .then(params => create(params))
  .then(result => done(null, result))
  .catch(err => done(null, err))
```
[Complete example](https://github.com/Btime/btime-microservice-code-style/blob/master/examples/validate.js)

### Joi Validation on Microservice

- The function responsible for Joi validation **must** have the signature `getValidateSchema ()`

- This function **must** have a separation (`\n`) between field rules. Example:

```js
{
  type: Joi.string()
  .required()
  .valid(DOCUMENT_TYPES)
  .description('the user enabled status'),

  number: Joi.number()
  .required()
  .description('the user deleted status')
}
```

### The message sending to another microservice

- The function responsible for sending a message to another microservice
**must** respect `err` and `response` as the pattern below:

```js
const logMessage = 'LOG::[SERVICE | UPSERT]'
return new Promise((resolve, reject) => {
  const pattern = {}
  const payload = {}
  seneca.act(pattern, payload, (err, response) => {
    if (err) {
      seneca.log.fatal(logMessage, err)
      return reject(err)
    }
    if (!response.status) {
      seneca.log.error(logMessage, err)
      return reject(response)
    }
    seneca.log.info(logMessage, err)
    return resolve(response)
  })
})
```

### Chain Promises

- The chain promises responsible for executing a bussiness rules
**must** respect the `then` and `catch` as the pattern below:

```js
specficFunction(params)
  .then(result => done(null, result))
  .catch(err => done(null, { status: false, message: err && err.message || err }))
```

## Responses

### In case of Error

- Error responses of a microservice **must** follow the pattern below.

- This pattern **must** be used for Joi validation or any other microservice that contains errors, whatever these errors come from *Joi*, *entity microservice*, etc.

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

- The test directory **must** follow the structure below, using contributor as an example:

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

- It **must** be only one file

- The file **must** respect the order below:

1. Create/Upsert (when creating)
1. Select
1. Update
1. Delete

### Mocks

- Each responsability contained in the microservice **must** have a mock file, into `mocks` directory.
Example:

1. `upsert.js`
1. `select.js`
1. `delete.js`
