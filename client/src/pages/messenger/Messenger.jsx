import "./messenger.css";
import Topbar from "../../components/topbar/Topbar";
import Message from "../../components/message/Message";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";
import Alert from 'react-bootstrap/Alert';


export default function Messenger() {
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [adminId, setAdminId] = useState('');

  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [convStarter, setConvStarter] = useState('');


  const socket = useRef();
  const { user } = useContext(AuthContext);
  const scrollRef = useRef();


  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });

    allUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    socket.current.emit("addUser", user._id);
  }, [user]);


  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get("/messages/" + currentChat?._id);
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  useEffect(() => {
    const getData = setTimeout(async () => {
      let url = `/users/list?userId=${user._id}&username=${searchUser}`
      const res = await axios.get(url);
      if (res.data && res.data.length) {
        let filteredUsers = res.data.filter((item) => {
          if (!item.isAdmin)
            return (item)
        })
        let adminUser = res.data.filter((item) => {
          if (item.isAdmin)
            return (item)
        })
        if (adminUser && adminUser.length) {
          setAdminId(adminUser[0]._id)
        }
        setUsers(filteredUsers)
      }
    }, 2000)

    return () => clearTimeout(getData)
  }, [searchUser])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find(
      (member) => member !== user._id
    );

    socket.current.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post("/messages", message);
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  const getConversations = async (_id) => {
    try {
      const res = await axios.get("/conversations/get/" + user._id + '/' + _id);
      if (res.data.starter === user._id) {
        setConvStarter('You')
      }
      else {
        let filteredUsers = users.filter((item) => {
          if (item._id === res.data.starter) {
            return (item)
          }
        })
        if (filteredUsers && filteredUsers.length) {
          setConvStarter(filteredUsers[0].username)
        }
      }
      setCurrentChat(res.data)
    } catch (err) {
      console.log(err);
    }
  }


  const allUsers = async (username) => {
    try {
      let url = `/users/list?userId=${user._id}`
      if (username) {
        url += `&username=${username}`
      }
      const res = await axios.get(url);
      if (res.data && res.data.length) {
        let filteredUsers = res.data.filter((item) => {
          if (!item.isAdmin)
            return (item)
        })
        let adminUser = res.data.filter((item) => {
          if (item.isAdmin)
            return (item)
        })
        if (adminUser && adminUser.length) {
          setAdminId(adminUser[0]._id)
        }
        setUsers(filteredUsers)
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  return (
    <>
      <Topbar />
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <div>
              <h3>Users: </h3>
            </div>
            <div>
              <div>
                <input type="text" className="form-control" placeholder="Type to search user" value={searchUser} onChange={(e) => { setSearchUser(e.target.value) }} />
              </div>
            </div>
            {
              users.map((item, index) => {
                return (
                  <div key={index} onClick={() => { getConversations(item._id); }}>
                    <div className="conversation">
                      <span className="conversationName">{item.username}</span>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentChat ? (
              <>
                <div className="chatBoxTop">
                  {
                    convStarter ?
                      <div>
                        <Alert key={'info'} variant={'info'}>
                          {convStarter} started this conversation.
                        </Alert>
                      </div> : ''
                  }
                  {messages.map((m) => (
                    <div ref={scrollRef}>
                      <Message message={m} own={m.sender === user._id} adminMsg={m.sender === adminId} />
                    </div>
                  ))}
                </div>
                <div className="chatBoxBottom">
                  <textarea
                    className="chatMessageInput"
                    placeholder="write something..."
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></textarea>
                  <button className="chatSubmitButton" onClick={handleSubmit}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                Open a conversation to start a chat.
              </span>
            )}
          </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
          </div>
        </div>
      </div>
    </>
  );
}
