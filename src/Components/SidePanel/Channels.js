import React from "react";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label,
} from "semantic-ui-react";
import firebase from "./../../firebaseConfig";
import { setCurrentChannel, setPrivateChannel } from "./../../actions/index";
import { connect, useStore } from "react-redux";

class Channels extends React.Component {
  state = {
    channel: [],
    channell: null,
    messagesRef: firebase.database().ref("messages"),
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    user: this.props.currentUser,
    open: false,
    firstLoad: true,
    activeChannel: "",
    notifications: [],
  };

  // useEffect(() => {
  //   addListeners();
  //   setFirstChannel(channels);

  //   // return () => {
  //   //   window.removeEventListener("mousemove", () => {
  //   //     removeListeners(channels);
  //   //   });
  //   // };
  // }, [channels.channel, channels.channell]);

  // const [notification, setNotification] = useState({
  //   notifications: [],
  // });
  componentDidMount() {
    this.addListeners();
  }
  // componentDidUpdate() {
  //   this.addListeners();
  // }

  componentWillUnmount() {
    this.removeListeners(this.state);
  }

  closeModal = () => {
    this.setState({
      open: false,
    });
  };
  openModal = () => {
    this.setState({
      open: true,
    });
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  addListeners = () => {
    let loadedChannels = [];
    const { channelsRef } = this.state;
    channelsRef.on("child_added", (snap) => {
      loadedChannels.push(snap.val());
      this.setState(
        {
          channel: loadedChannels,
          // channell: loadedChannels[0],
        },
        () => this.setFirstChannel(this.state)
      );
      console.log(snap.key);
      this.addNotificationListener(snap.key);
    });
  };

  addNotificationListener = (channelId) => {
    const { messagesRef, channell, notifications } = this.state;
    // const { notifications } = notification;
    messagesRef.child(channelId).on("value", (snap) => {
      if (channell) {
        this.handleNotifications(channelId, channell.id, notifications, snap);
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;
    let index = notifications.findIndex(
      (notification) => notification.id === channelId
    );
    if (index !== -1) {
      console.log(channelId, currentChannelId);
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0,
      });
    }
    this.setState({
      notifications,
    });
  };

  removeListeners = ({ channelsRef }) => {
    channelsRef.off();
  };

  setFirstChannel = ({ firstLoad, channel }) => {
    const firstChannel = this.state.channel[0];
    console.log(firstLoad, channel.length);
    if (this.state.channel.length > 0 && firstLoad) {
      this.props.setCurrentChannel(firstChannel);
      this.activeChannel(firstChannel);
      this.setState({
        channell: firstChannel,
      });
    }

    this.setState({
      firstLoad: false,
    });
  };

  addChannel = () => {
    const { channelsRef, channelName, channelDetails, user } = this.state;

    const key = channelsRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL,
      },
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({
          channelName: "",
          channelDetails: "",
        });
        this.closeModal();
        console.log("Channel Added");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  isFormValid = ({ channelName, channelDetails }) => {
    if (channelName && channelDetails) return true;
    return false;
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  activeChannel = (Channel) => {
    this.setState({
      activeChannel: Channel.id,
    });
  };

  changeChannel = (Channel) => {
    this.setState({
      channell: Channel,
    });
    console.log(Channel);
    this.activeChannel(Channel);
    this.props.setCurrentChannel(Channel);
    this.props.setPrivateChannel(false);

    this.clearNotifications();
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      (notif) => notif.id === this.state.channell.id
    );
    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({
        notifications: updatedNotifications,
      });
    }
  };

  displayChannels = ({ channel }) =>
    channel.length > 0 &&
    channel.map((Channel) => {
      return (
        <Menu.Item
          key={Channel.id}
          name={Channel.name}
          style={{ opacity: 0.7 }}
          onClick={() => this.changeChannel(Channel)}
          active={Channel.id === this.state.activeChannel}
        >
          {this.getNotificationCount(Channel) && (
            <Label color='red'>{this.getNotificationCount(Channel)}</Label>
          )}
          #{Channel.name}
        </Menu.Item>
      );
    });
  // const { user } = channels;

  getNotificationCount = (channel) => {
    let count = 0;
    this.state.notifications.forEach((notif) => {
      if (notif.id === channel.id) count = notif.count;
    });

    if (count > 0) return count;
  };

  render() {
    return (
      <React.Fragment>
        <Menu.Menu className='menu'>
          <Menu.Item>
            <span>
              <Icon name='exchange' />
              CHANNELS
            </span>
            {"    "}({this.state.channel.length})
            <Icon name='add' onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(this.state)}
        </Menu.Menu>
        <Modal basic open={this.state.open} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  name='channelName'
                  label='Name of Channel'
                  onChange={(event) => this.handleChange(event)}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  name='channelDetails'
                  label='About the Channel'
                  onChange={(event) => this.handleChange(event)}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color='green' inverted onClick={this.handleSubmit}>
              <Icon name='checkmark' />
              Add
            </Button>
            <Button color='red' inverted onClick={this.closeModal}>
              <Icon name='remove' />
              Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  Channels
);
