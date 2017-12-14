import React from 'react'
import { Comment, Breadcrumb, Popup, Button, Image } from 'semantic-ui-react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'

//helpers
import TimeCast from '../helpers/TimeCasts';
import CryptoSB from '../helpers/CryptoSB';
import Utils from '../helpers/Utils';
import CryptoJS from 'crypto-js';

export default class Publication extends TrackerReact(React.Component) {

    constructor(props) {
        super(props);
    }

    render () {

        let oPublication = this.props.publication;
        let message;
        let sender = Utils.getUser(oPublication.sender._id);
        let receiver;
        let receiversList =  [];
        let decrypted = false;

        oPublication.receivers.map((i) => {

            if( i._id === Meteor.userId() )
                receiver = i;

            let user = Utils.getUser( i._id );
            if (user)
                receiversList = [
                    ...receiversList,
                    {
                        _id: user._id,
                        username: user.username,
                        avatar: user.profile.avatar,
                        public_key: user.profile.public_key,
                        allowDecrypt: i.allowDecrypt,
                        when_opened_signature: i.when_opened_signature,
                        openedAt: i.openedAt
                    }
                ]
        });

        if( !Session.get('p_key') || !oPublication.encrypted ) {
            message = oPublication.content;
        } else {
            if (receiver) {
                message = CryptoSB.decryptMessage( oPublication, receiver);
                decrypted = !receiver.allowDecrypt;
            } else if ( oPublication.sender._id === Meteor.userId() ) {
                message = CryptoSB.decryptMessage( oPublication, oPublication.sender);
            }  else
                message = oPublication.content;
        }


        if (!message)
            return ('');

        if ( receiversList.length === 0 || sender === undefined ) return;

        return (
            <Comment key={oPublication._id}>
                <Comment.Avatar src={'/assets/images/avatar/' + sender.profile.avatar } />
                <Comment.Content>
                <Breadcrumb>
                    <Breadcrumb.Section>
                        <Comment.Author >{ sender.username } </Comment.Author>
                    </Breadcrumb.Section>
                <Breadcrumb.Divider color='blue' icon='right arrow' />
                <Breadcrumb.Section>
                {receiversList.map(user => {

                    let verify = CryptoSB.verify_signature(
                        user.public_key,
                        CryptoJS.SHA256(message+user.openedAt.toGMTString()),
                        user.when_opened_signature
                    );

                    verify = ( verify && (user.openedAt > oPublication.createdAt));

                    return (
                        <Popup
                            style={{clear:'both'}}
                            floated='right'
                            key={user._id}
                            trigger={ <Image style={{width:20+'px', marginRight:2+'px'}} src={'/assets/images/avatar/' + user.avatar} avatar/> }
                            header={user.username}
                            content={
                                <div style={{fontSize:12+'px'}}>
                                    { verify ? 'Seen: ' + user.openedAt.toLocaleString() : '' }
                                    {(verify && user.allowDecrypt) ?
                                        <p>Allowed this message to be decrypted!</p>
                                    : '' }
                                </div>
                            }
                        />
                    )
                })}
                </Breadcrumb.Section>
                </Breadcrumb>
                <Comment.Metadata style={{fontSize: 14 + 'px'}}>
                    {TimeCast.getDateTimeSince(oPublication.createdAt)}
                </Comment.Metadata>
                <Comment.Text style={{whiteSpace: 'pre-line'}}> { message } <br/> </Comment.Text>
                { decrypted ? (
                    <Comment.Actions>
                          <Button
                            basic
                            color='blue'
                            icon='unlock'
                            label={{
                                basic: true,
                                color: 'blue',
                                pointing: 'left',
                                content: 'Leave decrypted' }}
                            onClick={() => { CryptoSB.allowDecrypt(oPublication._id) }} />
                    </Comment.Actions>
                ) : '' }
                </Comment.Content>
            </Comment>
        )
    }
}
