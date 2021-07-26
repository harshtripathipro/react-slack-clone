import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";
import mime from "mime-types";

const FileModal = ({ modal, closeModal, uploadFile }) => {
  const [files, setFile] = useState({
    file: null,
    authorized: ["image/png", "image/jpeg"],
  });

  const addFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log(file);
      setFile({
        ...files,
        file,
      });
    }
  };

  const sendFile = () => {
    const { file } = files;
    if (file !== null) {
      if (isAuthorized(file.name)) {
        const metadata = { contentType: mime.lookup(file.name) };
        uploadFile(file, metadata);
        closeModal();
        clearFile();
      }
    }
  };

  const clearFile = () => {
    setFile({
      ...files,
      file: null,
    });
  };

  const isAuthorized = (fileName) =>
    files.authorized.includes(mime.lookup(fileName));

  return (
    <Modal basic open={modal} onClose={closeModal}>
      <Modal.Header>Select an Image File</Modal.Header>
      <Modal.Content>
        <Input
          onChange={(e) => addFile(e)}
          fluid
          label='file types: jpg, png'
          name='file'
          type='file'
        />
      </Modal.Content>
      <Modal.Actions>
        <Button color='green' inverted onClick={sendFile}>
          <Icon name='checkmark' /> Send
        </Button>
        <Button color='red' inverted onClick={closeModal}>
          <Icon name='remove' /> Cancel
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default FileModal;
