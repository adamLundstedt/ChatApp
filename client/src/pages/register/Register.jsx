import axios from "axios";
import { useRef, useState } from "react";
import CryptoJS from 'crypto-js';
import "./register.css";
import { useHistory } from "react-router";
import { isStrongPassword } from 'validator';

export default function Register() {
  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();
  const history = useHistory();
  const [passwordAlert, setPasswordAlert] = useState('');

  const handleClick = async (e) => {
    e.preventDefault();
    if (passwordAgain.current.value !== password.current.value) {
      passwordAgain.current.setCustomValidity("Passwords don't match!");
    } else {
      if (isStrongPassword(password.current.value)) {
        const user = {
          username: username.current.value,
          email: email.current.value,
          password: password.current.value,
        };
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(user), 'secret key 123').toString()
        try {
          await axios.post("/auth/register", { ciphertext });
          history.push("/login");
        } catch (err) {
          console.log(err);
        }
      }
      else {
        setPasswordAlert('Min one uppercase, lowercase, number & symbol. Min lenght: 8.')
      }
    }
  };



  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginRight">
          <div className="text-center">
            <h3>
              Chat App Sign Up
            </h3>
          </div>
          <form className="loginBox" onSubmit={handleClick}>
            <input
              placeholder="Username"
              required
              ref={username}
              className="loginInput"
            />
            <input
              placeholder="Email"
              required
              ref={email}
              className="loginInput"
              type="email"
            />
            <input
              placeholder="Password"
              required
              ref={password}
              className="loginInput"
              type="password"
              minLength="6"
            />
            <input
              placeholder="Password Again"
              required
              ref={passwordAgain}
              className="loginInput"
              type="password"
            />
            {
              passwordAlert ?
                <div className="p-1 text-danger">
                  {passwordAlert}
                </div>
                : ''
            }
            <button className="loginButton" type="submit">
              Sign Up
            </button>
            <button className="loginRegisterButton" onClick={() => { history.push("/login"); }}>Log into Account</button>
          </form>
        </div>
      </div>
    </div>
  );
}
