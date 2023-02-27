import "./messenger.css";
import Topbar from "../../components/topbar/Topbar";
import Message from "../../components/message/Message";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";

export default function AdminMessenger() {
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [firstUserName, setFirstUserName] = useState({});
    const [secondUserName, setSecondUserName] = useState({});
    const [newMessage, setNewMessage] = useState("");
    const [arrivalMessage, setArrivalMessage] = useState(null);

    const [users, setUsers] = useState([]);


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
        const listConv = async () => {
            try {
                const res = await axios.get(`/conversations/list/${user._id}`);
                if (res.data && res.data.length) {
                    setUsers(res.data)
                }
            } catch (err) {
                console.log(err);
            }
        };
        listConv();
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

    const getConversations = async (firstId, secondId) => {
        try {
            const res = await axios.get("/conversations/get/" + firstId + '/' + secondId);
            setCurrentChat(res.data)
        } catch (err) {
            console.log(err);
        }
    }

    const onConvClick = (item) => {
        getConversations(item.firstUserId, item.secondUserId);
        setFirstUserName({ name: item.firstUser, _id: item.firstUserId });
        setSecondUserName({ name: item.secondUser, _id: item.secondUserId });
    }

    const getSenderName = (senderId) => {
        if (firstUserName._id === senderId) {
            return firstUserName.name
        }
        else if (secondUserName._id === senderId) {
            return secondUserName.name
        }
    }

    const delConv = async (id) => {
        try {
            const res = await axios.delete(`/conversations/delete/${id}`);
            if (res.data.success) {
                let newUsers = users.filter((item) => {
                    if (item._id !== id) {
                        return item
                    }
                })
                setUsers(newUsers)
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
            <Topbar adminCheck={true} />
            <div className="messenger">
                <div className="chatMenu">
                    <div className="chatMenuWrapper">
                        <div>
                            <h3>Conversations: </h3>
                        </div>
                        {
                            users.map((item, index) => {
                                return (
                                    <div key={index} >
                                        <div className="conversation auto d-flex justify-content-between">
                                            <div className="pointer" onClick={() => { onConvClick(item); }}>
                                                <span className="conversationName">{item.firstUser} & {item.secondUser}</span>
                                            </div>
                                            <div>
                                                <span><button type="button" class="btn btn-danger" onClick={() => { delConv(item._id); }} >Delete</button></span>
                                            </div>
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
                                    {messages.map((m) => {
                                        let name = getSenderName(m.sender);
                                        return (
                                            <div ref={scrollRef}>
                                                <Message message={m} own={m.sender === user._id} senderName={name} />
                                            </div>
                                        )
                                    })}
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
                    <div className="chatOnlineWrapper"></div>
                </div>
            </div>
        </>
    );
}
