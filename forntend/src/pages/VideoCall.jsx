import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import axios from 'axios';

const UserVideoCall = () => {
    const { consultationId } = useParams();
    const navigate = useNavigate();
    
    const [callStatus, setCallStatus] = useState('Ringing...'); 
    const [seconds, setSeconds] = useState(0);
    
    const containerRef = useRef(null);

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (callStatus === 'Connected') {
            interval = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [callStatus]);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // ZegoCloud Initialization Logic
    useEffect(() => {
        const myContainer = containerRef.current;
        
        if (!myContainer || !consultationId) {
            console.error("Missing Container or Consultation ID");
            return;
        }

        let isMounted = true;
        let zpInstance = null;

        const startCall = async () => {
            try {
                // ====================================================
                // API CALL: DIIWAANGELINTA IN BUKAANKU SOO GALAY
                // ====================================================
                const token = localStorage.getItem('token'); 
                if (token) {
                    try {
                        await axios.post('http://localhost:4000/api/user/join-call', 
                            { consultationId: consultationId },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        console.log('✅ Database-ka waa la socodsiiyay in Bukaanku soo galay');
                    } catch (apiError) {
                        console.error("❌ Cillad API-ga join-call ah:", apiError);
                    }
                }

                // Guard ka dhanka ah haddii component-ku dhinto inta API-gu socdo
                if (!isMounted) return; 

                const appID = 1750451805; 
                const serverSecret = "ad9371984958302c23cc34edc2dcfc91"; 
                
                // CRITICAL FIX: Unique User ID mar kasta si looga fogaado collision-ka Server-ka Zego (Error 20021)
                const dynamicUserID = String(`pat_${Date.now()}_${Math.floor(Math.random() * 1000)}`);
                const roomIDStr = String(consultationId);
                
                // Generate Kit Token 
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    appID, 
                    serverSecret, 
                    roomIDStr, 
                    dynamicUserID, 
                    "Patient"
                );

                zpInstance = ZegoUIKitPrebuilt.create(kitToken);

                zpInstance.joinRoom({
                    container: myContainer,
                    scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
                    showPreJoinView: false, 
                    turnOnMicrophoneWhenJoining: true,
                    turnOnCameraWhenJoining: true,
                    showUserList: false,
                    showTextChat: false,
                    showLayoutButton: false,
                    showScreenSharingButton: false, 
                    onUserJoin: () => {
                        if (isMounted) setCallStatus('Connected');
                    },
                    onUserLeave: () => {
                        if (isMounted) {
                            setCallStatus('Ringing...');
                            setSeconds(0);
                        }
                    },
                    onLeaveRoom: () => {
                        if (isMounted) navigate(-1);
                    },
                });
            } catch (error) {
                console.error("Zego Initialization Error:", error);
            }
        };

        startCall();

        // Cleanup Function 
        return () => {
            isMounted = false;
            if (zpInstance) {
                zpInstance.destroy();
                zpInstance = null;
            }
            // CRITICAL FIX: Nadiifi HTML-ka si uusan u keenin 'joinRoom repeat !!'
            if (myContainer) {
                myContainer.innerHTML = '';
            }
        };
    }, [consultationId, navigate]);

    return (
        <div className="fixed inset-0 bg-[#0b141a] z-[9999] overflow-hidden font-sans">
            {/* WhatsApp Style Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-[100] p-8 flex flex-col items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${callStatus === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Secure Consultation</span>
                </div>
                <h2 className="text-white text-lg font-medium">
                    {callStatus === 'Connected' ? formatTime(seconds) : "Waiting for Doctor..."}
                </h2>
            </div>

            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                className="absolute left-6 top-10 z-[110] p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>

            {/* THE VIDEO ELEMENT */}
            <div ref={containerRef} className="w-full h-full" />

            <style>{`
                /* WhatsApp/Telegram Layout Logic */
                div[class*="UserVideoContainer"]:first-child {
                    width: 100% !important; height: 100% !important;
                    position: absolute !important; top: 0 !important;
                    left: 0 !important; z-index: 1 !important;
                }
                div[class*="UserVideoContainer"]:last-child {
                    width: 120px !important; height: 180px !important;
                    position: absolute !important; top: 100px !important;
                    right: 20px !important; z-index: 50 !important;
                    border-radius: 16px !important; box-shadow: 0 12px 30px rgba(0,0,0,0.5) !important;
                    border: 1px solid rgba(255,255,255,0.1) !important; overflow: hidden !important;
                }
                div[class^="ControlBar"] {
                    background: #1e2933 !important; height: 75px !important;
                    border-radius: 100px !important; bottom: 35px !important;
                    width: auto !important; padding: 0 25px !important;
                    left: 50% !important; transform: translateX(-50%) !important;
                    border: 1px solid rgba(255,255,255,0.05) !important;
                }
                video { object-fit: cover !important; }
                [class*="MemberName"], [class*="NameLabel"] { display: none !important; }
            `}</style>
        </div>
    );
};

export default UserVideoCall;