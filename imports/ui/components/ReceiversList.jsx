import React from 'react'
import {Label, Icon } from 'semantic-ui-react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'

export default class ReceiversList extends TrackerReact(React.Component) {

    constructor(props) {
        super(props);

        this.state = {
            receivers: this.props.receivers,
            allowRemove: this.props.allowRemove
        }
    }

    componentWillReceiveProps (props){
         // This will update your component everytime props change
        this.setState({receivers: props.receivers})
    }

    render () {
        let oUser = this.props.oUser;

        return (
            <div>
                {this.state.receivers.map((receiver) => {
                    return (
                        <Label style={this.props.style}image key={receiver._id}>
                          <img src={'/assets/images/avatar/' + receiver.avatar} />
                              {receiver.username}
                          {this.state.allowRemove ? <Icon link onClick={() => oUser(receiver)} name='delete'/> : null }
                        </Label>
                    )
                })}
            </div>
        );
    }
}
