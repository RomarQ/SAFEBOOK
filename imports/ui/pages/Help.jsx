import React from 'react'
import {
  Label,
  Button,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  List,
  Menu,
  Segment,
  Visibility,
} from 'semantic-ui-react'

export default class Help extends React.Component {
    render() {

        return (
            <div>
                <Segment style={{ padding: '8em 0em', paddingBottom: '2em' }} vertical>
                    <Grid container stackable verticalAlign='middle'>
                        <Grid.Row>
                            <Grid.Column>
                                <Header as='h3' style={{ fontSize: '2em' }}>What is SAFEBOOK?</Header>
                                <p style={{ fontSize: '1.33em' }}>
                                    SafeBook is a Social Web Application that allows anyone that wants a fast and comfortable way to share encrypted messages with Friends, Family, Co-Workers, etc... to do so.
                                </p>
                                <p style={{fontSize: '1em'}}>
                                    All you need to start sending encrypted messages is create an account and save the respective private key on a secure place. After you have done all of that you can send messages to anyone on Safebook.
                                </p>
                                <Header as='h3' style={{ fontSize: '2em' }}>How does SAFEBOOK work?</Header>
                                <p style={{ fontSize: '1.33em'}}>
                                    So, basically SAFEBOOK generates RSA key pairs to everyone that creates an account, then saves the generated public key on Database with respective user information<sup style={{fontSize: '0.7em', color:'red'}} > (Private keys never leaves the client’s’ browser, very important!)</sup>, also stores the private key on the client’s browser session and allows him to download it.
                                </p>
                                <p style={{ fontSize: '1.33em'}}>
                                    Every time the user Logs out, the respective private key will be deleted from the browser session, and when he logs on again the SAFEBOOK client will detect that there is not a private key in session and will ask the user to import his private key again to be able to decrypt and send new encrypted messages. <sub style={{fontSize: '0.7em', color:'blue'}}>(Safebook client will be able to detect if key is valid or not using a signature to verify that).</sub>
                                </p>
                                <p style={{ fontSize: '1.33em'}}>
                                    When sending a message, what Safebook does is, generate a symmetric key that allows the sender and receiver(s) to decrypt the message. It also signs the original message with the current   date with the sender’s private key, then encrypts the message with the generated symmetric key and encrypts the symmetric key to the sender and every receiver using their public keys. After that, the message is stored on the database and every receiver receives a notification.
                                </p>
                                <p style={{ fontSize: '1.33em'}}>
                                    When sending a message, what Safebook does is, verify if  the user is a receiver or sender of the message and then if he is, first decrypts the symmetric key using  the user’s private key stored on his session, then verifies if the message is the original and if it is then creates a signature of when the message was read using the decrypted message with the current date.
                                </p>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
                <Segment style={{ padding: '0em' }} vertical>
                    <Grid celled='internally' columns='equal' stackable>
                        <Grid.Row textAlign='center'>
                          <Grid.Column style={{ paddingBottom: '5em', paddingTop: '2em' }}>
                            <Header as='h3' style={{ fontSize: '2em' }}>Symmetric Ciphers</Header>

                            <Grid columns={2}>
                                <Grid.Row>
                                    <Grid.Column>
                                        <Segment padded>
                                            <Label attached='top'><b>AES</b></Label>
                                            <Label color='blue' style={{ margin: '5px' }}><b>Key size: 256 bits</b></Label>
                                            <Label color='blue' style={{ margin: '5px' }}><b>Block mode: CBC</b></Label>
                                            <Label color='blue' style={{ margin: '5px' }}><b>Padding: Pkcs7</b></Label>
                                        </Segment>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Segment padded>
                                            <Label attached='top'><b>RC4</b></Label>
                                            <Label color='blue'><b>Key size: 1024 bits</b></Label>
                                        </Segment>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>

                            <p style={{ fontSize: '1.33em' }}>
                                Used to encrypt and decrypt the content of a message, only sender and receiver(s) have access to the key of a respective message.
                            </p>
                            <p style={{ fontSize: '1.33em' }}>
                                This symmetric keys are encrypted with a given public key, and only
                                the person with the respective private key can decrypt the symmetric key.
                            </p>
                          </Grid.Column>
                          <Grid.Column style={{ paddingBottom: '5em', paddingTop: '2em' }}>
                            <Header as='h3' style={{ fontSize: '2em' }}>Hashers</Header>

                            <Grid columns={2}>
                                <Grid.Row>
                                    <Grid.Column>
                                        <Segment padded>
                                            <Label attached='top' size='large'><b>SHA-256</b></Label>
                                            <Label color='blue' size='large'>SHA-256 is the most established of the existing SHA hash functions, and it's used in a variety of security applications and protocols.</Label>
                                        </Segment>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Segment padded>
                                            <Label attached='top' size='large'><b>SHA-3-512 (Keccak)</b></Label>
                                            <Label color='blue' size='large'>SHA-3 is the winner of a five-year competition to select a new cryptographic hash algorithm where 64 competing designs were evaluated.</Label>
                                        </Segment>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>

                            <p style={{ fontSize: '1.33em' }}>
                                Used to digest a concatenated string of message with the date of when was created.
                            </p>
                            <p style={{ fontSize: '1.33em' }}>
                                The returned hash allows us to sign and verify the integrity and authenticity of the messages.
                            </p>
                          </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
                <Segment style={{ padding: '2em 0em', paddingBottom:'8em' }} vertical>
                    <Grid container stackable verticalAlign='middle'>
                        <Grid.Row>
                          <Grid.Column>
                              <Header as='h3' style={{ fontSize: '2em' }}>Asymmetric Cipher</Header>
                              <Segment padded>
                                  <Label attached='top' size='large'><b>RSA</b></Label>
                                  <Label color='blue'><b>Key size: 2048 bits</b></Label>

                              </Segment>
                              <p style={{ fontSize: '1.33em' }}>
                                  Used to protect during the transmission of the symmetric keys that were used to encrypt and will be used to decrypt the contents of the message. <br/>
                                  Are also used to sign and verify the integrity and autenticity of the messages.
                              </p>
                          </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </div>
        )
    }
}
