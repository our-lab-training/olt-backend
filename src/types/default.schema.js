const {Schema} = require('mongoose');
const ObjectIdType = require('./objectId.type');

const DefaultSchema = module.exports = new Schema({
    enabled: {
        type: Boolean,
        default: true,
        required: true,
    },
    createdBy: ObjectIdType('users', app, false),
    updatedBy: ObjectIdType('users', app, false),
}, {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
});