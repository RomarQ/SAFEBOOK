import React from 'react';
import PropTypes from 'prop-types';
import TrackerReact from 'meteor/ultimatejs:tracker-react';

// Helpers
import TimeCast from '../helpers/TimeCasts';
import CryptoSB from '../helpers/CryptoSB';
import Utils from '../helpers/Utils';

import { Image, Breadcrumb, Container, Form, Button, Label, Popup, Header, Message, Comment, Dropdown, Menu, Grid, Segment, Divider, Icon } from 'semantic-ui-react'

import Publication from '../components/Publication';
import UsersList from '../components/UsersList';


export default class MainPage extends TrackerReact(React.Component) {
    constructor(props){
        super(props);

        this.state = {
            subscription: {
                users : Meteor.subscribe('userList'),
                publications : Meteor.subscribe('publications')
            }
        };
    }

    componentWillUnmount() {
        this.state.subscription.publications.stop();
        this.state.subscription.users.stop();
    }

    storeKey = () => {
        FlowRouter.go('secret');
    }

    render(){
        const { activeItem } = this.state;
        let currentUser = Meteor.user();
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);


        return (
            <Grid celled='internally' style={{ marginTop: '10px', marginBottom: '50px'}}>
                <Grid.Column width={11}>
                    <Container textAlign='center'>
                        { !Session.get('p_key') ? (
                            <div>
                                <Message
                                    style={{marginTop:10 +'px'}}
                                    negative
                                    icon='lock'
                                    header='Private key not Found!'
                                    content='You will not be able to decrypt any message that was sent to you before inserting your private key first!'/>

                                <Button
                                    style={{marginBottom: 10 + 'px'}}
                                    color='google plus'
                                    onClick={this.storeKey}>
                                    Import Key<Icon name='arrow right' />
                                </Button>
                            </div>
                        ) : ''}
                    </Container>
                    <Comment.Group style={{margin: 0 + ' auto'}} size='massive'>
                        {Utils.getPublications().map((publication) => {
                            return ( <Publication key={publication._id} publication={publication} /> );
                        })}
                    </Comment.Group>
                </Grid.Column>
                <Grid.Column width={5}>
                    <Container textAlign='center'>
                        <Label color='blue' size='massive'>
                            SafeBookers
                        </Label>
                    </Container>
                    <Divider horizontal/>

                    <UsersList changePage={true} />
                </Grid.Column>
            </Grid>
        );
    }
}

MainPage.propTypes = {
  username: PropTypes.string
}
