import React, { useState, useEffect } from "react";
import { Menu, Icon, Message } from "semantic-ui-react";
import firebase from "./../../firebaseConfig";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "./../../actions/index";

class DirectMessages extends React.Component {
  state = {
    userss: [],
    activeChannel: "",
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    connectedRef: firebase.database().ref(".info/connected"),
    presenceRef: firebase.database().ref("presence"),
  };

  // const [userArray, setUserArray] = useState({
  //   use: [],
  // });

  // const { userss, user, usersRef, connectedRef, presenceRef } = this.state;
  // const { use } = userArray;

  // useEffect(() => {
  //   if (user) {
  //     addListener(user.uid);
  //   }
  // }, []);
  // useEffect(() => {
  //   if (user) {
  //     addPresence(user.uid);
  //   }
  // }, [use]);

  componentDidMount() {
    if (this.state.user) {
      this.addListener(this.state.user.uid);
    }
  }

  addListener = (currentUserUid) => {
    let loadedUsers = [];
    this.state.usersRef.on("child_added", (snap) => {
      if (currentUserUid !== snap.key) {
        let user = snap.val();
        console.log(user);
        user["uid"] = snap.key;
        user["status"] = "offline";
        loadedUsers.push(user);
        console.log(loadedUsers);
        this.setState({
          userss: loadedUsers,
        });
      }
    });

    this.state.connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(currentUserUid);
        ref.set(true);
        ref.onDisconnect().remove((err) => {
          if (err !== null) {
            console.log(err);
          }
        });
      }
    });
    this.state.presenceRef.on("child_added", (snap) => {
      if (currentUserUid !== snap.key) {
        const userId = snap.key;
        const connected = true;
        this.addStatusToUser(userId, connected);
      }
    });
    this.state.presenceRef.on("child_removed", (snap) => {
      if (currentUserUid !== snap.key) {
        const userId = snap.key;
        const connected = false;
        this.addStatusToUser(userId, connected);
      }
    });
  };

  // console.log(users.userss);

  addStatusToUser = (userId, connected = true) => {
    const updatedUsers = this.state.userss.reduce((acc, user) => {
      if (user.uid === userId) {
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(user);
    }, []);
    this.setState({
      userss: updatedUsers,
    });
  };

  isuserOnline = (user) => user.status === "online";

  // const { activeChannel } = users;

  changeChannel = (user) => {
    this.setState({
      activeChannel: user.uid,
    });
    const channelId = this.getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name,
    };
    this.props.setCurrentChannel(channelData);
    this.props.setPrivateChannel(true);
  };

  getChannelId = (userId) => {
    const currentUserId = this.state.user.uid;
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  render() {
    return (
      <Menu.Menu className='menu'>
        <Menu.Item>
          <span>
            <Icon name='mail' />
            DIRECT MESSAGES
          </span>{" "}
          ({this.state.userss.length})
        </Menu.Item>
        {this.state.userss.map((user) => (
          <Menu.Item
            key={user.uid}
            onClick={() => this.changeChannel(user)}
            style={{ fontStyle: "italic", opacity: 0.7 }}
            active={user.uid === this.state.activeChannel}
          >
            <Icon
              name='circle'
              color={this.isuserOnline(user) ? "green" : "red"}
            />
            @{user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  DirectMessages
);
