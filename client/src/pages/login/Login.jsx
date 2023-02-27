import { useContext, useRef } from "react";
import CryptoJS from 'crypto-js';
import "./login.css";
import { loginCall } from "../../apiCalls";
import { useHistory } from "react-router";
import { AuthContext } from "../../context/AuthContext";
import { CircularProgress } from "@material-ui/core";

export default function Login() {
  const email = useRef();
  const password = useRef();
  const { isFetching, dispatch } = useContext(AuthContext);
  const history = useHistory();

  const handleClick = (e) => {
    e.preventDefault();
    let ciphertext = CryptoJS.AES.encrypt(JSON.stringify({ email: email.current.value, password: password.current.value }), 'secret key 123').toString()
    loginCall(
      { ciphertext },
      dispatch
    );
  };

  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginRight">
          <div className="text-center">
            <h3>
              Chat App Login
            </h3>
          </div>
          <form className="loginBox" onSubmit={handleClick}>
            <input
              placeholder="Email"
              type="email"
              required
              className="loginInput"
              ref={email}
            />
            <input
              placeholder="Password"
              type="password"
              required
              minLength="6"
              className="loginInput"
              ref={password}
            />
            <button className="loginButton" type="submit" disabled={isFetching}>
              {isFetching ? (
                <CircularProgress color="white" size="20px" />
              ) : (
                "Log In"
              )}
            </button>
            <button className="loginRegisterButton" onClick={() => { history.push("/register"); }}>
              {isFetching ? (
                <CircularProgress color="white" size="20px" />
              ) : (
                "Create a New Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
