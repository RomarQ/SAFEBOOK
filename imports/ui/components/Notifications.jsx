import React from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import { Button, Popup, Menu, List, Image } from 'semantic-ui-react';

import TimeCast from '../helpers/TimeCasts';

export default class AuthMenu extends TrackerReact( React.Component ) {

    getNotificationsGrid = (notifications) => {
        let count = 0;
        return (
            notifications.map((notification) => {
                count+=1;
                let oUser = Accounts.users.findOne({ _id: notification.sender_id })
                    if (oUser == undefined )
                        return

                return (
                    <List.Item key={count} onClick={()=> FlowRouter.go('/messages/view/'+notification.publication_id)}>
                        <Image avatar src={'/assets/images/avatar/' + oUser.profile.avatar} />
                        <List.Content>
                            <List.Header as='a'>{oUser.username}</List.Header>
                            <List.Description>
                                Sent you a message
                                <p style={{color: 'black'}}>
                                { TimeCast.getDateTimeSince(notification.date) } ago
                                </p>
                            </List.Description>
                        </List.Content>
                    </List.Item>
                )
            })
        )
    }

    render() {
        let currentUser = Meteor.user();
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);

        return (
            <Menu.Item>
                { currentUser.profile.notifications.length === 0 ?
                    (
                    <Popup
                        trigger={<Button icon color='blue' icon='mail'/>}
                        header='Notifications'
                        content='Without any new notifications!'
                        on={['hover', 'click']}/>
                    )
                :
                    (
                        <Popup
                            position='bottom right'
                            trigger={<Button icon
                                        color='red'
                                        icon='mail'
                                        label={
                                            {
                                                basic: true,
                                                color: 'red',
                                                pointing: 'left',
                                                content: currentUser.profile.notifications.length
                                            }
                                        }/>
                                    }
                            flowing
                            hoverable>
                            <List animated selection divided verticalAlign='middle'>
                                {this.getNotificationsGrid(currentUser.profile.notifications.reverse())}
                            </List>
                          </Popup>
                    )
                }
            </Menu.Item>
        )
    }
}
