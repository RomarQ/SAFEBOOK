import React from 'react'
import { Transition, Image } from 'semantic-ui-react'

export default class NotFound extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            animation: 'tada', duration: 500, visible: true
        };
    }
    
    render() {
        const { animation, duration, visible } = this.state
        return (
            <div>
                <Transition animation={animation} duration={duration} visible={visible}>
                    <Image centered size='massive' src='/assets/images/404.png' />
                </Transition>
            </div>
        )
    }
}
