import React from 'react'
import { Button, Image, List, Label } from 'semantic-ui-react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'

export default class UserList extends TrackerReact(React.Component) {

    constructor() {
        super();

        this.state = {
            subscription: {
                users : Meteor.subscribe('userList')
            }
        }

    }

    componentWillUnmount() {
        this.state.subscription.users.stop();
    }

    setSession = ( userId ) => {
        Session.set('receiver', userId)
        FlowRouter.go('/messages/send')
    }

    renderUsers() {
        let users;
        let oUser = this.props.oUser;

        if (Meteor.userId() && Meteor.userId() !== undefined) {
            users = Meteor.users.find({}).fetch();

            if (users.length > 1) {
                return (
                    <List animated selection divided verticalAlign='middle'>
                        {users.map((user)=>{
                            if (user._id !== Meteor.userId())
                                return (
                                        <List.Item key={user._id} >
                                            <List.Content floated='right'>
                                                {this.props.changePage ? (
                                                    <Button compact onClick={() => this.setSession(user._id)} >
                                                        Send Message
                                                    </Button>
                                                ) :
                                                (
                                                    <Button compact onClick={() => oUser(user)}>
                                                        {this.props.onView ? 'Send Message' : 'Select' }
                                                    </Button>
                                                )}
                                            </List.Content>
                                            <Image avatar src={'/assets/images/avatar/' + user.profile.avatar} />
                                            <List.Content>
                                                <List.Header >{user.username}</List.Header>
                                            </List.Content>
                                        </List.Item>
                                 );
                        })}
                    </List>
                )
            }
        }
    }

    render () {
        return (
            <div>
                {this.renderUsers()}
            </div>
        );
    }
}
