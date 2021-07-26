import React, { useState, useEffect } from "react";
import { Segment, Input, Button } from "semantic-ui-react";
import FileModal from "./FileModal";
import firebase from "./../../firebaseConfig";
import uuidv4 from "uuid/v4";
import ProgressBar from "./ProgressBar";

const MessageForm = (props) => {
  const [Message, setMessage] = useState({
    storageRef: firebase.storage().ref(),
    message: "",
    loading: false,
    channel: props.channel,
    user: props.user,
    errors: [],
    modal: false,
    uploadState: "",
    uploadTask: null,
    percentUpload: 0,
    pathToUpload: "",
    ref: "",
  });

  useEffect(() => {
    updateUploadTask(Message);
  }, [Message.uploadTask]);

  const openModal = () => {
    setMessage({
      ...Message,
      modal: true,
    });
  };
  const closeModal = () => {
    setMessage({
      ...Message,
      modal: false,
    });
  };

  const handleChange = (event) => {
    setMessage({
      ...Message,
      [event.target.name]: event.target.value,
    });
  };

  const createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: Message.user.uid,
        name: Message.user.displayName,
        avatar: Message.user.photoURL,
      },
    };
    if (fileUrl !== null) message["image"] = fileUrl;
    else message["content"] = Message.message;
    console.log(message);
    return message;
  };

  const sendMessage = () => {
    const { getMessagesRef } = props;
    const { message, channel } = Message;

    if (message) {
      setMessage({
        ...Message,
        loading: true,
      });

      getMessagesRef()
        .child(channel.id)
        .push()
        .set(createMessage())
        .then(() => {
          setMessage({
            ...Message,
            loading: false,
            message: "",
            errors: [],
          });
        })
        .catch((e) => {
          setMessage({
            ...Message,
            errors: Message.errors.concat(e),
          });
        });
    } else {
      setMessage({
        ...Message,
        errors: Message.errors.concat({ message: "Add a message" }),
      });
    }
  };
  const {
    errors,
    message,
    loading,
    modal,
    uploadState,
    percentUpload,
    channel,
  } = Message;

  const getPath = () => {
    if (props.isPrivateChannel) {
      return `chat/private-${channel.id}`;
    } else {
      return `chat/public`;
    }
  };

  const uploadFile = (file, metadata) => {
    console.log(file, metadata);
    Message.pathToUpload = Message.channel.id;
    Message.ref = props.getMessagesRef();

    const filePath = `${getPath()}/${uuidv4()}.jpg`;
    Message.uploadState = "loading";
    Message.uploadTask = Message.storageRef.child(filePath).put(file, metadata);
    console.log(Message);
  };

  const updateUploadTask = ({ pathToUpload, ref }) => {
    console.log(Message.uploadTask);
    if (Message.uploadTask)
      Message.uploadTask.on(
        "state_changed",
        (snap) => {
          const percentUpload = Math.round(
            (snap.bytesTransferred / snap.totalBytes) * 100
          );
          props.isProgressVisible(percentUpload);
          setMessage({
            ...Message,
            percentUpload,
          });
        },
        (err) => {
          console.log(err);
          setMessage({
            ...Message,
            errors: Message.errors.concat(err),
            uploadState: "error",
            uploadTask: null,
          });
        },
        () => {
          Message.uploadTask.snapshot.ref
            .getDownloadURL()
            .then((downloadURL) => {
              console.log(pathToUpload, ref);
              sendFileMessage(downloadURL, ref, pathToUpload);
            })
            .catch((e) => {
              console.log(e);
              setMessage({
                ...Message,
                errors: Message.errors.concat(e),
                uploadState: "error",
                uploadTask: null,
              });
            });
        }
      );
  };

  const sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(createMessage(fileUrl))
      .then(() => {
        setMessage({
          ...Message,
          uploadState: "done",
          ref: "",
          pathToUpload: "",
        });
      })
      .catch((e) => {
        console.log(e);
        setMessage({
          ...Message,
          errors: Message.errors.concat(e),
          uploadState: "error",
          uploadTask: null,
        });
      });
  };

  return (
    <Segment className='messages__form'>
      <Input
        fluid
        name='message'
        value={message}
        onChange={(e) => handleChange(e)}
        style={{ marginBottom: "0.7em" }}
        label={<Button icon={"add"} />}
        labelPosition='left'
        placeholder='Write your message'
        className={
          errors && errors.some((error) => error.message.includes("message"))
            ? "error"
            : ""
        }
      />
      <Button.Group icon widths='2'>
        <Button
          loading={loading}
          onClick={sendMessage}
          color='orange'
          content='Add reply'
          labelPosition='left'
          icon='edit'
        />
        <Button
          color='teal'
          disabled={uploadState === "loading"}
          content='Upload media'
          labelPosition='right'
          icon='cloud upload'
          onClick={openModal}
        />
      </Button.Group>
      <FileModal
        closeModal={closeModal}
        modal={modal}
        uploadFile={uploadFile}
      />
      <ProgressBar percentUpload={percentUpload} uploadState={uploadState} />
    </Segment>
  );
};

export default MessageForm;
