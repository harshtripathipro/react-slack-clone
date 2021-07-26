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
import "./app.css";

import firebase from "../../firebaseConfig";

const Login = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
    errors: "",
    loading: false,
  });
  const isFormValid = ({ email, password }) => email && password;
  const handleSubmit = (event) => {
    event.preventDefault();
    setUser({ ...user, errors: "", loading: true });
    if (isFormValid(user)) {
      firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((signedInUser) => {
          console.log(signedInUser);
          setUser({ ...user, errors: "", loading: false });
        })
        .catch((e) => {
          setUser({ ...user, errors: e, loading: false });
        });
    }
  };

  return (
    <div className='section'>
      <div className='color'></div>
      <div className='color'></div>
      <div className='color'></div>
      <Grid textAlign='center' verticalAlign='middle' className='app'>
        <Grid.Column style={{ width: 450 }} className='glass'>
          <Header as='h2' inverted icon color='black'>
            <Icon name='code branch' inverted color='violet' />
            Login for Fumes
          </Header>
          <Form size='large' onSubmit={handleSubmit}>
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
            <Button
              disabled={user.loading}
              className={user.loading ? "loading" : ""}
              size='small'
              inverted
              inverted
              color='violet'
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
            Don't have an account ?
            <Link to='/register' className='link'>
              <h5>Register</h5>
            </Link>
          </Input>
        </Grid.Column>
      </Grid>
    </div>
  );
};

export default Login;
