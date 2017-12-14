import React from 'react';
import ReactDOM from 'react-dom';
import TrackerReact from 'meteor/ultimatejs:tracker-react';

import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react';

export default class LoginPage extends TrackerReact(React.Component) {
  constructor(props){
    super(props);

    this.state = {
      error: ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

    componentDidMount() {
        if(Meteor.userId())
            FlowRouter.go('home');
    }

    handleSubmit(e){
        e.preventDefault();

        let email = document.getElementById('login').value;
        let password = document.getElementById('login-password').value;

        Meteor.loginWithPassword(email, password, (err) => {
            if(err)
                this.setState({ error: err.reason });
            else
                FlowRouter.go('home');
        });
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
                    {' '}Login to your account
                  </Header>
                  { error.length > 0 ? <Message size='small' style={{marginTop: 10+'px'}} negative>{error}</Message> : ''}
                  <Form size='large' onSubmit={this.handleSubmit}>
                    <Segment stacked>
                      <Form.Input
                        fluid
                        id='login'
                        icon='user'
                        iconPosition='left'
                        placeholder='Username or E-mail address'
                      />
                      <Form.Input
                        fluid
                        id='login-password'
                        icon='lock'
                        iconPosition='left'
                        placeholder='Password'
                        type='password'
                      />

                      <Button color='blue' fluid size='large'  >Login</Button>
                    </Segment>
                  </Form>
                  <Message>
                    Don't have an account? Register <a href="/signup">here</a>
                  </Message>
                </Grid.Column>
              </Grid>
            </div>
        );
    }
}
