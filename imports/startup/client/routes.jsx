import React from 'react';
import { Meteor } from 'meteor/meteor';
import { mount } from 'react-mounter';

import NodeRSA from 'node-rsa';

// Layout
import {MainLayout} from '../../ui/layouts/MainLayout';
// Pages
import LoginPage from '../../ui/pages/auth/LoginPage';
import SignupPage from '../../ui/pages/auth/SignupPage';
import MainPage from '../../ui/pages/MainPage';
import Messages from '../../ui/pages/Messages';
import Secret from '../../ui/pages/auth/Secret';
import Help from '../../ui/pages/Help';
import NotFound from '../../ui/pages/NotFound';


var LoggedIn = FlowRouter.group ({
    triggersEnter: [function(context, redirect) {
        // Check if user is logged In
        if (!Meteor.userId() && !Meteor.loggingIn()) {
            route = FlowRouter.current();

            if ( route.route.name !== 'signin' )
                Session.set ('redirectAfterLogin', route.path);

            FlowRouter.go('signin');
        }
        else if (Session.get('p_key')) {
            // If private is set on Session, then
            // verify if private key is correct
            try {
                let signature =
                    new NodeRSA(Session.get('p_key'))
                        .sign( Meteor.userId() , 'base64' , 'utf8' );

                Meteor.call('verifyPrivateKey', signature, function(err, response) {
                    if ( err || !response ) {
                        Session.clear();
                        FlowRouter.go('secret');
                    }
                });
            } catch (error) {
                Session.clear();
                FlowRouter.go('secret');
                alert('Wrong Private Key!')
            }
        }
    }]
});

// Redirects
Accounts.onLogin(function() {
    var redirect = Session.get('redirectAfterLogin');

    if (redirect)
        if (redirect !== '/signin' )
            FlowRouter.go(redirect);

});

Accounts.onLogout(function() {
    Session.clear();
});

FlowRouter.route('/help', {
    name: 'help',
    action() {
        mount(MainLayout, {
            content: (<Help />)
        })
    }
});

FlowRouter.notFound = {
    action: function() {
        mount(MainLayout, {
            content: (<NotFound />)
        })
    }
};

LoggedIn.route('/', {
    name: 'home',
    action() {
        mount(MainLayout, {
            content: (<MainPage />)
        })
    }
});

LoggedIn.route('/secret', {
    name: 'secret',
    action() {
        mount(MainLayout, {
            content: (<Secret />)
        })
    }
});

LoggedIn.route('/messages', {
    name: 'messages',
    action(params, queryParams) {
        mount(MainLayout, {
            content: (<Messages />)
        })
    }
});

LoggedIn.route('/messages/view/:id', {
    name: 'viewMessage',
    action(params) {
        mount(MainLayout, {
            content: (<Messages publication_id={params.id}/>)
        })
    }
});

LoggedIn.route('/messages/send', {
    name: 'sendMessage',
    action(params, queryParams) {
        mount(MainLayout, {
            content: (<Messages/>)
        })
    }
});

FlowRouter.route('/signin', {
    name: 'signin',
    action() {
        mount(MainLayout, {
            content: (<LoginPage />)
        })
    }
});

FlowRouter.route('/signup', {
    name: 'signup',
    action() {
        mount(MainLayout, {
            content: (<SignupPage />)
        })
    }
});
