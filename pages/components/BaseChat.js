import React, { useEffect, useState, useRef } from "react";
import styles from "../../styles/Home.module.css";
import io from "socket.io-client";
import { database1 } from "@/lib/firebase";
import { ref, onValue, push, get, set, update } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import typingGif from "../../22.gif";
import Image from "next/image";

const socket = io("http://localhost:3001");
if (socket.connected) {
  socket.disconnect();
}
if (!socket.connected) {
  socket.connect();
}

const BaseChat = (props) => {
  const {
    setPopup,
    onContextMenu,
    setReplyItem,
    replyItem,
    messages,
    setMessages,
    setDeleteMsg,
    deleteMsg,
    setEditMsg,
    editMsg,
  } = props;
  const [inputValue, setInputValue] = useState("");
  const [lastMessage, setLastMessage] = useState([]);
  const [lastSentMessage, setLastSentMessage] = useState([]);
  const [formattedMessagess, setFormattedMessages] = useState([]);
  const [inputHeight, setInputHeight] = useState("30px");
  const messageListRef = useRef(null);
  const [members, setMembers] = useState([]);
  const [typing, setTyping] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState(false);

  useEffect(() => {
    //request to delete message to socket
    if (deleteMsg != "") {
      socket.emit("delete msg", deleteMsg);
      setDeleteMsg("");
    }
  }, [deleteMsg]);

  useEffect(() => {
    //request to delete message to socket
    if (editMsg != "") {
      setInputValue(messages.find((message) => message.id === editMsg)?.text);
    }
  }, [editMsg]);

  useEffect(() => {
    //show edited messages
    const editMsgHandle = async (msgid, msg) => {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((message) => {
          if (message.id === msgid) {
            return { ...message, text: msg };
          }
          return message;
        });

        return updatedMessages;
      });
      const messageRef = ref(
        database1,
        `groups/${props.tempRoom}/messages/${msgid}`
      );
      await update(messageRef, {
        text: msg,
      });
    };
    socket.on("edit msg", editMsgHandle);
    return () => {
      socket.off("edit msg", editMsgHandle);
    };
  }, []);

  useEffect(() => {
    //show deleted messages
    const deleteMsgHandle = async (msgid) => {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((message) => {
          if (message.id === msgid) {
            return { ...message, text: "Deleted/n" };
          }
          return message;
        });

        return updatedMessages;
      });
      const messageRef = ref(
        database1,
        `groups/${props.tempRoom}/messages/${msgid}`
      );
      await update(messageRef, {
        text: "Deleted/n",
      });
    };
    socket.on("delete msg", deleteMsgHandle);
    return () => {
      socket.off("delete msg", deleteMsgHandle);
    };
  }, []);

  useEffect(() => {
    // display incoming messages
    const messageHandler = (msg, time, sender, messageId, reply) => {
      setMessages((prevMessages) => {
        const updatedMessages = [
          ...prevMessages,
          {
            id: messageId,
            text: msg,
            timestamp: time,
            sender: sender,
            reply: reply,
          },
        ];
        console.log(updatedMessages, "messages recieved from socket");
        return updatedMessages;
      });
    };
    socket.on("chat message", messageHandler);
    return () => {
      socket.off("chat message", messageHandler);
    };
  }, []);

  useEffect(() => {
    //display timing members
    const handleTypingUsers = (users) => {
      console.log(users);
    };
    socket.on("typing", handleTypingUsers);
    return () => {
      socket.off("typing", handleTypingUsers);
    };
  }, []);

  useEffect(() => {
    //format messages according to date
    const formatted = formatMessages(messages);
    setFormattedMessages(formatted);
    console.log(formattedMessagess);
  }, [messages]);

  useEffect(() => {
    //scroll to bottom
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [formattedMessagess]);

  useEffect(() => {
    if (props.username !== "") {
      const joinRoom = () => {
        if (!joinedRoom) {
          setJoinedRoom(true); // Mark room as joined
          socket.disconnect();
          socket.disconnect();

          socket.connect();
          socket.emit("join room", props.tempRoom, props.userId);
          const messagesRef = ref(
            database1,
            `groups/${props.tempRoom}/messages`
          );
          get(messagesRef).then((snapshot) => {
            const data = snapshot.val();
            const messages = data
              ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
              : [];
            setMessages(messages);
            setFormattedMessages(formatMessages(messages));
            console.log(messages, "by firebase");
          });
        }
      };

      if (socket.connected) {
        joinRoom();
      } else {
        socket.on("connect", joinRoom);
      }

      return () => {
        socket.off("connect", joinRoom);
      };
    }
  }, [props.username, joinedRoom]);

  useEffect(() => {
    if (props.groupName && props.tempRoomPSWD && props.username == "") {
      setPopup("enterUsername");
    }
  }, [props.groupName, props.tempRoomPSWD, setPopup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() == ''){
      return;
    }
    if (editMsg != "") {
      socket.emit("edit msg", editMsg, inputValue);
      setInputValue("");
      setEditMsg("");
      return;
    }
    
    if (
      inputValue &&
      (!lastSentMessage ||
        inputValue !== lastSentMessage.msg ||
        Date.now() - lastSentMessage.time > 1000)
    ) {
      const time = new Date().toISOString();
      const reply = Object.keys(replyItem).length > 0 ? replyItem.id : "";
      const messagesRef = ref(database1, `groups/${props.tempRoom}/messages/`);
      setInputValue("");
      setEditMsg('');
      setReplyItem('')
      const newMessageRef = push(messagesRef);
      const messageId = newMessageRef.key;

      // Update the database with the new message
      const messageData = {
        text: inputValue,
        timestamp: time,
        sender: props.userId,
      };

      // Check if reply exists and is not undefined
      if (reply !== undefined && reply != "") {
        messageData.reply = reply;
      }

      // Update the database with the new message data
      await set(newMessageRef, messageData);

      socket.emit(
        "chat message",
        inputValue,
        time,
        props.userId,
        reply,
        messageId
      );

      setLastSentMessage({
        msg: inputValue,
        time: Date.now(),
        sender: props.userId,
      });
    }
  };

  const formatMessages = (messages) => {
    const formattedMessages = messages.reduce((acc, msg) => {
      const currentDate = new Date(msg.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      let groupDate = "Other";
      if (currentDate.toDateString() === today.toDateString()) {
        groupDate = "Today";
      } else if (currentDate.toDateString() === yesterday.toDateString()) {
        groupDate = "Yesterday";
      } else {
        groupDate = `${currentDate.getDate()} ${currentDate.toLocaleString(
          "en-US",
          { month: "long" }
        )}`;
      }

      if (!acc[groupDate]) {
        acc[groupDate] = [];
      }
      acc[groupDate].push(msg);
      return acc;
    }, {});

    const formattedArray = Object.keys(formattedMessages).map((date) => ({
      date,
      messages: formattedMessages[date],
    }));

    return formattedArray;
  };

  useEffect(() => {
    const membersRef = ref(database1, `groups/${props.tempRoom}/members`);

    const unsubscribe = onValue(membersRef, (snapshot) => {
      const data = snapshot.val();
      const membersList = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setMembers(membersList);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [props.tempRoom]);
  let typingTimer;

  function setMeTyping(e) {
    setInputHeight("30px");
    setInputHeight(`${e.target.scrollHeight + 20}px`);
    clearTimeout(typingTimer); // Clear the previous timer

    const username = localStorage.getItem("currentName");
    // setUserTypingStatus(username, true); // Set typing status

    setTyping((prevUsers) => {
      // Check if the user is already in the typing list to avoid duplicates
      const userExists = prevUsers.some((user) => user.id === props.userId);
      if (!userExists) {
        const updatedUsers = [
          ...prevUsers,
          { id: props.userId, name: props.username },
        ];
        return updatedUsers;
      }
      return prevUsers;
    });

    // Set timer to clear typing status after 2 seconds
    typingTimer = setTimeout(function () {
      setTyping((prevUsers) => {
        const updatedUsers = prevUsers.filter(
          (user) => user.id !== props.userId
        );
        return updatedUsers;
      });
    }, 2000); // Adjust the timeout duration as needed
  }

  useEffect(() => {
    socket.emit("typing", typing);
  }, [typing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.ctrlKey) {
        // Ctrl+Enter pressed
        e.preventDefault();
        event.preventDefault();
      const { selectionStart, selectionEnd } = event.target;
      const newValue = `${inputValue.substring(0, selectionStart)}\n${inputValue.substring(selectionEnd)}`;
      setInputValue(newValue);
      } else {
        // Enter pressed
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  function formatLastSeen(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
      date.toDateString() ===
      new Date(now.setDate(now.getDate() - 1)).toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  }

  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set height to scroll height
    }
  }, [inputValue]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.left}>
        <div className={styles.header}>
          <h1 className={styles.groupNameHeader}>{props.groupName}</h1>
          <button
            id="share-link-button"
            className="material-symbols-outlined"
            style={{
              padding: 10,
              fontSize: 23,
              background: "transparent",
              marginLeft: "auto",
            }}
          >
            <ion-icon name="share-social-outline" />
          </button>
          {/* <button id="export-chat-button">Export chat</button> */}
          <button
            onclick="exitGroup();"
            className="material-symbols-outlined"
            style={{ padding: 10, background: "transparent", fontSize: 24 }}
          >
            <ion-icon name="log-out-outline" />
          </button>
        </div>
        <h3>Members</h3>
        <div className={styles.members}>
          {members.map((member) => (
            <div key={member.id}>
              <p>
                Name: {member.username} {props.userId == member.id && "( You )"}
              </p>
              <p style={{ fontSize: "12px" }}>ID: {member.id}</p>
              <p>
  Status: {member.status == "online" ? member.status : member.status == "offline" ? member.status : formatLastSeen(member.status)}
</p>

            </div>
          ))}
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.groupHeader}>
          <input
            type="text"
            placeholder="Search..."
            oninput="searchMessagesInDiv(this.value);"
          />
          <div className={styles.sponsor}>
            <p>In a Database by</p>
            <p>Ajinx</p>
          </div>
        </div>
        <div className={styles.messages} ref={messageListRef}>
          {formattedMessagess.map((group, index) => (
            <div key={index} className={styles.dateGroup}>
              <h3>{group.date}</h3>
              {group.messages.map((msg, idx) => {
                const isSameSenderAsPrevious =
                  idx > 0 && group.messages[idx - 1].sender === msg.sender;

                let firstMessageIndex = idx;
                let lastMessageIndex = idx;
                for (let i = idx; i < group.messages.length; i++) {
                  if (group.messages[i].sender === msg.sender) {
                    lastMessageIndex = i;
                  } else {
                    break;
                  }
                }

                const firstTimestamp = new Date(
                  group.messages[firstMessageIndex].timestamp
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const lastTimestamp = new Date(
                  group.messages[lastMessageIndex].timestamp
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const renderMessageText = (text) => {
                  return text.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ));
                };

                return (
                  <div
                    onContextMenu={(e) => onContextMenu(e, msg.id)}
                    key={idx}
                    className={`${styles.message} ${
                      isSameSenderAsPrevious ? styles.contentOnly : ""
                    } ${msg.sender === props.userId ? styles.mine : ""}`}
                  >
                    {!isSameSenderAsPrevious && (
                      <div className={styles.messageHeader}>
                        <span>
                          {
                            members.find((member) => member.id === msg.sender)
                              ?.username
                          }
                        </span>
                        <span>
                          {firstTimestamp}
                          {group.messages[firstMessageIndex].timestamp !==
                            group.messages[lastMessageIndex].timestamp &&
                            ` - ${lastTimestamp}`}
                        </span>
                      </div>
                    )}

                    <div className={styles.messageContentBox}>
                      {msg.text === "Deleted/n" ? (
                        <p style={{ color: "#df3057" }}>
                          This message was deleted
                        </p>
                      ) : (
                        <>
                          {msg.reply && (
                            <div className={styles.replyItem}>
                              <div className={styles.line} />
                              <div className={styles.group}>
                                {(() => {
                                  const replymsg = messages.find(
                                    (message) => message.id === msg.reply
                                  );
                                  if (replymsg) {
                                    const replySender = members.find(
                                      (member) => member.id === replymsg.sender
                                    );
                                    return (
                                      <React.Fragment>
                                        <p>
                                          {replySender?.username}{" "}
                                          <span>
                                            {new Date(
                                              replymsg.timestamp
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </p>
                                        <b>{replymsg.text}</b>
                                      </React.Fragment>
                                    );
                                  }
                                  return null; // Return null if no reply message is found
                                })()}
                              </div>
                            </div>
                          )}
                          <p> {renderMessageText(msg.text)}</p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {typing.length != 0 && (
          <div className={styles.typingShow}>
            {typing.map((user) => (
              <li key={user.id}>{user.name} is typing...</li>
            ))}
          </div>
        )}
        <div className={styles.inputPanel}>
          {Object.keys(replyItem).length > 0 && (
            <div className={styles.replyShow}>
              <span
                className="material-symbols-outlined"
                onClick={() => setReplyItem([])}
              >
                <ion-icon name="close-outline" />
              </span>
              <div className={styles.line} />
              <div className={styles.group}>
                <p>
                  {
                    members.find((member) => member.id === replyItem.sender)
                      ?.username
                  }{" "}
                  <span>
                    {new Date(replyItem.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
                <b>{replyItem.text}</b>
              </div>
            </div>
          )}
          {editMsg && <div onClick={() => {
  setEditMsg('');
  setInputValue('');
}} className={styles.editShow}>
            <ion-icon name="pencil-sharp"></ion-icon>
            Edit
          </div>}
          <textarea
            type="text"
            ref={textareaRef}
            className={styles.messageInput}
            placeholder="Type your message..."
            style={{ maxHeight: 160, height: 50 }}
            value={inputValue} // Use controlled input value
            onChange={(e) => {
              setInputValue(e.target.value);
              setMeTyping(e);
            }}
            onKeyDown={(event) => handleKeyDown(event)}
          />

          <div className={styles.inputs}>
            <button
              className={styles.materialSymbolsOutlined}
              onclick="document.getElementById('fileInput').click();"
            >
              <ion-icon name="attach-outline"></ion-icon>
            </button>
            <button onClick={(e)=>handleSubmit(e)}>
              {editMsg ? 'Edit' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseChat;
