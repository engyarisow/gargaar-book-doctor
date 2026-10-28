import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";

const Posts = () => {
  const {
    posts,
    getPublicPosts,
    likePost,
    addComment,
    editComment,
    deleteComment,
    likeComment,
    recordView, // Updated from addView to match AppContext
    userData,
  } = useContext(AppContext);

  const [search, setSearch] = useState("");
  const [expandedPosts, setExpandedPosts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [zoomImg, setZoomImg] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    getPublicPosts();
  }, [getPublicPosts]);

  const handleInputChange = (postId, value) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const submitComment = (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    addComment(postId, text.trim());
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title?.toLowerCase().includes(search.toLowerCase()) ||
      post.doctorId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 px-4 flex flex-col items-center font-sans text-slate-900">
      
      {/* --- IMAGE MODAL (ZOOM) --- */}
      {zoomImg && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 transition-all"
          onClick={() => setZoomImg(null)}
        >
          <img src={zoomImg} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl ring-1 ring-white/20" alt="Zoomed" />
        </div>
      )}

      {/* MODERN SEARCH */}
      <div className="w-full max-w-2xl mb-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for medical insights..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 px-14 rounded-3xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-lg"
          />
          <span className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30 text-xl">🔍</span>
        </div>
      </div>

      <div className="w-full max-w-xl space-y-8">
        {filteredPosts.map((post) => {
          const isLikedByMe = post.likes?.some(l => (l._id || l) === userData?._id);
          
          // Logic: Priority to viewers array length, fallback to views number
          const viewCount = post.viewers ? post.viewers.length : (post.views || 0);

          return (
            <div key={post._id} className="bg-white rounded-[32px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 overflow-hidden hover:translate-y-[-4px] transition-all duration-300">
              
              {/* HEADER */}
              <div className="flex items-center p-6 gap-4">
                <img
                  src={post.doctorId?.image}
                  className="w-14 h-14 rounded-2xl object-cover shadow-sm ring-4 ring-slate-50"
                  alt="Doctor"
                />
                <div className="flex-1">
                  <p className="font-extrabold text-slate-800 text-base tracking-tight">{post.doctorId?.name}</p>
                  <p className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">
                    {new Date(post.createdAt).toDateString()}
                  </p>
                </div>
              </div>

              {/* CONTENT */}
              <div className="px-6 pb-4">
                <h3 className="font-bold text-slate-900 text-xl mb-3 leading-snug">{post.title}</h3>
                <div className="text-slate-600 leading-relaxed text-[15px]">
                  {expandedPosts[post._id] ? post.content : post.content?.slice(0, 140)}
                  {!expandedPosts[post._id] && post.content?.length > 140 && (
                    <button 
                      onClick={() => {
                        setExpandedPosts(p => ({...p, [post._id]: true}));
                        recordView(post._id); // Record view on expansion
                      }} 
                      className="text-blue-600 font-bold ml-1 hover:text-blue-700"
                    >
                      Read more
                    </button>
                  )}
                </div>
              </div>

              {/* MEDIA */}
              {post.mediaUrl && (
                <div className="px-4 pb-4">
                  <img
                    src={post.mediaUrl}
                    onClick={() => {
                      setZoomImg(post.mediaUrl);
                      recordView(post._id); // Record view on image click
                    }}
                    className="w-full h-72 object-cover rounded-[24px] cursor-zoom-in hover:opacity-95 transition-opacity"
                    alt="Clinical view"
                  />
                </div>
              )}

              {/* STATS & ACTIONS */}
              <div className="px-6 py-4 bg-slate-50/50 flex justify-between items-center border-t border-slate-50">
                <div className="flex gap-6 items-center">
                  <button onClick={() => likePost(post._id)} className="flex items-center gap-2 group">
                    <span className={`text-2xl transition-transform group-hover:scale-125 ${isLikedByMe ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'grayscale opacity-40'}`}>
                      {isLikedByMe ? '💙' : '🤍'}
                    </span>
                    <span className={`font-bold text-sm ${isLikedByMe ? 'text-blue-600' : 'text-slate-400'}`}>
                      {post.likes?.length || 0}
                    </span>
                  </button>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <span className="text-xl">👁️</span> {viewCount}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    recordView(post._id); // Record view when comments toggle
                    setShowComments(prev => ({ ...prev, [post._id]: !prev[post._id] }));
                  }}
                  className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  {post.comments?.length || 0} COMMENTS
                </button>
              </div>

              {/* --- ADVANCED COMMENT SECTION --- */}
              {showComments[post._id] && (
                <div className="px-6 pb-6 pt-4 space-y-4 border-t border-slate-50">
                  <div className="max-h-60 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {post.comments?.map((c) => {
                      const isLikedByMeComment = c.likes?.some(l => (l._id || l) === userData?._id);
                      
                      return (
                        <div key={c._id} className="flex gap-3 group">
                          <img src={c.userId?.image} className="w-8 h-8 rounded-full shadow-sm" alt="" />
                          <div className="flex-1">
                            <div className="relative bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                              <div className="flex justify-between items-start">
                                <p className="text-xs font-black text-slate-800 mb-0.5">{c.userId?.name}</p>
                                
                                {c.userId?._id === userData?._id && (
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => {
                                        const newText = prompt("Edit your comment:", c.comment);
                                        if (newText) editComment(post._id, c._id, newText);
                                      }}
                                      className="text-[10px] text-blue-500 font-bold hover:underline"
                                    >
                                      EDIT
                                    </button>
                                    <button 
                                      onClick={() => deleteComment(post._id, c._id)}
                                      className="text-[10px] text-red-400 font-bold hover:underline"
                                    >
                                      DELETE
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-slate-600">{c.comment}</p>
                              
                              {c.likes?.length > 0 && (
                                <div className="absolute -right-2 -bottom-1 bg-white shadow-sm border rounded-full px-1.5 flex items-center gap-0.5 scale-90">
                                  <span className="text-[10px]">💙</span>
                                  <span className="text-[10px] text-slate-600 font-bold">{c.likes.length}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-4 mt-1 ml-2">
                              <button 
                                onClick={() => likeComment(post._id, c._id)}
                                className={`text-[10px] font-black uppercase tracking-tight transition-colors ${isLikedByMeComment ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                {isLikedByMeComment ? 'Liked' : 'Like'}
                              </button>
                              <span className="text-[10px] font-bold text-slate-300 uppercase">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 items-center pt-2">
                    <img src={userData?.image} className="w-9 h-9 rounded-xl border-2 border-white shadow-md" alt="Me" />
                    <form 
                      className="flex-1 relative flex items-center" 
                      onSubmit={(e) => submitComment(e, post._id)}
                    >
                      <input
                        id={`input-${post._id}`}
                        value={commentInputs[post._id] || ""}
                        onChange={(e) => handleInputChange(post._id, e.target.value)}
                        placeholder="Write a specialized response..."
                        className="w-full bg-slate-100/80 border-none rounded-2xl py-3 px-5 pr-14 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                      />
                      
                      <button 
                        type="submit"
                        disabled={!commentInputs[post._id]?.trim()}
                        className={`absolute right-2 p-2 rounded-xl transition-all duration-300 ${
                          commentInputs[post._id]?.trim() 
                          ? "bg-blue-600 text-white scale-100 shadow-lg shadow-blue-200" 
                          : "bg-slate-200 text-slate-400 scale-90 opacity-0 pointer-events-none"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Posts;