import React, { useState, useEffect } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import firebase from "./../../firebaseConfig";

const Messages = (props) => {
  const [messages, setMessages] = useState({
    messagesRef: firebase.database().ref("messages"),
    privateMessagesRef: firebase.database().ref("privateMessages"),
    channel: props.currentChannel,
    user: props.currentUser,
    usersRef: firebase.database().ref("users"),
    messagess: [],
    messagesLoading: true,
    progressBar: false,
    searchTerm: "",
    searchLoading: false,
    searchResults: [],
    privateChannel: props.isPrivateChannel,
  });

  const getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = messages;
    return privateChannel ? privateMessagesRef : messagesRef;
  };

  const [num, setNum] = useState({
    numUniqueUsers: "",
  });

  const [search, setSearch] = useState({
    searchResults: [],
  });

  const [channelstar, setChannelStar] = useState({
    isChannelStarred: false,
    load: true,
  });

  useEffect(() => {
    const { channel, user } = messages;
    if (user && channel) {
      addListeners(channel.id);
      addUserStarsListener(channel.id, user.uid);
    }
    // starChannel();
  }, [messages.channel]);

  useEffect(() => {
    if (!channelstar.load) starChannel();
  }, [channelstar.isChannelStarred]);

  const addUserStarsListener = (channelId, userId) => {
    messages.usersRef
      .child(userId)
      .child("starred")
      .once("value")
      .then((data) => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          setChannelStar({
            isChannelStarred: prevStarred,
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const addListeners = (channelId) => {
    addMessageListener(channelId);
  };

  const addMessageListener = (channelId) => {
    let loadedMessages = [];
    const ref = getMessagesRef();
    ref.child(channelId).on("child_added", (snap) => {
      loadedMessages.push(snap.val());
      setMessages({
        ...messages,
        messagesLoading: false,
        messagess: loadedMessages,
      });
      countUniqueUsers(loadedMessages);
      countUserPosts(loadedMessages);
    });
  };

  const countUserPosts = (messagess) => {
    let userPosts = messagess.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          count: 1,
          avatar: message.user.avatar,
        };
      }
      return acc;
    }, {});
    // props.setUserPosts(userPosts)
  };

  const handleStar = () => {
    setChannelStar({
      isChannelStarred: !channelstar.isChannelStarred,
      load: false,
    });
  };

  const starChannel = () => {
    if (channelstar.isChannelStarred) {
      messages.usersRef.child(`${messages.user.uid}/starred`).update({
        [messages.channel.id]: {
          name: messages.channel.name,
          details: messages.channel.details,
          createdBy: {
            name: messages.channel.createdBy.name,
            avatar: messages.channel.createdBy.avatar,
          },
        },
      });
    } else {
      messages.usersRef
        .child(`${messages.user.uid}/starred`)
        .child(messages.channel.id)
        .remove((err) => {
          console.log(err);
        });
    }
  };

  const handleSearchChange = (event) => {
    setMessages({
      ...messages,
      searchTerm: event.target.value,
      searchLoading: true,
    });
    handleSearchMessages();
  };

  const handleSearchMessages = () => {
    const channelMessages = [...messages.messagess];
    const regex = new RegExp(messages.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      )
        acc.push(message);

      return acc;
    }, []);
    setSearch({
      searchResults: searchResults,
    });
  };

  const countUniqueUsers = (loadedMessages) => {
    const uniqueUsers = loadedMessages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) acc.push(message.user.name);
      return acc;
    }, []);
    var plural = false;
    if (uniqueUsers.length > 1) plural = true;
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
    setNum({
      numUniqueUsers,
    });
  };
  const {
    messagesRef,
    channel,
    user,
    messagess,
    progressBar,
    searchTerm,
    privateChannel,
  } = messages;

  const { isChannelStarred } = channelstar;

  const displayMessages = (messagess) =>
    messagess.length > 0 &&
    messagess.map((message) => (
      <Message user={user} key={message.timestamp} message={message} />
    ));

  const isProgressVisible = (percent) => {
    if (percent > 0)
      setMessages({
        ...messages,
        progressBar: true,
      });
  };

  const displayChannelName = () => {
    return channel ? `${privateChannel ? "@" : "#"}${channel.name}` : "";
  };

  return (
    <React.Fragment>
      <MessagesHeader
        channelName={displayChannelName()}
        numUniqueUsers={num.numUniqueUsers}
        handleSearchChange={handleSearchChange}
        isPrivateChannel={privateChannel}
        handleStar={handleStar}
        isChannelStarred={isChannelStarred}
      />
      <Segment>
        <Comment className={progressBar ? "messages__progress" : "messages"}>
          {searchTerm
            ? displayMessages(search.searchResults)
            : displayMessages(messagess)}
        </Comment>
      </Segment>
      <MessageForm
        channel={channel}
        messagesRef={messagesRef}
        user={user}
        isProgressVisible={isProgressVisible}
        isPrivateChannel={privateChannel}
        getMessagesRef={getMessagesRef}
      />
    </React.Fragment>
  );
};
export default Messages;
