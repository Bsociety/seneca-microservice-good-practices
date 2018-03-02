function Plugin() {
  const seneca = this
  const MergeValidate = require('btime-merge-validate-package')
  const mergeValidate = MergeValidate(seneca)
  const PICK_FIELDS = [
    'field'
  ]

  seneca.add({ role: 'plugin', cmd: 'create' }, cmd_create)

  function cmd_create(args, done) {
    mergeValidate.validate({
      args,
      pick: PICK_FIELDS,
      schema: getValidateSchema(),
      options: { abortEarly: false }
    })
      .then(create)
      .then(result => done(null, result))
      .catch(err => done(null, err))
  }

  function createService(params) {
    return new Promise((resolve, reject) => {
      return reject({ status: false, message: 'Error' })
      return resolve({ status: true, result: {} })
    })
  }
}
