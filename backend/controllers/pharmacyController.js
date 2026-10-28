import pharmacyModel from "../models/pharmacyModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ==========================================
// 1. LOGIN FARMASHIYE
// ==========================================
export const loginPharmacy = async (req, res) => {
    try {
        const { email, password } = req.body;
        const pharmacy = await pharmacyModel.findOne({ email });

        if (!pharmacy) {
            return res.json({ success: false, message: "Email-kan laguma helin farmashiyaha" });
        }

        const isMatch = await bcrypt.compare(password, pharmacy.password);

        if (isMatch) {
            const token = jwt.sign({ id: pharmacy._id }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Password-ka waa khalad" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. HEL PROFILE-KA FARMASHIYHA
// ==========================================
export const getPharmacyProfile = async (req, res) => {
    try {
        const { pharmacyId } = req;
        const pharmacy = await pharmacyModel.findById(pharmacyId).select("-password");
        res.json({ success: true, pharmacy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. KU DAR DAAWO CUSUB (ADD PRODUCT)
// ==========================================
export const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, quantity, expiryDate } = req.body;
        const pharmacyId = req.pharmacyId;

        if (!name || !price || !category || !image || !expiryDate) {
            return res.json({ 
                success: false, 
                message: "Fadlan buuxi magaca, qiimaha, qaybta, sawirka iyo Expiry Date-ka." 
            });
        }

        const productData = {
            name,
            description,
            price: Number(price),
            category,
            image,
            quantity: Number(quantity) || 1,
            pharmacyId,
            date: Date.now(),
            expiryDate: new Date(expiryDate)
        };

        const newProduct = new productModel(productData);
        await newProduct.save();

        res.json({ 
            success: true, 
            message: "Product si guul leh ayaa loogu daray!", 
            product: newProduct 
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. HEL PRODUCTS-KA FARMASHIYAHAN KELIYA (Dashboard-ka)
// ==========================================
export const getPharmacyProducts = async (req, res) => {
    try {
        const pharmacyId = req.pharmacyId;
        const products = await productModel.find({ pharmacyId }).sort({ date: -1 });
        res.json({ success: true, products });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ==========================================
// 🌍 QAYBTA PUBLIC-KA (LOOGU TALAGALAY USER-KA/FRONTEND)
// ==========================================

// ==========================================
// 5. HEL DHAMMAAN FARMASHIYEYAASHA AMMAAN AH
// ==========================================
export const getPublicPharmacies = async (req, res) => {
    try {
        const pharmacies = await pharmacyModel.find({ 
            status: 'Active', 
            isDeleted: false 
        })
        .select('-password -email -license -holderNumber -payoutMethod -payoutAccountType -payoutAccountNumber -payoutHolderName -walletBalance -totalEarnings -resetPasswordToken -resetPasswordExpire -isDeleted');

        res.json({ success: true, count: pharmacies.length, pharmacies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 6. HEL DAAWOOYINKA U YAALLA FARMASHIYE GAAR AH (Public)
// ==========================================
export const getPublicPharmacyProducts = async (req, res) => {
    try {
        const { pharmacyId } = req.params;
        const currentDate = new Date(); // 🚀 Xilliga hadda la joogo
        console.log("Filtering products with expiryDate > ", currentDate);

        // 🛑 Shuruudda: Keliya soo saar daawada aan dhicin (ExpiryDate > Maanta) iyo tan kaydka ku jirta
        const products = await productModel.find({ 
            pharmacyId, 
            inStock: true,
            quantity: { $gt: 0 },
            expiryDate: { $gt: currentDate } // 🔥 HALKAN AYAAN KU DARNAY SHURuUDDA EXPIRE-KA
        }).sort({ createdAt: -1 });

        res.json({ success: true, count: products.length, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 7. HEL FARMASHIYEYAASHA IYO DAAWOOYINKOODA ISKU MAR
// ==========================================
export const getPharmaciesWithProducts = async (req, res) => {
    try {
        const data = await pharmacyModel.aggregate([
            { $match: { status: 'Active', isDeleted: false } },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'pharmacyId',
                    as: 'products'
                }
            },
            {
                $project: {
                    password: 0, email: 0, license: 0, holderNumber: 0,
                    payoutMethod: 0, payoutAccountType: 0, payoutAccountNumber: 0, payoutHolderName: 0,
                    walletBalance: 0, totalEarnings: 0, resetPasswordToken: 0, resetPasswordExpire: 0, isDeleted: 0
                }
            }
        ]);

        res.json({ success: true, count: data.length, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 8. HEL DALABAADKA FARMASHIYHA U GAARKA AH (Orders)
// ==========================================
export const getPharmacyOrders = async (req, res) => {
    try {
        const pharmacyId = req.pharmacyId; 

        if (!pharmacyId) {
            return res.status(400).json({ 
                success: false, 
                message: "Fadlan soo dir Pharmacy ID!" 
            });
        }

        const orders = await orderModel.find({ pharmacyId })
            .populate('userId', 'name email')
            .populate('items.medicineId', 'image')
            .populate('pharmacyId', 'name image')
            .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        console.error("Cilad API-ga getPharmacyOrders:", error);
        res.status(500).json({ success: false, message: "Cilad gudaha ah: " + error.message });
    }
};

// ==========================================
// 9. BEDDEL XAALADDA DALABKA IYO DHIMISTA KAYDKA
// ==========================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, newStatus, verifyCode } = req.body;

    if (!orderId || !newStatus) {
      return res.status(400).json({
        success: false,
        message: "Order ID ama Status ayaa maqan.",
      });
    }

    const formattedStatus = newStatus.trim().charAt(0).toUpperCase() + newStatus.trim().slice(1).toLowerCase();
    const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    
    if (!allowedStatuses.includes(formattedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status-ka la soo diray sax ma aha. Waxaa la oggol yahay oo kaliya: ${allowedStatuses.join(", ")}`,
      });
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order lama helin." });
    }

    if (order.orderStatus === "Delivered" || order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order-kan hore ayaa loo xiray, isbeddel dambe ma oggola.",
      });
    }

    if (formattedStatus === "Delivered") {
      if (!verifyCode) {
        return res.status(400).json({
          success: false,
          message: "Fadlan geli Verification Code (PIN) si aad u bixiso dawada.",
        });
      }

      if (!order.verificationCode) {
        return res.status(400).json({
          success: false,
          message: "Order-kan kuma kaydsana wax verification code ah gudaha database-ka.",
        });
      }

      const dbCode = String(order.verificationCode).trim();
      const inputCode = String(verifyCode).trim();

      if (dbCode !== inputCode) {
        return res.status(400).json({
          success: false,
          message: "Verification Code-ka aad gelisay waa khalad. Hubi PIN-ka bukaanka.",
        });
      }

      order.isVerified = true;

      // Dhimista Kaydka
      for (const item of order.items) {
        await productModel.findByIdAndUpdate(item.medicineId, {
          $inc: { quantity: -item.quantity }
        });

        await productModel.updateOne(
          { _id: item.medicineId, quantity: { $lte: 0 } },
          { $set: { inStock: false } }
        );
      }
    }

    order.orderStatus = formattedStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Status-ka order-ka waxaa loo beddelay ${formattedStatus} si guul leh, kaydkana waa la cusboonaysiiyay.`,
      order,
    });

  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Waxaa dhacay khalad gudaha server-ka ah.",
      error: error.message,
    });
  }
};

// ==========================================
// 10. HEL XOGTA DASHBOARD-KA FARMASHIYAHA
// ==========================================
export const getPharmacyDashboard = async (req, res) => {
    try {
        const pharmacyId = req.pharmacyId;
        const orders = await orderModel.find({ pharmacyId });
        const totalOrders = orders.length;

        const completedOrders = orders.filter(order => order.orderStatus === "Delivered").length;
        const pendingOrders = orders.filter(order => order.orderStatus !== "Delivered").length;
        
        const totalRevenue = orders
            .filter(order => order.orderStatus === "Delivered")
            .reduce((sum, order) => sum + Number(order.pharmacyPayoutAmount || 0), 0);

        res.json({
            success: true,
            dashboard: {
                totalOrders,
                pendingOrders,
                completedOrders,
                totalRevenue
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 11. HEL DAAWOOYINKA KAYDKA KA DHAMMAADAY
// ==========================================
export const getOutOfStockProducts = async (req, res) => {
    try {
        const medicines = await productModel.find({ 
            pharmacyId: req.pharmacyId, 
            quantity: { $lte: 0 } 
        }).sort({ updatedAt: -1 });

        return res.json({ success: true, medicines });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 12. HEL DAAWOOYINKA WAQTIGOODU DHACAY
// ==========================================
export const getExpiredProducts = async (req, res) => {
    try {
        const currentDate = new Date();
        const medicines = await productModel.find({ 
            pharmacyId: req.pharmacyId,
            expiryDate: { $lt: currentDate } 
        }).sort({ expiryDate: 1 });

        return res.json({ success: true, medicines });
    } catch (error) {
        console.error("Cillad Expired Medicines API:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Isticmaal magaca Model-kaaga sida saxda ah ee aad ugu yeertay (tusale: productModel ama medicineModel)

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Tirtir daawada dhacday
        const deletedMedicine = await productModel.findByIdAndDelete(id);

        if (!deletedMedicine) {
            return res.json({ success: false, message: "Medicine not found" });
        }

        res.json({ success: true, message: "Medicine deleted successfully." });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export const updateStock = async (req, res) => {
    try {
        const { medicineId, quantity } = req.body;

        // Cusboonaysii tirada daawada (quantity)
        const updatedMedicine = await productModel.findByIdAndUpdate(
            medicineId,
            { quantity: quantity },
            { new: true }
        );

        if (!updatedMedicine) {
            return res.json({ success: false, message: "Medicine not found" });
        }

        res.json({ success: true, message: "Stock updated successfully." });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};
export const updateProduct = async (req, res) => {
    try {
        const { id, name, category, price, quantity } = req.body;

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            { name, category, price, quantity },
            { new: true } // Kani wuxuu soo celinayaa xogta cusub
        );

        if (!updatedProduct) {
            return res.json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Product updated successfully" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};
