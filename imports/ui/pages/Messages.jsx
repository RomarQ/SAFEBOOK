import React from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import { Grid, Container, Divider, Label, Button, Form, Comment, Message, Icon, Confirm, Menu, Dropdown, Header } from 'semantic-ui-react'

import UsersList from '../components/UsersList';
import ReceiversList from '../components/ReceiversList';
import Publication from '../components/Publication';

// Helpers
import CryptoSB from '../helpers/CryptoSB';
import Utils from '../helpers/Utils';


export default class Messages extends TrackerReact( React.Component ) {

    constructor(props) {
        super(props);

        this.state = {
            hashers: [
                { key: 'SHA-256', text: 'SHA-256', value: 'SHA-256' },
                { key: 'SHA-3-512', text: 'SHA-3-512', value: 'SHA-3-512' }
            ],
            hasher: 'SHA-256',
            ciphers: [
                { key: 'AES-256', text: 'AES-256', value: 'AES-256' },
                { key: 'RC4', text: 'RC4', value: 'RC4' }
            ],
            cipher: 'AES-256',
            activeItem: 'All',
            error: '',
            messageSent: false,
            open: false,
            message: '',
            receivers: [],
            subscription: {
                users : Meteor.subscribe('userList'),
                publications : Meteor.subscribe('publications')
            }
        };
    }

    componentDidMount() {
        if (Session.get('receiver')) {
            this.addReceiver(Utils.getUser(Session.get('receiver')));
            Session.set('receiver', undefined)
        }
    }

    componentWillUnmount() {
        this.state.subscription.users.stop();
        this.state.subscription.publications.stop();
    }

    // -------------------------------------------------------------

    // mini-Menu
    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    // Error Message Hanlers
    handleDismiss = () => {
        this.setState({ messageSent: '' });
        this.setState({ error: '' });
    }
    showError = () => {
        setTimeout(() => {
            this.handleDismiss();
        }, 3000)
        return
    }

    // Confirmation box methods
    show = () => {
        // Checks if everything is ok with what user wants to send
        if(!this.verifyInputs())
            return

        this.setState({ open: true })
    }
    handleConfirm = () => {
        this.setState({ open: false });
        this.sendMessage();
    }
    handleCancel = () => this.setState({ open: false })

    // Cipher/Hasher onChange Dropdown handler
    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    // -----------------------------------------------------------

    addReceiver = ( user ) => {

        if(!user)
            return

        // Checks if user is already on the receivers list
        if( this.state.receivers
                .some(function (i) { return i._id === user._id }))
            return

        // Add user to the receivers list
        this.setState({
            receivers: [
                ...this.state.receivers,
                {
                    _id: user._id,
                    username: user.username,
                    pKey: user.profile.public_key,
                    avatar: user.profile.avatar
                }
            ]
        });
    }

    removeReceiver = ( user ) => {
        // Checks if user is already on the receivers list
        let index = -1;
        if ( this.state.receivers
                .some(function (i) { index += 1; return i._id === user._id })) {
                    this.setState({
                        receivers: [
                            ...this.state.receivers.slice(0,index),
                            ...this.state.receivers.slice(index+1)
                        ]
                    });
        }
    }

    verifyInputs = () => {

        if ( this.state.receivers.length === 0 ) {
            this.setState({
                error: "Select at least a user for which you would like to send the message."
            });
            return false
        }

        if ( this.state.message.length < 2 ) {
            this.setState({
                error: "Message needs to have at least 2 characters."
            });
            return false
        }

        return true
    }

    cleanInputs = () => {
        this.setState({ receivers : [], message: '' });
        document.getElementById('publication-text').value = '';
    }

    sendMessage = () => {

        // Checks if everything is ok with what user wants to send
        if(!this.verifyInputs())
            return

        if (CryptoSB.sendMessage (
            this.state.message, this.state.receivers,
            this.state.cipher, this.state.hasher))
        {
            // Message sent! Now lets clear Inputs
            this.setState({ messageSent: true });
            this.cleanInputs();
        }
    }

    updateMessage = () => {
        this.setState({message: document.getElementById('publication-text').value})
    }

    viewToSend = (user) => {
        this.addReceiver(user);
        FlowRouter.go('/messages/send');
    }

    render() {
        const error = this.state.error;

        let currentUser = Meteor.user();
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);

        if ( FlowRouter.current().route.name === 'sendMessage' ) {
            return (
                <div>
                { loggedIn ? (
                    <Grid celled='internally' style={{ marginTop: '10px', marginBottom:'50px' }}>
                    <Grid.Column width={11}>
                        { !Session.get('p_key') ? (
                            <Container textAlign='center'>
                                <Message
                                    style={{margin: 0 + ' auto'}}
                                    negative
                                    compact
                                    icon='lock'
                                    header='Private key not Found!'
                                    content='You will not be able to send any message before inserting your private key first!'/>
                                <Button
                                    compact
                                    style={{margin: 0 + ' auto', marginTop:10+'px'}}
                                    color='google plus'
                                    onClick={Utils.storeKey}>
                                    Import Key<Icon name='arrow right' />
                                </Button>
                            </Container>
                        ) : (

                        <div>
                            <Grid style={{margin: 0 + ' auto', paddingTop:'10px', marginBottom:'50px', backgroundColor: '#2185d0'}}>
                                <Grid.Column width={8}>
                                    <Header as='h4' style={{ color: 'white', marginBottom:'10px', float: 'right'}}>
                                        <Icon name='privacy' />
                                        <Header.Content>
                                            Cipher Algorithm:
                                            {' '}
                                            <Dropdown
                                                name='cipher'
                                                style={{ color: 'white', backgroundColor: '#2185d0'}}
                                                compact
                                                selection
                                                onChange={this.handleChange}
                                                options={this.state.ciphers}
                                                defaultValue={this.state.ciphers[0].value} />
                                        </Header.Content>
                                    </Header>
                                </Grid.Column>
                                <Grid.Column width={8}>
                                    <Header as='h4' style={{ color: 'white', marginBottom:'10px'}}>
                                        <Icon name='low vision' />
                                        <Header.Content>
                                            Hash Algorithm:
                                            {' '}
                                            <Dropdown
                                                name='hasher'
                                                style={{ color: 'white', backgroundColor: '#2185d0'}}
                                                compact
                                                selection
                                                onChange={this.handleChange}
                                                options={this.state.hashers}
                                                defaultValue={this.state.hashers[0].value} />
                                        </Header.Content>
                                    </Header>
                                </Grid.Column>
                            </Grid>

                            <Container textAlign='center'>
                                {error !== '' ?
                                    <Message
                                        negative
                                        compact
                                        onLoad={this.showError()}
                                        onDismiss={this.handleDismiss}
                                        content={error}/> : '' }

                                {this.state.messageSent ?
                                    <Message
                                        style={{margin: 0 + ' auto'}}
                                        positive
                                        compact
                                        onLoad={this.showError()}
                                        onDismiss={this.handleDismiss}
                                        content='Message Sent!'/> : '' }
                            </Container>
                            <Comment.Group style={{margin: 0 + ' auto', marginTop:20+ 'px'}}>
                              <Comment>
                                <Comment.Avatar as='a' src={'/assets/images/avatar/' + currentUser.profile.avatar} />
                                <Comment.Content>
                                  <Comment.Author as='a'> { currentUser.username } </Comment.Author>
                                  <Message
                                      attached
                                      header={<Label color='green'>Sending Message to</Label>}
                                      content={<ReceiversList oUser={this.removeReceiver} receivers={this.state.receivers} allowRemove={true} style={{marginTop: 10 + 'px'}}/>}/>
                                  <Form reply >
                                    <Form.TextArea onChange={this.updateMessage} id="publication-text" placeholder="Write something..." />
                                    <Button  content='Send message!' labelPosition='left' icon='mail' primary onClick={this.show} style={{ marginbottom: '50px'}}/>
                                    <Confirm
                                        open={this.state.open}
                                        header='Do you really want to send this message?'
                                        content={
                                            <div style={{margin: 10 + 'px'}}>
                                                <Label color='blue'>Message</Label>
                                                <Message info>
                                                    <Message.Content>{this.state.message}</Message.Content>
                                                </Message>
                                                <Label color='green'>To:</Label>
                                                <ReceiversList  oUser={this.removeReceiver} receivers={this.state.receivers} allowRemove={true} style={{marginTop: 10 + 'px'}}/>
                                            </div>
                                        }
                                        confirmButton="Yes, send it!"
                                        onCancel={this.handleCancel}
                                        onConfirm={this.handleConfirm}
                                    />
                                  </Form>
                                </Comment.Content>
                              </Comment>
                            </Comment.Group>
                        </div>
                        ) }
                    </Grid.Column>
                    <Grid.Column width={5}>
                        <Container textAlign='center'>
                            <Label color='blue' size='massive'>
                                SafeBookers
                            </Label>
                        </Container>
                        <Divider horizontal/>

                        <UsersList oUser={this.addReceiver} />
                    </Grid.Column>
                    </Grid>
                ) : '' }
                </div>
            );
        } else if ( FlowRouter.current().route.name === 'viewMessage' ) {

            if (!this.props.publication_id)
                FlowRouter.go('messages');

            let oPublication = Utils.getPublication(this.props.publication_id);

            if (oPublication === undefined){
                return (
                    <Container textAlign='center'>
                        <Message
                            style={{marginTop:10 +'px'}}
                            negative
                            icon='lock'
                            header='Publication not Found!'
                            content='Please insert a válid publication.'/>
                    </Container>
                )
            }

            // This call will delete the notification sent to this user about
            // this publication
            Meteor.call('removeNotification', oPublication._id, function(err, response) {
                if (error)
                    console.log('error deleting notification');
            });

            return (
                <Grid celled='internally' style={{ marginTop: 10, marginbottom: '50px' }}>
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
                                        onClick={Utils.storeKey}>
                                        Import Key<Icon name='arrow right' />
                                    </Button>
                                </div>
                            ) : ''}
                        </Container>
                        <Comment.Group style={{margin: 0 + ' auto'}} size='massive'>
                            <Publication publication={oPublication} />
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

        const { activeItem } = this.state

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
                                    onClick={Utils.storeKey}>
                                    Import Key<Icon name='arrow right' />
                                </Button>
                            </div>
                        ) : ''}
                    </Container>
                    <Container textAlign='center'>
                    <Menu compact style={{marginBottom: 30 + 'px'}}>
                        <Menu.Item name='All' active={activeItem === 'All'} onClick={this.handleItemClick} />
                        <Menu.Item name='Received' active={activeItem === 'Received'} onClick={this.handleItemClick} />
                        <Menu.Item name='Sent' active={activeItem === 'Sent'} onClick={this.handleItemClick} />
                    </Menu>
                    </Container>
                    <Comment.Group style={{margin: 0 + ' auto'}} size='massive'>
                        { (activeItem === 'All') ?
                            Utils.getSentReceivedPublications().map((publication) => {
                                return ( <Publication key={publication._id} publication={publication} /> );
                            }) : ''
                        }
                        { (activeItem === 'Received') ?
                            Utils.getReceivedPublications().map((publication) => {
                                return ( <Publication key={publication._id} publication={publication} /> );
                            }) : ''
                        }
                        { (activeItem === 'Sent') ?
                            Utils.getSentPublications().map((publication) => {
                                return ( <Publication key={publication._id} publication={publication} /> );
                            }) : ''
                        }
                    </Comment.Group>
                </Grid.Column>
                <Grid.Column width={5}>
                    <Container textAlign='center'>
                        <Label color='blue' size='massive'>
                            SafeBookers
                        </Label>
                    </Container>
                    <Divider horizontal/>

                    <UsersList  onView={true} changePage={false} oUser={this.viewToSend} />
                </Grid.Column>
            </Grid>
        );
    }
}
