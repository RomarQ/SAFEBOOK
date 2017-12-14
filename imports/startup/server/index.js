import NodeRSA from 'node-rsa';
import CryptoJS from 'crypto-js';

import { Publications } from '../both/collections/publications';

Meteor.startup(function () {
    Meteor.methods({
        signWhenOpen: function ( publication_id, date, signature ) {
            // Signs the message on receiver field, since he already decrypted it 
            Publications.update({
                        '_id': publication_id,
                        'receivers._id': Meteor.userId()
                    },
                    {
                        $set: {
                            'receivers.$.openedAt' : date,
                            'receivers.$.when_opened_signature' : signature
                        }
                    }
            );
        },
        updateMessageAsDecrypted: function ( publication_id, message ) {

            let oPublication = Publications.findOne({ _id: publication_id });
                if ( !oPublication )
                    return;
            // Since user allowed this message to be decripted
            // Lets update it with the decrypted text
            Publications.update({ _id: publication_id }, {
                $set: {
                    content : message,
                    encrypted : false
                }
            })
        },
        allowDecrypt: function ( publication_id ) {
            let oPublication = Publications.findOne({ _id: publication_id });
                if ( !oPublication )
                    return;
            // Update receiver field with allowDecrypt to true
            // since he allowed the decryption of the message
            Publications.update(
                {
                    _id: publication_id,
                    'receivers._id': Meteor.userId()
                },
                {
                    $set: { 'receivers.$.allowDecrypt' : true}
                }
            )
        },
        verifyPrivateKey: function ( signature ) {
            // verify if user imported his real private key
            return new NodeRSA(Meteor.user().profile.public_key)
                            .verify(
                                Meteor.userId(),
                                signature,
                                'utf8',
                                'base64'
                            );
        },
        notifyUsers: function ( publication_id ) {

            let oPublication = Publications.findOne({ _id: publication_id });
                if ( !oPublication )
                    return;

            // adds a new notification to all receivers
            oPublication.receivers.map((receiver) => {
                Accounts.users.update({
                    _id: receiver._id }, {
                            $addToSet: {
                                'profile.notifications': {
                                        publication_id: publication_id,
                                        sender_id: oPublication.sender._id,
                                        date: new Date()
                                    }
                            }
                });
                console.log(receiver._id + ": notified");
            })



        },
        removeNotification: function ( publication_id ) {
            Accounts.users.update({
                _id: Meteor.userId() }, {
                        $pull: {
                            'profile.notifications': {
                                    publication_id: publication_id
                            }
                        }
            });
        },
        removePublication: function ( publication_id ) {
            Publications.remove(publication_id)
        }
    });
});


Meteor.publish("userList", function () {
       return Meteor.users.find({}, {fields: { username: 1, 'emails.address': 1, 'profile.avatar': 1, 'profile.public_key': 1, 'profile.notifications': 1, }});
});

Meteor.publish("publications", function () {
       return Publications.find({}, {fields: { sender: 1, when_sent_signature: 1, content: 1, encrypted: 1, hasher: 1, cipher: 1, createdAt: 1, receivers: 1 }});
});

Security.permit(['insert', 'update'])
    .collections([Publications]).ifLoggedIn().allowInClientCode();
