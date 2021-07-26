import React, { useState, useEffect } from "react";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";
import { setCurrentChannel } from "./../../actions/index";
import { setPrivateChannel } from "./../../actions/index";
import firebase from "./../../firebaseConfig";

const Starred = (props) => {
  const [starredchannels, setSch] = useState({
    starredChannels: [],
    activeChannel: "",
    user: props.currentUser,
    usersRef: firebase.database().ref("users"),
  });

  useEffect(() => {
    console.log(starredchannels.user);
    if (starredchannels.user) {
      addListeners(starredchannels.user.uid);
    }
  }, []);

  const addListeners = (userId) => {
    let starredChannells = [];
    starredchannels.usersRef
      .child(userId)
      .child("starred")
      .on("child_added", (snap) => {
        const starredChannel = { id: snap.key, ...snap.val() };
        starredChannells.push(starredChannel);
        setSch({
          ...starredchannels,
          starredChannels: starredChannells,
        });
      });
    starredchannels.usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", (snap) => {
        const channelToRemove = { id: snap.key, ...snap.val() };
        const filteredChannels = starredChannells.filter((channel) => {
          return channel.id !== channelToRemove.id;
        });
        setSch({
          ...starredchannels,
          starredChannels: filteredChannels,
        });
        starredChannells = filteredChannels;
      });
  };

  const displayChannels = (starredChannels) =>
    starredChannels.length > 0 &&
    starredChannels.map((Channel) => {
      return (
        <Menu.Item
          key={Channel.id}
          name={Channel.name}
          style={{ opacity: 0.7 }}
          onClick={() => changeChannel(Channel)}
          active={Channel.id === starredchannels.activeChannel}
        >
          #{Channel.name}
        </Menu.Item>
      );
    });

  const changeChannel = (Channel) => {
    activeChannel(Channel);
    props.setCurrentChannel(Channel);
    props.setPrivateChannel(false);
  };

  const activeChannel = (Channel) => {
    console.log("hello");
    setSch({
      ...starredchannels,
      activeChannel: Channel.id,
    });
  };

  // const { starredChannels } = starredchannels;

  return (
    <Menu.Menu className='menu'>
      <Menu.Item>
        <span>
          <Icon name='star' />
          STARRED
        </span>
        {"    "}({starredchannels.starredChannels.length})
      </Menu.Item>
      {displayChannels(starredchannels.starredChannels)}
    </Menu.Menu>
  );
};

export default connect(null, { setCurrentChannel, setPrivateChannel })(Starred);
