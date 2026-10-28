import express from 'express';
import { 
    loginPharmacy, 
    getPharmacyProfile,  
    addProduct, 
    getPharmacyProducts,
    getPublicPharmacies,
    getPublicPharmacyProducts,
    getPharmaciesWithProducts,
    getPharmacyOrders,
     getPharmacyDashboard,
     getOutOfStockProducts,
     getExpiredProducts,
     updateOrderStatus,
     deleteProduct,
     updateStock,
     updateProduct,
} from '../controllers/pharmacyController.js';
import authPharmacy from '../middlewares/authPharmacy.js'; 

const pharmacyRouter = express.Router();


// 🌍 PUBLIC ROUTES (User-ka caadiga ah iyo booqdayaasha ayaan u baahnayn Token)
pharmacyRouter.get('/public-list', getPublicPharmacies); // Hel farmashiyeyaasha oo nadiif ah
pharmacyRouter.get('/public-products/:pharmacyId', getPublicPharmacyProducts); // Hel alaabta farmashiye gaar ah
pharmacyRouter.get('/all-with-products', getPharmaciesWithProducts); // Hel dhamaan isagoo is-wata
pharmacyRouter.post('/login', loginPharmacy); // Login-ka farmashiyaha

// 🔐 PROTECTED ROUTES (Kaliya waxaa geli kara Farmashiyaha iska leh account-ka - Waxay u baahan yihiin Token)
pharmacyRouter.get('/profile', authPharmacy, getPharmacyProfile);
pharmacyRouter.post('/change-order-status', authPharmacy, updateOrderStatus);
pharmacyRouter.post('/add-product', authPharmacy, addProduct);
pharmacyRouter.get('/products', authPharmacy, getPharmacyProducts);
pharmacyRouter.get('/orders', authPharmacy, getPharmacyOrders); 
pharmacyRouter.get( "/dashboard",  authPharmacy, getPharmacyDashboard);

pharmacyRouter.get('/out-of-stock',authPharmacy, getOutOfStockProducts);
pharmacyRouter.get('/expired',authPharmacy, getExpiredProducts);

//
pharmacyRouter.delete('/delete-product/:id', authPharmacy, deleteProduct);
pharmacyRouter.post('/update-stock', authPharmacy, updateStock);
//
pharmacyRouter.post('/update-product', authPharmacy, updateProduct);


export default pharmacyRouter;


