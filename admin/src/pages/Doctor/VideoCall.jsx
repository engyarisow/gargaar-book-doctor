import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import axios from 'axios'; 

const VideoCall = () => {
    const { consultationId } = useParams();
    const navigate = useNavigate();
    
    const [callStatus, setCallStatus] = useState('Waiting for Patient...'); 
    const [seconds, setSeconds] = useState(0);
    
    const containerRef = useRef(null);
    const zpRef = useRef(null);

    // CRITICAL: Stable User ID - Halkan waxaan ka dhignay 'doc_' maadaama uu yahay Dhaqtarka
    const userID = useRef(`doc_${Math.floor(Math.random() * 10000)}`).current;

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (callStatus === 'Connected') {
            interval = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callStatus]);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // ZegoCloud Initialization Logic (React 18 Strict Mode Safe)
    useEffect(() => {
        const myContainer = containerRef.current;
        
        if (!myContainer || !consultationId) {
            console.error("Missing Container or Consultation ID");
            return;
        }

        let zpInstance = null;

        const startCall = async () => {
            try {
                // ====================================================
                // API CALL: DIIWAANGELINTA IN DHAQTARKU SOO GALAY
                // ====================================================
                try {
                    // Soo qabo Token-ka Dhaqtarka (Hubi in magacu yahay dToken)
                    const dToken = localStorage.getItem('dToken'); 

                    await axios.post('http://localhost:4000/api/doctor/join-call', 
                        { consultationId: consultationId },
                        { 
                            headers: { Authorization: `Bearer ${dToken}` } 
                        }
                    );
                    console.log('✅ Database-ka waa la socodsiiyay in Dhaqtarku soo galay');
                } catch (apiError) {
                    console.error("❌ Cillad API-ga join-call ah:", apiError);
                }
                // ====================================================

                const appID = 1750451805; 
                const serverSecret = "ad9371984958302c23cc34edc2dcfc91"; 
                
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    appID, serverSecret, consultationId,
                    userID, "Doctor"
                );

                zpInstance = ZegoUIKitPrebuilt.create(kitToken);
                zpRef.current = zpInstance;

                zpInstance.joinRoom({
                    container: myContainer,
                    scenario: { 
                        mode: ZegoUIKitPrebuilt.OneONoneCall 
                    },
                    showPreJoinView: false, 
                    turnOnMicrophoneWhenJoining: true,
                    turnOnCameraWhenJoining: true,
                    showUserList: false,
                    showTextChat: false,
                    showLayoutButton: false,
                    showScreenSharingButton: true, 
                    onUserJoin: () => setCallStatus('Connected'),
                    onUserLeave: () => {
                        setCallStatus('Waiting for Patient...');
                        setSeconds(0);
                    },
                    onLeaveRoom: () => navigate(-1),
                });
            } catch (error) {
                console.error("Zego Initialization Error:", error);
            }
        };

        startCall();

        // Cleanup Function 
        return () => {
            if (zpInstance) {
                zpInstance.destroy();
                zpInstance = null;
            }
        };
    }, [consultationId, navigate, userID]);

    return (
        <div className="fixed inset-0 bg-[#0b141a] z-[9999] overflow-hidden font-sans">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-[100] p-8 flex flex-col items-center bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${callStatus === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Doctor Side</span>
                </div>
                <h2 className="text-white text-lg font-medium">
                    {callStatus === 'Connected' ? formatTime(seconds) : callStatus}
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

            {/* Zego Container */}
            <div ref={containerRef} className="w-full h-full" />

            <style>{`
                /* Ensure only TWO screens exist: One full, one floating */
                div[class*="UserVideoContainer"]:first-child {
                    width: 100% !important; height: 100% !important;
                    position: absolute !important; top: 0 !important;
                    left: 0 !important; z-index: 1 !important;
                }
                div[class*="UserVideoContainer"]:last-child {
                    width: 110px !important; height: 160px !important;
                    position: absolute !important; top: 100px !important;
                    right: 20px !important; z-index: 50 !important;
                    border-radius: 12px !important; box-shadow: 0 8px 20px rgba(0,0,0,0.5) !important;
                    border: 2px solid rgba(255,255,255,0.1) !important;
                }
                div[class*="UserVideoContainer"]:nth-child(n+3) { display: none !important; }
                div[class^="ControlBar"] {
                    background: #202c33 !important; height: 70px !important;
                    border-radius: 40px !important; bottom: 30px !important;
                    padding: 0 20px !important; width: auto !important;
                    left: 50% !important; transform: translateX(-50%) !important;
                }
                video { object-fit: cover !important; }
                [class*="MemberName"], [class*="NameLabel"] { display: none !important; }
            `}</style>
        </div>
    );
};

export default VideoCall;