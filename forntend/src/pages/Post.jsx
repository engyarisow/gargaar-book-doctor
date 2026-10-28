
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";

const Posts = () => {
  const {
    posts = [],
    userData,
    getPublicPosts,
    likePost,
    addComment,
    editComment,
    deleteComment,
    likeComment,
    record,
  } = useContext(AppContext);

  const [search, setSearch] = useState("");
  const [expandedPosts, setExpandedPosts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [zoomImg, setZoomImg] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    if (typeof getPublicPosts === "function") {
      getPublicPosts();
    }
  }, [getPublicPosts]);

  const currentUserId = userData?._id
    ? String(userData._id)
    : "";

  const handleInputChange = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const submitComment = async (e, postId) => {
    e.preventDefault();

    const text = commentInputs[postId]?.trim();

    if (!text) return;

    if (!currentUserId) {
      alert("Please log in to comment.");
      return;
    }

    if (typeof addComment !== "function") return;

    await addComment(postId, text);

    setCommentInputs((prev) => ({
      ...prev,
      [postId]: "",
    }));
  };

  const handleRecordView = (postId) => {
    if (typeof record === "function") {
      record(postId);
    }
  };

  const filteredPosts = (Array.isArray(posts) ? posts : []).filter(
    (post) => {
      const searchText = search.toLowerCase();

      return (
        post.title?.toLowerCase().includes(searchText) ||
        post.content?.toLowerCase().includes(searchText) ||
        post.doctorId?.name?.toLowerCase().includes(searchText)
      );
    }
  );

  const isSameUser = (id1, id2) =>
    id1 != null && id2 != null && String(id1) === String(id2);

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 px-4 flex flex-col items-center font-sans text-slate-900">
      {/* Image zoom modal */}
      {zoomImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4"
          onClick={() => setZoomImg(null)}
        >
          <button
            type="button"
            onClick={() => setZoomImg(null)}
            className="absolute top-5 right-5 text-white text-3xl"
            aria-label="Close image"
          >
            &times;
          </button>

          <img
            src={zoomImg}
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
            alt="Zoomed post"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Search */}
      <div className="w-full max-w-2xl mb-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search medical posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white shadow-sm p-5 pl-14 rounded-3xl focus:ring-2 focus:ring-blue-500/20 outline-none text-lg"
          />

          <span className="absolute left-6 top-1/2 -translate-y-1/2 opacity-40 text-xl">
            🔍
          </span>
        </div>
      </div>

      {/* Posts list */}
      <div className="w-full max-w-xl space-y-8">
        {filteredPosts.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 shadow-sm">
            {search
              ? "No posts match your search."
              : "No public posts available yet."}
          </div>
        )}

        {filteredPosts.map((post) => {
          const postId = post._id;

          const isLikedByMe = (post.likes || []).some((like) =>
            isSameUser(like?._id || like, currentUserId)
          );

          const viewCount = Array.isArray(post.viewers)
            ? post.viewers.length
            : post.views || 0;

          return (
            <article
              key={postId}
              className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden hover:-translate-y-1 transition-all duration-300"
            >
              {/* Doctor header */}
              <div className="flex items-center p-6 gap-4">
                <img
                  src={post.doctorId?.image || "/default-doctor.png"}
                  className="w-14 h-14 rounded-2xl object-cover bg-slate-100"
                  alt={post.doctorId?.name || "Doctor"}
                />

                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-slate-800 truncate">
                    {post.doctorId?.name || "Doctor"}
                  </p>

                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              </div>

              {/* Post content */}
              <div className="px-6 pb-4">
                {post.title && (
                  <h3 className="font-bold text-slate-900 text-xl mb-3">
                    {post.title}
                  </h3>
                )}

                <div className="text-slate-600 leading-relaxed text-[15px] whitespace-pre-wrap break-words">
                  {expandedPosts[postId]
                    ? post.content
                    : post.content?.slice(0, 140)}

                  {!expandedPosts[postId] &&
                    (post.content?.length || 0) > 140 && (
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedPosts((prev) => ({
                            ...prev,
                            [postId]: true,
                          }));
                          handleRecordView(postId);
                        }}
                        className="text-blue-600 font-bold ml-1 hover:text-blue-700"
                      >
                        Read more
                      </button>
                    )}
                </div>
              </div>

              {/* Post image */}
              {post.mediaUrl && (
                <div className="px-4 pb-4">
                  <img
                    src={post.mediaUrl}
                    onClick={() => {
                      setZoomImg(post.mediaUrl);
                      handleRecordView(postId);
                    }}
                    className="w-full max-h-[450px] object-cover rounded-[24px] cursor-zoom-in hover:opacity-95 transition-opacity"
                    alt={post.title || "Medical post"}
                    loading="lazy"
                  />
                </div>
              )}

              {/* Likes and views */}
              <div className="px-6 py-4 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
                <div className="flex gap-6 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUserId) {
                        alert("Please log in to like a post.");
                        return;
                      }

                      if (typeof likePost === "function") {
                        likePost(postId);
                      }
                    }}
                    className="flex items-center gap-2 group"
                    aria-label="Like post"
                  >
                    <span
                      className={`text-2xl transition-transform group-hover:scale-125 ${
                        isLikedByMe
                          ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                          : "grayscale opacity-40"
                      }`}
                    >
                      {isLikedByMe ? "💙" : "🤍"}
                    </span>

                    <span
                      className={`font-bold text-sm ${
                        isLikedByMe
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`}
                    >
                      {post.likes?.length || 0}
                    </span>
                  </button>

                  <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <span className="text-xl">👁️</span>
                    {viewCount}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleRecordView(postId);
                    setShowComments((prev) => ({
                      ...prev,
                      [postId]: !prev[postId],
                    }));
                  }}
                  className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  {post.comments?.length || 0} COMMENTS
                </button>
              </div>

              {/* Comments */}
              {showComments[postId] && (
                <div className="px-6 pb-6 pt-4 space-y-4 border-t border-slate-100">
                  <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                    {(post.comments || []).map((comment) => {
                      const commentUserId =
                        comment.userId?._id || comment.userId;

                      const isOwnComment = isSameUser(
                        commentUserId,
                        currentUserId
                      );

                      const isLikedByMeComment = (
                        comment.likes || []
                      ).some((like) =>
                        isSameUser(
                          like?._id || like,
                          currentUserId
                        )
                      );

                      return (
                        <div
                          key={comment._id}
                          className="flex gap-3 group"
                        >
                          <img
                            src={
                              comment.userId?.image ||
                              "/default-user.png"
                            }
                            className="w-8 h-8 rounded-full object-cover bg-slate-100"
                            alt={comment.userId?.name || "User"}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="relative bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-xs font-black text-slate-800 mb-1">
                                  {comment.userId?.name || "User"}
                                </p>

                                {isOwnComment && (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newText = prompt(
                                          "Edit your comment:",
                                          comment.comment
                                        );

                                        if (newText?.trim()) {
                                          editComment?.(
                                            postId,
                                            comment._id,
                                            newText.trim()
                                          );
                                        }
                                      }}
                                      className="text-[10px] text-blue-500 font-bold hover:underline"
                                    >
                                      EDIT
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const confirmed = window.confirm(
                                          "Delete this comment?"
                                        );

                                        if (confirmed) {
                                          deleteComment?.(
                                            postId,
                                            comment._id
                                          );
                                        }
                                      }}
                                      className="text-[10px] text-red-400 font-bold hover:underline"
                                    >
                                      DELETE
                                    </button>
                                  </div>
                                )}
                              </div>

                              <p className="text-sm text-slate-600 whitespace-pre-wrap break-words">
                                {comment.comment}
                              </p>

                              {(comment.likes?.length || 0) > 0 && (
                                <div className="absolute -right-2 -bottom-2 bg-white shadow-sm border rounded-full px-2 flex items-center gap-1">
                                  <span className="text-[10px]">💙</span>
                                  <span className="text-[10px] text-slate-600 font-bold">
                                    {comment.likes.length}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-4 mt-2 ml-2 items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!currentUserId) {
                                    alert("Please log in to like comments.");
                                    return;
                                  }

                                  likeComment?.(postId, comment._id);
                                }}
                                className={`text-[10px] font-black uppercase tracking-tight ${
                                  isLikedByMeComment
                                    ? "text-blue-600"
                                    : "text-slate-400 hover:text-slate-600"
                                }`}
                              >
                                {isLikedByMeComment ? "Liked" : "Like"}
                              </button>

                              <span className="text-[10px] font-bold text-slate-300 uppercase">
                                {comment.createdAt
                                  ? new Date(
                                      comment.createdAt
                                    ).toLocaleDateString()
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add comment */}
                  <div className="flex gap-3 items-center pt-2">
                    <img
                      src={userData?.image || "/default-user.png"}
                      className="w-9 h-9 rounded-xl object-cover border-2 border-white shadow-md bg-slate-100"
                      alt="Your profile"
                    />

                    <form
                      className="flex-1 relative flex items-center"
                      onSubmit={(e) => submitComment(e, postId)}
                    >
                      <input
                        id={`input-${postId}`}
                        value={commentInputs[postId] || ""}
                        onChange={(e) =>
                          handleInputChange(postId, e.target.value)
                        }
                        placeholder="Write a comment..."
                        className="w-full bg-slate-100 border-none rounded-2xl py-3 px-5 pr-14 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none"
                      />

                      <button
                        type="submit"
                        disabled={!commentInputs[postId]?.trim()}
                        className={`absolute right-2 p-2 rounded-xl transition ${
                          commentInputs[postId]?.trim()
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-slate-200 text-slate-400 opacity-50"
                        }`}
                        aria-label="Send comment"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 rotate-45"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Posts;
