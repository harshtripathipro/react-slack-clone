import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import App from "./Components/App";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter,
} from "react-router-dom";
import Login from "./Components/Auth/Login";
import RegisterUser from "./Components/Auth/Register";
import registerServiceWorker from "./registerServiceWorker";
import "semantic-ui-css/semantic.min.css";
import firebase from "./firebaseConfig";
import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers/index";
import { setUser, clearUser } from "./actions/index";
import Spinner from "./Spinner/Spinner";

const store = createStore(rootReducer, composeWithDevTools());
const Root = (props) => {
  useEffect(() => {
    console.log(props.isLoading);
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        props.setUser(user);
        props.history.push("/");
      } else {
        props.history.push("/login");
        props.clearUser();
      }
    });
  }, []);
  return props.isLoading ? (
    <Spinner />
  ) : (
    <Switch>
      <Route path='/' component={App} exact={true} />
      <Route path='/login' component={Login} />
      <Route path='/register' component={RegisterUser} />
    </Switch>
  );
};

const mapStateFromProps = (state) => ({
  isLoading: state.user.isLoading,
});

const ROOTWITHAUTH = withRouter(
  connect(mapStateFromProps, { setUser, clearUser })(Root)
);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <ROOTWITHAUTH />
    </Router>
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
