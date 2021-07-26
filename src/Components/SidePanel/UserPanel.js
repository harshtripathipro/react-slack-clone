import React from "react";
import { useState, useEffect } from "react";
import { Dropdown, Grid, Header, Icon, Image } from "semantic-ui-react";
import firebase from "./../../firebaseConfig";

const UserPanel = ({ currentUser }) => {
  let [user, setUser] = useState(currentUser);
  console.log(user);
  const handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("Signed Out Succesfully!!");
      });
  };
  const dropdownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>{user.displayName}</strong>
        </span>
      ),
      disabled: true,
    },
    {
      key: "avatar",
      text: <span>Change your Avatar</span>,
    },
    {
      key: "signout",
      text: <span onClick={handleSignOut}>Sign Out</span>,
    },
  ];
  return (
    <Grid style={{ backgroundColor: "#4c3c4c" }}>
      <Grid.Column>
        <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
          <Header inverted floated='left' as='h2'>
            <Icon name='code' />
            <Header.Content>Fumes</Header.Content>
          </Header>
          <Header inverted style={{ padding: "0.25em" }} as='h4'>
            <Dropdown
              trigger={
                <span>
                  <Image src={user.photoURL} spaced='right' avatar />
                  {user.displayName}
                </span>
              }
              options={dropdownOptions()}
            ></Dropdown>
          </Header>
        </Grid.Row>
      </Grid.Column>
    </Grid>
  );
};

export default UserPanel;
