// Utils

// Collections
import { Publications } from '../../startup/both/collections/publications';

var self =
module.exports = {
    storeKey: () => {
        FlowRouter.go('secret');
    },
    getUser: (userId) => {
        if( userId !== undefined)
            return Accounts.users.findOne({ _id: userId });
    },
    getUserByName: (username) => {
        if( username !== undefined)
            return Accounts.users.findOne({ username: username });
    },
    getPublication: ( publication_id ) => {
        return Publications.findOne({ _id: publication_id }); 
    },
    getPublications: () => {
        return Publications.find({}).fetch().reverse();
    },
    getSentReceivedPublications: () => {
        return Publications.find({ $or : [
            { 'sender._id': Meteor.userId() },
            { 'receivers._id': Meteor.userId() }
        ]}).fetch().reverse();
    },
    getReceivedPublications: () => {
        return Publications.find({'receivers._id': Meteor.userId()}).fetch().reverse();
    },
    getSentPublications: () => {
        return Publications.find({'sender._id': Meteor.userId()}).fetch().reverse();
    }
}
