import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import io from "socket.io-client";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currencySymbol = "$";

  const [doctors, setDoctors] = useState([]);
  const [posts, setPosts] = useState([]);
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(false);
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0);
  const [hospitals, setHospitals] = useState([]);
  const [orders, setOrders] = useState([]);

  const [pharmacies, setPharmacies] = useState([]);
  const [pharmaciesWithProducts, setPharmaciesWithProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});

  // -------------------- GET DOCTORS --------------------
  const getDoctorsData = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) setDoctors(data.doctors);
      else toast.error(data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  }, [backendUrl]);

  // -------------------- GET USER PROFILE --------------------
  const loadUserProfileData = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setUserData(data.user);
      else toast.error(data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  }, [backendUrl, token]);

  // -------------------- UPDATE USER PROFILE --------------------
  const updateUserProfile = async (formData) => {
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        toast.error("No token found. Please login again.");
        return;
      }

      const { data } = await axios.put(`${backendUrl}/api/user/update-profile`, formData, {
        headers: { Authorization: `Bearer ${storedToken}`, "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        toast.success(data.message);
        loadUserProfileData();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // -------------------- GET PUBLIC POSTS --------------------
  const getPublicPosts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/posts/public`);
      if (data.success) setPosts(data.posts);
      else toast.error(data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  }, [backendUrl]);

  // -------------------- LIKE POST --------------------
  const likePost = async (postId) => {
    try {
      if (!token) {
        toast.error("Login required");
        return false;
      }

      const { data } = await axios.post(
        `${backendUrl}/api/doctor/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId ? { ...post, likes: data.likes } : post
          )
        );
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };



  // -------------------- ADD COMMENT --------------------
  const addComment = async (postId, comment) => {
    try {
      if (!token) {
        toast.error("Login required");
        return null;
      }

      const { data } = await axios.post(
        `${backendUrl}/api/doctor/posts/${postId}/comment`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? { ...post, comments: [...post.comments, data.comment] }
              : post
          )
        );
        return data.comment;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  
 // -------------------- EDIT COMMENT --------------------
  const editComment = async (postId, commentId, newText) => {
    if (!token) return toast.error("Login required");
    if (!newText || !newText.trim()) return;

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/doctor/posts/${postId}/comment/${commentId}`,
        { comment: newText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setPosts(prev =>
          prev.map(post =>
            post._id === postId
              ? {
                  ...post,
                  comments: post.comments.map(c =>
                    c._id === commentId ? data.comment : c
                  ),
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // -------------------- DELETE COMMENT --------------------
  const deleteComment = async (postId, commentId) => {
    if (!token) return toast.error("Login required");

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/doctor/posts/${postId}/comment/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setPosts(prev =>
          prev.map(post =>
            post._id === postId
              ? {
                  ...post,
                  comments: post.comments.filter(c => c._id !== commentId),
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // -------------------- LIKE COMMENT --------------------
  const likeComment = async (postId, commentId) => {
    if (!token) return toast.error("Login required");

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/posts/${postId}/comment/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setPosts(prev =>
          prev.map(post =>
            post._id === postId
              ? {
                  ...post,
                  comments: post.comments.map(c =>
                    c._id === commentId ? data.comment : c
                  ),
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message);
    }
  };

 // -------------------- RECORD VIEW --------------------
const recordView = async (postId) => {
  if (!token) return;
  try {
    const { data } = await axios.post(
      `${backendUrl}/api/doctor/posts/${postId}/view`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.success) {
      setPosts((prev) =>
        prev.map((p) =>
          // Only update if data.viewers actually exists, otherwise keep old state
          p._id === postId 
            ? { ...p, viewers: data.viewers || p.viewers, views: data.viewsCount || p.views } 
            : p
        )
      );
    }
  } catch (error) {
    console.error("View tracking failed:", error.message);
  }
};



const getHospitalsData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/hospital/list`); // Hubi route-ka backend-ka
            if (data.success) {
                setHospitals(data.hospitals);
            }
        } catch (error) {
            console.log(error);
            toast.error("Ma suuragalin in la keeno isbitaalada");
        }
    };
// -------------------- GET PUBLIC PHARMACIES --------------------
  const getPublicPharmacies = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/pharmacy/public-list`);
      if (data.success) {
        setPharmacies(data.pharmacies);
      }
    } catch (error) {
      console.error("Cilad xagga farmashiyeyaasha:", error);
    }
  }, [backendUrl]);

  // -------------------- GET PHARMACIES WITH PRODUCTS --------------------
  const getPharmaciesWithProducts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/pharmacy/all-with-products`);
      if (data.success) {
        // Backend-ka data.data ayuu kusoo dhiibay aggregate-ka
        setPharmaciesWithProducts(data.data);
      }
    } catch (error) {
      console.error("Cilad xagga xogta isku-jirta ah:", error);
    }
  }, [backendUrl]);

  // -------------------- GET SINGLE PHARMACY PRODUCTS --------------------
  const getSinglePharmacyProducts = async (pharmacyId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/pharmacy/public-products/${pharmacyId}`);
      if (data.success) {
        return data.products;
      }
      return [];
    } catch (error) {
      console.error("Cilad xagga daawooyinka:", error);
      return [];
    }
  };


  const addToCart = async (itemId) => {
        // 1. Optimistic UI update
        let cartData = structuredClone(cartItems);
        
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        } else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);

        // 2. U dir Backend-ka adigoo isticmaalaya "Authorization: Bearer"
        if (token) {
            try {
                const response = await axios.post(
                    `${backendUrl}/api/user/add-to-cart`, 
                    { itemId }, 
                    { headers: { Authorization: `Bearer ${token}` } } // 👈 HALKAN AYAAN SAXNAY
                );

                if (!response.data.success) {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        } else {
            toast.info("Please login to save your cart.");
        }
    };

    // Function-ka soo akhrinaya cart-ga
    const getUserCart = async () => {
        if (!token) return; // Jooji haddii uusan token jirin
        
        try {
            const response = await axios.post(
                `${backendUrl}/api/user/get-cart`, 
                {}, 
                { headers: { Authorization: `Bearer ${token}` } } // 👈 HALKAN AYAAN SAXNAY
            );
            if (response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            console.log(error);
        }
    };

   // 1. Update Cart Quantity (+ / -)
  // Qayb kamid ah AppContext.jsx

const updateCartQuantity = async (itemId, quantity) => {
    // Local state update (UI-ga si degdeg ah ayuu isku beddelayaa)
    let cartData = structuredClone(cartItems);

    if (quantity <= 0) {
        delete cartData[itemId];
    } else {
        cartData[itemId] = quantity;
    }
    setCartItems(cartData);

    // Backend update (API Call)
    if (token) {
        try {
            const response = await axios.post(
                `${backendUrl}/api/user/update-cart`,
                { itemId, quantity }, // Xogta loo dirayo Backend-ka
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (!response.data.success) {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }
};

const removeFromCart = async (itemId) => {
    await updateCartQuantity(itemId, 0);
    toast.success("Item removed from cart");
};

const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        for (const pharmacy of pharmaciesWithProducts) {
          const product = pharmacy.products.find(p => p._id === itemId);
          if (product) {
            totalAmount += product.price * cartItems[itemId];
            break; 
          }
        }
      }
    }
    return totalAmount;
  };

  const getUserOrders = async () => {
        try {
            if (!token) return; // Haddii uusan qofku login ahayn, iska jooji
            
            const response = await axios.post(`${backendUrl}/api/user/orders`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setOrders(response.data.orders.reverse()); // Kuwa cusub sare keen
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Cilad ayaa dhacday markii orders-ka la raadinayay.");
        }
    };

  // -------------------- EFFECTS --------------------
  useEffect(() => {
    getDoctorsData();
    getUserCart();
    getPublicPharmacies();
    getPharmaciesWithProducts(); 
    getPublicPosts();
    getHospitalsData();
    getUserOrders();
    
  }, [getDoctorsData, getPublicPosts]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      loadUserProfileData();
    } else {
      localStorage.removeItem("token");
      setUserData(false);
    }
  }, [token, loadUserProfileData]);
  useEffect(() => {
        if (token && userData?._id) {
            const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:4000");
            
            // Ku xir user-ka qolkiisa gaarka ah si uu ogeysiisyada u helo
            newSocket.emit("join_user_room", userData._id);

            // Dhageyso marka fariin cusub soo dhacdo adigoon ku jirin chat-kaas
            newSocket.on("new_global_message", (data) => {
                // Kordhi tirada fariimaha aan la akhriyin
                setGlobalUnreadCount(prev => prev + 1);
                
                // Halkan waxaad ka kicin kartaa dhawaaq (Notification Sound) ama Toast Alert
                // toast.info(`Fariin cusub: ${data.fileType === 'image' ? 'Sawir' : 'Qoraal'}`);
            });

            setSocket(newSocket);

            return () => newSocket.disconnect();
        }
    }, [token, userData]);

  const value = {
    doctors,
    posts,
    getDoctorsData,
    getPublicPosts,
    currencySymbol,
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    loadUserProfileData,
    updateUserProfile,
    likePost,
    addComment,
    editComment,
    deleteComment,
    likeComment,
    recordView,
    hospitals, 
  getHospitalsData,
  globalUnreadCount,
    setGlobalUnreadCount,
    socket,

    pharmacies,
    pharmaciesWithProducts,
    getPublicPharmacies,
    getPharmaciesWithProducts,
    getSinglePharmacyProducts,
    cartItems,
        setCartItems,
        addToCart,
        updateCartQuantity, 
    removeFromCart,    
    getUserCart,
    getCartAmount ,
    orders,         
  getUserOrders,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;