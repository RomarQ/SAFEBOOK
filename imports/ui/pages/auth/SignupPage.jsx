import React from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react';

import NodeRSA from 'node-rsa';
import { Session } from 'meteor/session';

export default class SignupPage extends TrackerReact(React.Component) {
    constructor(props){
        super(props);

        this.state = {
          error: '',
          isAuthenticated: ( Meteor.userId() !== null )
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        if(Meteor.userId())
            FlowRouter.go('home');
    }


    handleSubmit(e){
        e.preventDefault();

        let name = document.getElementById("signup-name");
            if (!~name.value.search(name.pattern)) {
                this.setState({ error: 'Username Invalid.' });
                return;
            }

        let email = document.getElementById("signup-email");
            if (!~email.value.search(email.pattern)) {
                this.setState({ error: 'Email Invalid.' });
                return;
            }
        let password = document.getElementById("signup-password");

        // Generate RSA Key pairs
        var key = new NodeRSA({b: 2048});

        // Only runs this code on client
        if(Meteor.isClient) {
            // Inserts Private Key on client Session
            Session.setAuth( 'p_key' , key.exportKey('pkcs8-private') );

            // Tries Creates a new user
            // [Email, Name, Password] given by who is trying to make an account
            // Inserts also  the "generated Public key" and a random avatar
            Accounts.createUser({
                username: name.value,
                email: email.value,
                password: password.value,
                profile: {
                    avatar: 'default_' + parseInt(Math.random() * (10 - 1) + 1) + '.jpg',
                    public_key: key.exportKey('pkcs8-public'),
                    notifications: []
                }}, (err) => {
                    if(err)
                        this.setState({ error: err.reason });
                    else
                        FlowRouter.go('secret');
            });

        }
    }

  render(){
    const error = this.state.error;
    return (
        <div className='login-form'>
          <style>{`
            body > div,
            body > div > div,
            body > div > div > div.login-form {
              height: 20%;
            }
          `}</style>
          <Grid
            textAlign='center'
            style={{ height: '100%' }}
            verticalAlign='middle'
          >
            <Grid.Column style={{ maxWidth: 450 }}>
              <Header as='h2' color='blue' textAlign='center'>
                <Image src='assets/images/safebook.png' />
                {' '}Create your account
              </Header>
              { error.length > 0 ? <Message size='small' style={{marginTop: 10+'px'}} negative>{error}</Message> : ''}
              <Form size='large' onSubmit={this.handleSubmit}>
                <Segment stacked>
                    <Form.Input
                        fluid
                        id='signup-name'
                        pattern="[\sA-Za-z0-9áéíóúÁÉÍÓÚ]{0,20}"
                        icon='user'
                        iconPosition='left'
                        placeholder='Username'
                    />
                    <Form.Input
                        fluid
                        id='signup-email'
                        icon='mail'
                        pattern="[a-z0-9.-_]{2,64}[@][a-z]{2,32}(.[a-z]{2,32}){0,2}[.][a-z]{2,12}"
                        iconPosition='left'
                        placeholder='E-mail address'
                    />
                    <Form.Input
                        fluid
                        id='signup-password'
                        icon='lock'
                        iconPosition='left'
                        placeholder='Password'
                        type='password'
                    />

                  <Button color='blue' fluid size='large'  >Sign Up</Button>
                </Segment>
              </Form>
              <Message>
                Already have an account? Login <a href="/signin">here</a>
              </Message>
            </Grid.Column>
          </Grid>
        </div>
    );
  }
}
