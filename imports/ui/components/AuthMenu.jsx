import React from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import { Button, Header, Popup, Menu, Statistic, Image } from 'semantic-ui-react';

import Notifications from './Notifications';

export default class AuthMenu extends TrackerReact( React.Component ) {
    constructor(props){
        super(props);

        this.state = {
            activeItem: '',
            subscription: {
                users : Meteor.subscribe('userList')
            }
        }

        this.logout = this.logout.bind(this);
    }

    componentWillUnmount() {
        this.state.subscription.users.stop();
    }


    logout(e){
        e.preventDefault();
        Meteor.logout( (err) => {
            if (err)
                console.log( err.reason )
            else
                FlowRouter.go('signin');

        });
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name });

    render() {
        const { activeItem } = this.state;
        activeItem = FlowRouter.current().route.name;

        let currentUser = Meteor.user();
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);

        return (
            <div>
            { loggedIn ? (
                <Menu size='massive' style={{margin: '0 auto'}}>
                    <Menu.Item>
                        <Header
                            color='blue'
                            as='h3'
                            image='assets/images/safebook.png'
                            content='SAFEBOOK'
                        />
                    </Menu.Item>
                    <Menu.Item as='a' href='/' name='home' active={activeItem === 'home'} onClick={this.handleItemClick} />
                    <Menu.Item as='a' href='/messages' name='messages' active={activeItem === 'messages'} onClick={this.handleItemClick} />

                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Statistic size='mini' horizontal>
                             <Statistic.Value>
                               <Image src={'/assets/images/avatar/' + currentUser.profile.avatar} inline circular />
                             </Statistic.Value>
                             <Statistic.Label>{currentUser.username}</Statistic.Label>
                            </Statistic>
                        </Menu.Item>
                        <Notifications />
                        <Menu.Item>
                            <Button primary onClick={this.logout}>Logout</Button>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>) : '' }
            </div>
        )
    }
}
