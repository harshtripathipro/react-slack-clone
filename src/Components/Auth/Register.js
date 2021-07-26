import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  Form,
  Header,
  Button,
  Message,
  Icon,
  Segment,
  Input,
  Label,
} from "semantic-ui-react";
import md5 from "md5";
import "./app.css";

import firebase from "../../firebaseConfig";

const RegisterUser = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    errors: "",
    loading: false,
    usersRef: firebase.database().ref("users"),
  });

  const isFormEmpty = ({ username, email, password, confirmPassword }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !confirmPassword.length
    );
  };

  const isPasswordValid = ({ password, confirmPassword }) => {
    if (password.length >= 6 && confirmPassword.length >= 6) {
      if (password === confirmPassword) return true;
    }
    return false;
  };

  const isFormValid = () => {
    setUser({ ...user, loading: true, errors: "" });
    let error = {};
    let flag = true;
    if (isFormEmpty(user)) {
      flag = false;
      error = { message: "Fill in all Fields" };
      setUser({
        ...user,
        errors: error,
      });
    } else if (!isPasswordValid(user)) {
      flag = false;
      error = { message: "Password is invalid" };
      setUser({
        ...user,
        errors: error,
      });
    }
    return flag;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isFormValid()) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then((createdUser) => {
          console.log(createdUser);
          createdUser.user
            .updateProfile({
              displayName: user.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`,
            })
            .then(async () => {
              await saveUser(createdUser);
              console.log("user saved");
            });
          setUser({ ...user, loading: false, errors: "" });
        })

        .catch((e) => {
          let error = { message: e };
          console.log(e);
          setUser({ ...user, errors: error, loading: false });
        });
    }
  };

  const saveUser = async (createdUser) => {
    return user.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL,
    });
  };
  return (
    <div className='section'>
      <div className='color'></div>
      <div className='color'></div>
      <div className='color'></div>
      <Grid textAlign='center' verticalAlign='middle' className='app'>
        <Grid.Column style={{ width: 450 }} className='glass'>
          <Header as='h2' inverted icon color='black'>
            <Icon name='fire' inverted color='red' />
            Register for Fumes
          </Header>
          <Form size='large' onSubmit={handleSubmit}>
            <Input
              className='forminp'
              fluid
              name='username'
              icon='user'
              iconPosition='left'
              placeholder='Username'
              type='text'
              transparent={true}
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
            <Input
              className='forminp'
              fluid
              name='email'
              icon='mail'
              iconPosition='left'
              placeholder='Email'
              type='email'
              transparent={true}
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <Input
              className='forminp'
              fluid
              name='password'
              icon='lock'
              iconPosition='left'
              placeholder='Password'
              type='password'
              transparent={true}
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
            <Input
              className='forminp'
              fluid
              name='confirmPassword'
              icon='repeat'
              iconPosition='left'
              placeholder='Confirm Password'
              type='password'
              transparent={true}
              value={user.confirmPassword}
              onChange={(e) =>
                setUser({ ...user, confirmPassword: e.target.value })
              }
            />
            <Button
              disabled={user.loading}
              className={user.loading ? "loading" : ""}
              size='small'
              inverted
              color='red'
              circular={true}
            >
              Submit
            </Button>
          </Form>
          {user.errors !== "" && (
            <div className='forminpl'>
              <h3>
                Error
                <Icon name='warning circle' inverted color='red' />
              </h3>
              {user.errors.message}
            </div>
          )}
          <Input fluid className='forminp'>
            Already a user ?
            <Link to='/login' className='link'>
              <h5>Login</h5>
            </Link>
          </Input>
        </Grid.Column>
      </Grid>
    </div>
  );
};

export default RegisterUser;
