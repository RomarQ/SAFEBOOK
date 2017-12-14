import SimpleSchema from 'simpl-schema';

// Creates a Collection to store publications
export const Publications = new Mongo.Collection("publications");

const Schemas = {};

Schemas.Publication = new SimpleSchema ({
    sender: {
        type: Object,
        denyUpdate: true
    },
    // Sender ID
    "sender._id": {
        type: String,
        autoValue: function() {
            if (this.isInsert) return this.userId;
        }
    },
    // Sender passPhrase that allows him to decrypt the message
    // Encrypted using assymmetric encryption (Can only be decrypted by the sender)
    "sender.encrypted_passPhrase": {
        type: String
    },
    // Signature used to verify if the message was modified
    when_sent_signature: {
        type: String,
        denyUpdate: true
    },
    // Encrypted Message
    // Encrypted using symmetic encryption ( needs a passPhrase to be decrypted )
    content: {
        type: String
    },
    // Just a flag that tells if content field is already message decrypted
    encrypted: {
        type: Boolean,
        autoValue: function() {
            if (this.isInsert)
                return true;
        },
    },
    // Stores the date of when the message was sent
    createdAt: {
        type: Date,
        denyUpdate: true
    },
    // Hasher used to hash data for signatures
    hasher: {
        type: String,
        denyUpdate: true
    },
    // Cipher used to encrypt the message
    cipher: {
        type: String,
        denyUpdate: true
    },
    // Receivers list
    receivers: {
        type: Array
    },
    // List item, each item will contain
    // [receiver_ID, encrypted_passPhrase that allows to decrypt this message]
    "receivers.$": {
        type: Object
    },
    "receivers.$._id": {
        type: String
    },
    // Receiver passPhrase that allows him to decrypt the message
    // Encrypted using assymmetric encryption (Can only be decrypted by the receiver)
    "receivers.$.encrypted_passPhrase": {
        type: String
    },
    // This field is used to let the application know
    "receivers.$.allowDecrypt": {
        type: Boolean,
        autoValue: function() {
            if (this.isInsert) return false
        }
    },
    "receivers.$.when_opened_signature": {
        type: String,
        autoValue: function() {
            if (this.isInsert)
                return 'empty'
        },
    },
    "receivers.$.openedAt": {
        type: Date,
        autoValue: function() {
            if (this.isInsert)
                return new Date(0);
        }
    }
});

Publications.attachSchema(Schemas.Publication);
