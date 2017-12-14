import React from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import { Button, Message, Container, Icon, Popup, Form, TextArea} from 'semantic-ui-react';

import NodeRSA from 'node-rsa';
import Dropzone from 'react-dropzone'

export default class Secret extends TrackerReact(React.Component) {
    constructor(props) {
        super(props);

        this.state = {
            error: '',
            key: '',
            isCopied: false
        }
    }
    
    TAonChange = () => {
        this.setState({key : document.getElementById("key-textArea").value});
    }

    storeKey = () => {
        let context = this;
        try {
            let signature =
                new NodeRSA(this.state.key)
                    .sign( Meteor.userId() , 'base64' , 'utf8' );

            Meteor.call('verifyPrivateKey', signature, function(err, response) {
                if ( err || !response ) {
                    context.setState({ error : 'Invalid Key!'});
                    return
                }

                Session.setAuth( 'p_key' , context.state.key);
                FlowRouter.go('home');
            });

        } catch (ex) {
            this.setState({ error : 'Invalid Key!'});
        }
    }

    copyToClipboard = () => {
        let key = Session.get('p_key');
        if (window.clipboardData && window.clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            return clipboardData.setData("Text", key);

        } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            let textarea = document.createElement("textarea");
            textarea.textContent = key;
            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
            document.body.appendChild(textarea);
            textarea.select();

            try {
                return document.execCommand("copy");  // Security exception may be thrown by some browsers.this.handleCopy;
            } catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
                return false;
            } finally {
                this.setState({ isCopied: true })

                this.timeout = setTimeout(() => {
                    this.setState({ isCopied: false })
                }, 2000)

                document.body.removeChild(textarea);
            }
        }
    }

    download = () => {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + Session.get('p_key'));
        element.setAttribute('download', Meteor.user().username + '_secret.pem');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    redirect = () => {
        FlowRouter.go('home');
    }

    onDrop = (file) => {
        var reader = new FileReader();

        reader.onload = () => {
            this.setState({ key: reader.result.substring() })
        };

        if(file.length !== 0)
            reader.readAsText(file[0]);
        else
            this.setState({ error: 'Only .pem files allowed!' })
    }

    render() {

        if ( Session.get('p_key') == undefined )
            return (
                <Container textAlign='center'>
                    <Message
                      warning
                      icon='lock'
                      header='Private key not Found!'/>

                    { this.state.error !== '' ?
                          (<Message
                                negative
                                header={this.state.error}/>
                          ) : ''
                    }
                    <Dropzone style={{padding: 10 + 'px', border: '2px dashed #c9ba9b', height: 200 + 'px', backgroundColor: '#fffaf3'}} accept='.pem' multiple={false} onDrop={this.onDrop}>
                        <div style={{marginTop: 50 + 'px', fontWeight: 'bold' , color: '#c9ba9b'}}>
                            Click to open FileChooser or Drag & Drop your key file here!
                        </div>
                    </Dropzone>

                    <Form>
                        <TextArea
                            id='key-textArea'
                            onChange={this.TAonChange}
                            style={{marginTop: 10 + 'px', border: '2px dotted #c9ba9b', backgroundColor: '#fffaf3'}}
                            autoHeight
                            placeholder='Or type your Key here!' />
                    </Form>

                    { this.state.key ?
                        (
                            <Button style={{marginBottom: '50px', marginTop: '10px'}} floated='left' color='twitter' onClick={this.storeKey}>
                                <Icon name='save' />Store Key!
                            </Button>
                        ) : ''
                    }

                </Container>
            );
        else
            return (
                <Container textAlign='center'>
                    <Message
                      info
                      icon='unlock'
                      header='Save your Private Key on a secure place!'/>

                    <Button floated='left' color='twitter' onClick={this.download}>
                        <Icon name='save' />Download Key!
                    </Button>

                    <Popup
                        trigger = {
                            <Button floated='left' color='twitter' onClick={this.copyToClipboard}>
                                <Icon name='clipboard' />Copy to the Clipboard!
                            </Button>
                        }
                        content={`Key copied!`}
                        on='click'
                        open={this.state.isCopied}
                        position='bottom right'
                      />

                    <Button primary floated='right' color='twitter' onClick={this.redirect}>
                        Got it<Icon name='arrow right' />
                    </Button>

                </Container>
            );
    }
}
