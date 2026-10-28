import React, { useState, useEffect, useContext } from "react";
import { DoctorContext } from "../../context/DoctorContext";

const DoctorPost = () => {
  const { 
    getDoctorPosts, 
    updateDoctorPost, 
    deleteDoctorPost, 
    addComment,
    docData 
  } = useContext(DoctorContext);

  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editImage, setEditImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    const data = await getDoctorPosts();
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    const closeMenu = () => setActiveMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleCommentChange = (postId, value) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const submitComment = async (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    await addComment(postId, text.trim());
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    fetchPosts();
  };

  const startEdit = (post) => {
    setEditingPostId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
    // Backend uses 'public'/'private'. We convert to boolean for the toggle state.
    setEditIsPublic(post.visibility === "public");
    setActiveMenuId(null);
  };

  const saveEdit = async (postId) => {
    setLoading(true);
    
    // CRITICAL FIX: The key must be 'isPublic' to match your backend req.body
    const updateData = { 
      title: editTitle, 
      content: editContent, 
      isPublic: editIsPublic // Backend will convert this to "public" or "private"
    };

    await updateDoctorPost(postId, updateData, editImage);
    await fetchPosts();
    setEditingPostId(null);
    setLoading(false);
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Ma hubtaa inaad tirtirto post-kan?")) {
      await deleteDoctorPost(postId);
      await fetchPosts();
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 px-4 flex flex-col items-center font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="w-full max-w-2xl mb-10 flex justify-between items-end px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Insights</h2>
          <p className="text-slate-500 font-medium">Manage and engage with your patients.</p>
        </div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl font-bold text-sm shadow-lg shadow-blue-200">
          {posts.length} Posts
        </div>
      </div>

      <div className="w-full max-w-xl space-y-8">
        {posts.map((post) => (
          <div key={post._id} className="bg-white rounded-[32px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 overflow-hidden hover:translate-y-[-4px] transition-all duration-300">
            
            {/* POST HEADER */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <img
                  src={post.doctorId?.image || docData?.image}
                  className="w-14 h-14 rounded-2xl object-cover shadow-sm ring-4 ring-slate-50"
                  alt="Doctor"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-slate-800 text-base tracking-tight">
                      {post.doctorId?.name || docData?.name}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${post.visibility === 'public' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                      {post.visibility}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">
                    {new Date(post.createdAt).toDateString()}
                  </p>
                </div>
              </div>

              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === post._id ? null : post._id); }}
                  className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 flex items-center justify-center text-xl transition-all"
                >
                  •••
                </button>
                {activeMenuId === post._id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 animate-in fade-in zoom-in duration-200">
                    <button onClick={() => startEdit(post)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl text-slate-700 font-bold text-xs transition-colors">
                      <span className="text-blue-500 font-bold">📝 EDIT POST</span>
                    </button>
                    <button onClick={() => handleDelete(post._id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl text-red-500 font-bold text-xs transition-colors">
                      <span className="font-bold">🗑️ DELETE POST</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="px-6 pb-4">
              {editingPostId === post._id ? (
                /* EDIT MODE */
                <div className="space-y-4 bg-slate-50 p-6 rounded-[25px] border border-slate-200">
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="Title" />
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} className="w-full p-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Content" />
                  
                  {/* VISIBILITY TOGGLE */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-bold text-slate-600 ml-1">
                      {editIsPublic ? "🌍 Public" : "🔒 Private"}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setEditIsPublic(!editIsPublic)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editIsPublic ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <span className={`${editIsPublic ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(post._id)} className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md">
                      {loading ? "Updating..." : "Update"}
                    </button>
                    <button onClick={() => setEditingPostId(null)} className="bg-white text-slate-500 px-6 py-2 rounded-xl font-bold text-sm border">Cancel</button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <>
                  <h3 className="font-bold text-slate-900 text-xl mb-3 leading-snug">{post.title}</h3>
                  <div className="text-slate-600 leading-relaxed text-[15px] mb-4">
                    {post.content}
                  </div>
                  
                  {post.mediaUrl && (
                    <div className="pb-4">
                      <img src={post.mediaUrl} alt="Clinical" className="w-full h-72 object-cover rounded-[24px]" />
                    </div>
                  )}

                  {/* ACTION BAR */}
                  <div className="py-4 flex justify-between items-center border-t border-slate-50">
                    <div className="flex gap-6 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl opacity-40">💙</span>
                        <span className="font-bold text-sm text-slate-400">{post.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                        <span className="text-xl">👁️</span> {post.viewsCount || 0}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setShowComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                      className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                    >
                      {post.comments?.length || 0} COMMENTS
                    </button>
                  </div>

                  {/* COMMENTS */}
                  {showComments[post._id] && (
                    <div className="mt-4 space-y-4 border-t border-slate-50 pt-4">
                      <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                        {post.comments?.map((c) => (
                          <div key={c._id} className="flex gap-3 items-start">
                            <img src={c.userId?.image} className="w-8 h-8 rounded-full shadow-sm" alt="User" />
                            <div className="flex-1 bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                              <p className="text-xs font-black text-slate-800 mb-0.5">{c.userId?.name}</p>
                              <p className="text-sm text-slate-600">{c.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={(e) => submitComment(e, post._id)} className="flex gap-3 items-center bg-slate-100/80 p-2 rounded-2xl border border-slate-100">
                        <input
                          value={commentInputs[post._id] || ""}
                          onChange={(e) => handleCommentChange(post._id, e.target.value)}
                          placeholder="Write a specialized response..."
                          className="flex-1 bg-transparent border-none outline-none text-sm p-2"
                        />
                        <button type="submit" disabled={!commentInputs[post._id]?.trim()} className="bg-blue-600 text-white p-2 rounded-xl disabled:opacity-0 transition-all">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                           </svg>
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorPost;