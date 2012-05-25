# mongoose models would go here
mongoose = require('mongoose')
identitySchema = new mongoose.Schema({address: String, name: String})
messageSchema = new mongoose.Schema({to: [identitySchema], from: [identitySchema], subject: String, html: String, text: String, raw: String})
exports.Message = mongoose.model('Message',messageSchema)

