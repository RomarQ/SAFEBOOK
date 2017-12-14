// Encryption Helpers

import NodeRSA from 'node-rsa';
import crypto from "crypto";
import CryptoJS from 'crypto-js';
import Utils from './Utils';

// Collections
import { Publications } from '../../startup/both/collections/publications';

var self =
module.exports = {
    decryptMessage: ( publication, receiver ) => {

        let currentUser = Meteor.user();
        let senderUser = Utils.getUser(publication.sender._id);

        if ( senderUser === undefined || currentUser === undefined )
            return false;

        let receiver_privateKey;
        try {
            receiver_privateKey = new NodeRSA(Session.get('p_key'));
        } catch (ex) {
            Session.clear();
            FlowRouter.go('secret');
        }
        // Decrypts the encrypted passPhrase that was used to encrypt
        // the message [RSA-ENCRYPTION]
        let decrypted_passPhrase = receiver_privateKey
                        .decrypt(receiver.encrypted_passPhrase).toString();

        // Decrypts the encrypted message with respective cipher
        let decrypted_message;

        if ( publication.cipher === 'AES-256' )
            // AES-256
            decrypted_message = CryptoJS.AES
                            .decrypt( publication.content, decrypted_passPhrase )
                            .toString(CryptoJS.enc.Utf8);
        else if ( publication.cipher === 'RC4' )
            // RC4 Cipher
            decrypted_message = CryptoJS.RC4
                            .decrypt( publication.content, decrypted_passPhrase )
                            .toString(CryptoJS.enc.Utf8);

        // Verify if the message was modified
        // Uses the respective hasher
        let date = publication.createdAt;
        let verified;

        if ( publication.hasher === 'SHA-256' )
            verified = self.verify_signature(senderUser.profile.public_key,
                            CryptoJS.SHA256(decrypted_message+date.toGMTString()),
                            publication.when_sent_signature);
        else if ( publication.hasher === 'SHA-3-512' )
            verified = self.verify_signature(senderUser.profile.public_key,
                            CryptoJS.SHA3(decrypted_message+date.toGMTString()),
                            publication.when_sent_signature);

        if (verified) {
            // If is the first time that user is seeing this message, then
            // lets add that information to the message
            if ((senderUser._id !== Meteor.userId()) && (receiver.openedAt < publication.createdAt)){

                // Hashes the (massage concatenated with atual date) and then signs it,
                // Signature of when receiver opens the message
                let date = new Date();
                let signature;

                if ( publication.hasher === 'SHA-256' )
                    signature = self.create_signature( CryptoJS.SHA256(decrypted_message+date.toGMTString()) );
                else if ( publication.hasher === 'SHA-3-512' )
                    // Default size: 512 bits
                    signature = self.create_signature( CryptoJS.SHA3(decrypted_message+date.toGMTString()) );

                // Updates publication with date and signature
                // of when receiver opened the message
                Meteor.call('signWhenOpen', publication._id, date, signature, function(err, response) {
                    if (err)
                        return alert(err.reason);
                });
            }

            return decrypted_message;
        }

        // This code will only be reached if message was modified on the way
        // to the receiver, so lets not trust on this message and just remove it
        Meteor.call('removePublication', publication._id, function(err, response) {
            if (err)
                return alert(err.reason);
        });

        return false;
    },
    sendMessage: (message, receivers, cipher, hasher) => {

        let currentUser = Meteor.user();

        // Hashes the (massage concatenated with atual date) and then signs it,
        // to allow server and receiver to verify its integrity
        let date = new Date();
        let signature;

        if ( hasher === 'SHA-256' )
            signature = self.create_signature( CryptoJS.SHA256(message+date.toGMTString()) );
        else if ( hasher === 'SHA-3-512' )
            // Default size: 512 bits
            signature = self.create_signature( CryptoJS.SHA3(message+date.toGMTString()) );
        else
            return false

        // Encrypt the message using the cipher choosed by the sender
        // and passPhrase generated above
        // ----------------------------------------------------------
        // Key size: AES 256 bits, RC4 1024 bits
        let encrypted_message;
        let passPhrase;
        if ( cipher === 'AES-256' ) {
            // Generate a passphrase with 256 bits to encrypt the message
            passPhrase = crypto.randomBytes(32).toString('base64');
            // Encrypt with AES Cipher
            // Block Mode: CBC (by default)
            // Padding Scheme: Pkcs7 (by default)
            encrypted_message = CryptoJS.AES.encrypt(message, passPhrase, {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }).toString();
        }
        else if ( cipher === 'RC4' ) {
            // Generate a passphrase with 1024 bits to encrypt the message
            passPhrase = crypto.randomBytes(128).toString('base64');
            // Encrypt with RC4 Cipher
            encrypted_message = CryptoJS.RC4.encrypt(message, passPhrase).toString();
        }
        else
            return false

        // receivers[] -> contains all receivers that will get this message
        // :::::::::::::::::::::
        // _id                  -> receiver ID
        // encrypted_passPhrase -> encrypted key that will allow receiver to decrypt the message
        ///////////////////////    Can only be decrypted with the receiver private key
        let oReceivers = [];
        receivers.map((receiver) => {
            oReceivers.push({
                _id: receiver._id,
                encrypted_passPhrase: self.RSA_encrypt( passPhrase, receiver.pKey )
            })
        })
        
        // Stores the message on database.
        Publications.insert({
            sender: { encrypted_passPhrase: self.RSA_encrypt( passPhrase, currentUser.profile.public_key )},
            when_sent_signature: signature,
            content: encrypted_message,
            receivers: oReceivers,
            createdAt: date,
            cipher: cipher,
            hasher: hasher
        },
        { validationContext: "insertForm" },
        (error, result) => {

            if (error) {
                console.log('Something went wrong when trying to send the message...');
                return false;
            }

            // Message sent!
            // Tells to the server to notify all receivers about this message
            Meteor.call('notifyUsers', result, function(err, response) {
                if (err) {
                    console.log('Something went wrong when trying to notify users...');
                    return false;
                }
            });
        });

        return true;
    },
    verify_signature: (public_key, hash, signature) => {
        // Verify the signature with the public_key
        return new NodeRSA(public_key).verify(hash, signature, 'utf8', 'base64');
    },
    RSA_encrypt: ( message, public_key ) => {
        // Encrypt with the receiver public key
        return new NodeRSA(public_key).encrypt( message , 'base64' , 'utf8' );
    },
    create_signature: ( hash ) => {
        // Makes a signature with the private key
        return new NodeRSA(Session.get('p_key'))
                            .sign( hash , 'base64' , 'utf8' );
    },
    allowDecrypt: ( publication_id ) => {

        Meteor.call('allowDecrypt', publication_id, function(err, response) {
            if(!err) {

                let oPublication = Publications.findOne({ _id: publication_id});

                if (typeof(oPublication) == undefined)
                    return

                    if (oPublication.receivers.length > 0) {

                        let allow = true;
                        oPublication.receivers.map((receiver) => {
                            if(!receiver.allowDecrypt)
                                allow = false;
                        });

                        // Just to make sure, that only receivers are allowed
                        // to replace encryped text with decryped text
                        let receiver;
                        oPublication.receivers.some(function (i) {
                            if( i._id === Meteor.userId() )
                                receiver = i;
                        })

                        // Here we check if receiver is allowed
                        // to make this change
                        if (allow && receiver) {
                            Meteor.call('updateMessageAsDecrypted', oPublication._id,
                                    self.decryptMessage(oPublication, receiver), function(err, response) {
                                if(err)
                                    console.log('Something went wrong!');
                            });
                        }
                    }
            }
        });
    }
}
