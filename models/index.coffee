# mongoose models would go here
mongoose = require('mongoose')
crypto = require('crypto')

salt = '2aae6c35c94fcfb415dbe95f408b9ce91ee846ed'

inboxSchema = new mongoose.Schema({name:String, code: String});
inboxSchema.pre 'save', (next)->
  hash = crypto.createHash('sha1')
  hash.update(salt)
  hash.update(this.get('name'))
  this.code = hash.digest('hex')
  next()


identitySchema = new mongoose.Schema({address: String, name: String})
messageSchema = new mongoose.Schema({to: [identitySchema], from: [identitySchema], subject: String, html: String, text: String, raw: String, inbox_id: mongoose.Schema.ObjectId})
exports.Message = mongoose.model('Message',messageSchema)
exports.Inbox= mongoose.model('Inbox',inboxSchema)

