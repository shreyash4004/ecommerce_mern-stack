import Product from "../models/product.model.js";


//adding to cart
export const addToCart = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const user = req.user;
        const existingItem = user.cartItems.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        }
        else {
            user.cartItems.push(productId)
        }
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message })
    }
};

//remove items from cart
export const removeAllFromCart = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const user = req.user;
        if (!productId) {
            user.cartItems = []
        }
        else {
            user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        }
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

//updating quantity
export const updateQuantity = async (req, res, next) => {

    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;
        const existingItem = user.cartItems.find((item) => item.id === productId)
        if (existingItem) {
            if (quantity === 0) {
                user.cartItems = user.cartItems.filter(item => item.id !== productId);
                await user.save();
                return res.json(user.cartItems);
            }
            existingItem.quantity = quantity;
            await user.save();
            return res.json(user.cartItems);
        }
        else {
            res.status(404).json({ message: "Product Not Found" })
        }
    }
    catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//getting carts products
export const getCartProducts=async(req, res) => {

    try {
        const products=await Product.find({_id:{$in:req.user.cartItems}});
        const cartItems=products.map(product=>{
            const item=req.user.cartItems.find((cartItem)=>{
                cartItem.id===product.id;
                return {...product.toJSON(),quantity:item.quantity}

            })
        })
        res.json(cartItems)
    } catch (error) {
        console.log("Error in getCartProducts controller")
        res.status(500).json({ message: "Server error", error: error.message });
    }
}


