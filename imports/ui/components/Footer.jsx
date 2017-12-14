import React from 'react'
import { Container, List, Segment } from 'semantic-ui-react';

export default class Footer extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <Segment
                inverted
                vertical
                color='blue'
                style={{
                    padding: '5px',
                    height: '30px',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    position: 'fixed'
                }}
            >
                <Container textAlign='center'>
                    <List horizontal inverted divided link>
                        <List.Item as='a' href='/help'>Help</List.Item>
                        { Meteor.userId() ? <List.Item as='a' href='/secret'>Secret</List.Item> : '' }
                    </List>
                </Container>
            </Segment>
        )
    }
}
