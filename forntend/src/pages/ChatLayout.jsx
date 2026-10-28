import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { Send, Phone, Video, Search, ChevronLeft, MoreVertical, CheckCheck } from 'lucide-react';

const socket = io.connect("http://localhost:4000");

const ChatLayout = () => {
    const { consultationId } = useParams(); // ID of the active chat
    const { token, userData, backendUrl } = useContext(AppContext);
    const navigate = useNavigate();
    
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [chatList, setChatList] = useState([]); // List of all consultations
    const [activeChat, setActiveChat] = useState(null);
    const scrollRef = useRef();

    // 1. Fetch all consultations to build the Sidebar
    const getChatList = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/consultations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                // Filter only completed or follow-up chats that aren't expired
                setChatList(data.consultations.reverse());
            }
        } catch (error) {
            console.error("Error fetching chat list");
        }
    };

    // 2. Load specific chat messages when consultationId changes
    useEffect(() => {
        if (token) getChatList();
        if (consultationId) {
            socket.emit("join_chat", consultationId);
            fetchMessages();
        }
    }, [consultationId, token]);

    const fetchMessages = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/messages/${consultationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(data.messages);
            setActiveChat(chatList.find(c => c._id === consultationId));
        } catch (err) { console.log("New conversation started"); }
    };

    // 3. Socket Listener
    useEffect(() => {
        socket.on("receive_message", (data) => {
            if (data.consultationId === consultationId) {
                setMessages((prev) => [...prev, data]);
            }
        });
        return () => socket.off("receive_message");
    }, [consultationId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const messageData = {
            consultationId,
            senderId: userData?._id,
            text: message,
            time: new Date().toISOString(),
        };

        socket.emit("send_message", messageData);
        setMessages((prev) => [...prev, messageData]); // Optimistic update
        setMessage("");

        await axios.post(`${backendUrl}/api/user/send-message`, messageData, {
            headers: { Authorization: `Bearer ${token}` }
        });
    };

    return (
        <div className='flex h-[85vh] bg-white border rounded-xl overflow-hidden shadow-lg mt-5'>
            
            {/* --- SIDEBAR: CHAT LIST --- */}
            <div className={`w-full md:w-1/3 border-r bg-gray-50 flex flex-col ${consultationId ? 'hidden md:flex' : 'flex'}`}>
                <div className='p-4 bg-white border-b flex justify-between items-center'>
                    <h1 className='text-xl font-bold text-gray-800'>Chats</h1>
                    <div className='flex gap-3 text-gray-500'>
                        <Search size={20} />
                        <MoreVertical size={20} />
                    </div>
                </div>

                <div className='overflow-y-auto flex-1'>
                    {chatList.map((item) => (
                        <div 
                            key={item._id} 
                            onClick={() => navigate(`/chat/${item._id}`)}
                            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 transition-all border-b ${consultationId === item._id ? 'bg-indigo-50 border-r-4 border-r-primary' : ''}`}
                        >
                            <img src={item.docData.image} className='w-12 h-12 rounded-full object-cover bg-indigo-100 border' alt="" />
                            <div className='flex-1 min-w-0'>
                                <div className='flex justify-between items-baseline'>
                                    <h3 className='font-bold text-gray-800 truncate'>{item.docData.name}</h3>
                                    <span className='text-[10px] text-gray-400'>{item.slotDate}</span>
                                </div>
                                <p className='text-xs text-gray-500 truncate mt-1'>Click to open consultation chat</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- MAIN: ACTIVE CHAT WINDOW --- */}
            <div className={`flex-1 flex flex-col bg-[#efeae2] ${!consultationId ? 'hidden md:flex justify-center items-center' : 'flex'}`}>
                {consultationId ? (
                    <>
                        {/* Chat Header */}
                        <div className='p-3 bg-white border-b flex items-center justify-between shadow-sm'>
                            <div className='flex items-center gap-3'>
                                <button onClick={() => navigate('/chat')} className='md:hidden text-gray-600'><ChevronLeft /></button>
                                <img src={activeChat?.docData?.image} className='w-10 h-10 rounded-full border' alt="" />
                                <div>
                                    <h2 className='text-sm font-bold'>{activeChat?.docData?.name || "Doctor"}</h2>
                                    <p className='text-[10px] text-green-600 font-medium'>Online</p>
                                </div>
                            </div>
                            <div className='flex gap-4 text-primary'>
                                <Video size={20} className='cursor-pointer' onClick={() => navigate(`/video-call/${consultationId}`)} />
                                <Phone size={19} className='cursor-pointer' />
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className='flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar'>
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.senderId === userData?._id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`relative px-4 py-2 rounded-lg max-w-[80%] text-sm shadow-sm ${
                                        msg.senderId === userData?._id 
                                        ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none' 
                                        : 'bg-white text-gray-800 rounded-tl-none'
                                    }`}>
                                        <p>{msg.text}</p>
                                        <div className='flex justify-end items-center gap-1 mt-1'>
                                            <span className='text-[9px] text-gray-500 uppercase'>{new Date(msg.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                            {msg.senderId === userData?._id && <CheckCheck size={12} className='text-blue-500' />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className='p-3 bg-white flex items-center gap-3 border-t'>
                            <input 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message"
                                className='flex-1 bg-gray-50 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
                            />
                            <button type="submit" className='p-2.5 bg-primary text-white rounded-full shadow-md hover:bg-indigo-700 transition-all'>
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className='text-center'>
                        <div className='bg-white p-6 rounded-full inline-block mb-4 shadow-sm text-primary'>
                            <MoreVertical size={40} />
                        </div>
                        <h2 className='text-gray-600 font-medium'>Select a consultation to start chatting</h2>
                        <p className='text-gray-400 text-sm'>Follow-up chat is available for 7 days after your visit.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatLayout;