import React from "react";
import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel";
import Channels from "./Channels.js";
import DirectMessages from "./DirectMessages";
import Starred from "./Starred";

const SidePanel = ({ currentUser }) => {
  return (
    <Menu
      size='large'
      inverted
      fixed='left'
      vertical
      style={{ backgroundColor: "#4c3c4c", fontSize: "1.2rem" }}
    >
      <UserPanel currentUser={currentUser} />
      <Starred currentUser={currentUser} />
      <Channels currentUser={currentUser} />
      <DirectMessages currentUser={currentUser} />
    </Menu>
  );
};
export default SidePanel;
