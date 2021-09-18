import {Card, TextField, withStyles} from "@material-ui/core";
import React, {Component} from "react";
import UserService from "../services/user.service";
import Grid from "@material-ui/core/Grid";
import AuthService from "../services/auth.service";
import Button from "@material-ui/core/Button";
import UserCardMessage from "./user-card-message.component";
import DoneOutlineIcon from "@material-ui/icons/DoneOutline";
import {Client} from '@stomp/stompjs';
import SockJS from "sockjs-client";
// import {Stomp} from 'stompjs';
// import {StompEventTypes, withStomp} from 'react-stompjs'
// import SockJsClient from 'react-stomp';
// import { TalkBox } from "react-talk";

const useStyles = theme => ({
    root: {
        // width: 635,
        // marginRight: theme.spacing(1),
        "& .MuiFormLabel-root": {
            margin: 0,
            color: "black"
        }
    },
    paper: {
        marginTop: theme.spacing(3),
        marginRight: theme.spacing(2),
        // padding: theme.spacing(3),
        // marginLeft: theme.spacing(1),
        // padding: theme.spacing(1),
        color: "black",
        // display: 'flex',
        minHeight: 600,
    },
    paper2: {
        marginTop: theme.spacing(3),
        padding: theme.spacing(3),
        color: "black",
        minHeight: 600,
    },
    mainGrid: {
        display: 'flex',
        minWidth: 1000,
    },
    button: {
        width: 263,
    },
    messageGrid: {
        width: 720,
        height: 440,
    }
});

var stompClient;
const API_URL = process.env.REACT_APP_API_URL;

class Chat extends Component {
    constructor(props) {
        super(props);
        this.onChangeMessageContent = this.onChangeMessageContent.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.selectUser = this.selectUser.bind(this);
        this.connectToChat = this.connectToChat.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.onError = this.onError.bind(this);
        // this.onConnected = this.onConnected.bind(this);
        // this.onDisconnect = this.onDisconnect.bind(this);
        // this.onMessageReceived = this.onMessageReceived.bind(this);
        this.state = {
            content: "",
            contentPresence: false,
            contentCorrect: "",
            selectedUser: [],
            incomingMessage: false,
            messages: [],
            clientConnected: false,
        };
    }

    connectToChat() {
        console.log("connecting to chat...");
        const Stomp = require("stompjs");
        var SockJS = require("sockjs-client");
        console.log(API_URL)
        SockJS = new SockJS("/chat/msg");
        console.log(SockJS)
        stompClient = Stomp.over(SockJS);
        // var stompClient = Stomp.overWS('ws://localhost:8081/chat/msg');
        // var socket = new SockJS('/msg');
        // stompClient = Stomp.over(socket);
        console.log('я тут')
        stompClient.connect({}, function (frame) {
                console.log("hello" + frame)
                stompClient.subscribe("/topic/messages/" + AuthService.getCurrentUser().username, function (response) {
                    let data = JSON.parse(response.body);
                    console.log(response)
                    console.log(response.body)
                    console.log(data)
                    console.log(data.content)
                    if (this.selectedUser === data.senderName) {
                        this.setState({
                            messages: data.content
                        })
                    } else {
                        alert("new mes")
                    }
                });
            }
        )
        ;
    }


    onError = (err) => {
        console.log(err);
    };

    getUsers() {
        const {searchString} = this.state
        UserService.getAllByUsername(searchString)
            .then((response) => {
                const users = response.data;
                this.refreshList();
                this.setState({
                    users: users,
                });
            })
            .catch((e) => {
                console.log(e);
            });
    }

    refreshList() {
        this.setState({
            users: [],
        });
    }

    componentDidMount() {
        this.getUsers();
        this.connectToChat()
        // console.log('Component did mount');
        // // The compat mode syntax is totally different, converting to v5 syntax
        // // Client is imported from '@stomp/stompjs'
        // this.client = new Client();
        //
        // this.client.configure({
        //     brokerURL: 'ws://localhost:8081/app/chat/msg',
        //     onConnect: () => {
        //         console.log('onConnect');
        //
        //         // this.client.subscribe('/queue/now', message => {
        //         //     console.log(message);
        //         //     this.setState({serverTime: message.body});
        //         // });
        //
        //         this.client.subscribe('/topic/messages/' + AuthService.getCurrentUser().username, message => {
        //             alert(message.body);
        //         });
        //     },
        //     // Helps during debugging, remove in production
        //     debug: (str) => {
        //         console.log(new Date(), str);
        //     }
        // });
        //
        // this.client.activate();
    };

    onChangeMessageContent(e) {
        let str = e.target.value
        str = str.replace(/ {2,}/g, ' ').trim();
        str = str.replace(/[\n\r ]{3,}/g, '\n\r\n\r');
        if (str.charCodeAt(0) > 32) {
            this.setState({
                content: e.target.value,
                contentCorrect: str,
                contentPresence: true
            });
        } else {
            this.setState({
                content: e.target.value,
                contentCorrect: str,
                contentPresence: false
            });
        }
    }

    sendMessage() {
        console.log(this.state.selectedUser.id)
        console.log(this.state.selectedUser.id)
        console.log(this.state.selectedUser.username)
        const message = {
            senderId: AuthService.getCurrentUser().id,
            recipientId: this.state.selectedUser.id,
            senderName: AuthService.getCurrentUser().username,
            recipientName: this.state.selectedUser.username,
            content: this.state.contentCorrect,
            sendDate: new Date(),
        };
        stompClient.send("/app/message.send/" + this.state.selectedUser.username, {}, JSON.stringify(message));
        this.setState({
            messages: message
        })
    }

    selectUser(user) {
        console.log(user)
        this.setState({
            selectedUser: user
        })
    }


    // onConnected = () => {
    //     console.log("Connected!!")
    // }
    //
    // onDisconnect = () => {
    //     console.log("Disconnected!!")
    // }
    //
    // onMessageReceived = (msg) => {
    //     this.setState({
    //         messages: msg.message
    //     })
    // }

    // onMessageReceive = (msg, topic) => {
    //     this.setState(prevState => ({
    //         messages: [...prevState.messages, msg]
    //     }));
    // }
    //
    // sendMessage = (msg, selfMsg) => {
    //     try {
    //         this.clientRef.sendMessage("/app/message.send/" + this.state.selectedUser.username, JSON.stringify(selfMsg));
    //         return true;
    //     } catch(e) {
    //         return false;
    //     }
    // }

    render() {
        const {classes} = this.props;
        const {messages} = this.state
        // const wsSourceUrl = window.location.protocol + "//" + window.location.host + "/chat/msg";
        // console.log(wsSourceUrl)
        return (
            <Grid>
                {/*<TalkBox topic="react-websocket-template" currentUserId={ AuthService.getCurrentUser().id }*/}
                {/*         currentUser={ AuthService.getCurrentUser().username } messages={ this.state.messages }*/}
                {/*         onSendMessage={ this.sendMessage } connected={ this.state.clientConnected }/>*/}

                {/*<SockJsClient url={ "/chat/msg" } topics={["/topic/messages/" + AuthService.getCurrentUser().username]}*/}
                {/*              onMessage={ this.onMessageReceive } ref={ (client) => { this.clientRef = client }}*/}
                {/*              onConnect={ () => { this.setState({ clientConnected: true }) } }*/}
                {/*              onDisconnect={ () => { this.setState({ clientConnected: false }) } }*/}
                {/*              debug={ false }/>*/}
                <Grid xs={12} item className={classes.mainGrid}>
                    <Grid xs={3} item>
                        <Card className={classes.paper}>
                            {this.state.users &&
                            this.state.users.map((user, index) => (
                                <Button
                                    className={classes.button}
                                    value={user}
                                    onClick={() => this.selectUser(user)}
                                    key={index}
                                >
                                    <UserCardMessage user={user}/>
                                </Button>
                            ))}
                        </Card>
                    </Grid>

                    <Grid xs={9} item>
                        <Card className={classes.paper2}>
                            <Grid className={classes.grid}>
                                <Grid className={classes.messageGrid}>
                                    <Grid>
                                        <ul>
                                            {this.state.messages.map((msg) => (
                                                <li>
                                                    <p>{msg.content}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </Grid>
                                </Grid>
                                <TextField
                                    className={classes.root}
                                    multiline
                                    minRows={2}
                                    maxRows={10}
                                    variant="outlined"
                                    fullWidth
                                    id="content"
                                    label="Оставьте отзыв..."
                                    name="content"
                                    autoComplete="off"
                                    value={this.state.content}
                                    onChange={this.onChangeMessageContent}
                                />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={this.sendMessage}
                                    // className={classes.submit}
                                    disabled={!this.state.contentPresence}
                                >
                                    <DoneOutlineIcon/>
                                </Button>
                            </Grid>
                        </Card>
                    </Grid>

                </Grid>
            </Grid>
        );
    }
}

export default withStyles(useStyles)(Chat)