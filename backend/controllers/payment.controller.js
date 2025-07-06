import Coupon from "../models/coupon.model.js";
import { stripe } from "..//lib/stripe.js";
import Order from "../models/order.model.js";


export const createCheckoutSession = async (req, res, next) => {
    try {
        const { products, couponCode } = req.body;
        // Validate products
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Invalid products array." });
        }

        let totalAmount = 0;

        // Prepare line items for Stripe
        const lineItems = products.map(product => {
            const amount = Math.round(product.price * 100); // Stripe uses cents
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image]
                    },
                    unit_amount: amount,
                },
                quantity: product.quantity,
            };
        });

        // Check and apply coupon
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({
                code: couponCode,
                userId: req.user._id,
                isActive: true,
            });

            if (coupon) {
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);
            }
        }

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchased-cancel`,
            discounts: coupon
                ? [
                    {
                        coupon: await createStripeCoupon(coupon.discountPercentage),
                    },
                ]
                : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p._id,
                        quantity: p.quantity,
                        price: p.price,
                    }))
                ),
            }
        });
        if (totalAmount >= 20000) {
            await createNewCoupon(req.user._id)
        }
        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
    }
    catch (error) {
        console.error("Error in createCheckoutSession:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    })
    return coupon.id;
}

async function createNewCoupon(userId) {
    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        userId: userId,
    })
    await newCoupon.save();
    return newCoupon;

}


export const checkoutSuccess = async (req, res, next) => {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        if (session.payment_status === 'paid') {
            if (session.metadata.couponCode) {
                await Coupon.findOneAndUpdate(
                    {
                        code: session.metadata.couponCode, userId: session.metadata.userId

                    }, {
                    isActive: false
                }
                )
            }
            //create new order
            const products=JSON.parse(session.metadata.products);
            const newOrder=new Order({

                user:session.metadata.userId,
                products:products.map(product=>({
                    product:product.id,
                    quantity: product.quantity,
                    price:product.price,
                })),
                totalAmount: session.amount_total / 100,
                stripeSessionId:sessionId
            })

            await newOrder.save();
            res.status(200).json({
                success:true,
                message:"Order created successfully and coupon deleted",
                orderId:newOrder._id,
            })

        }
    } catch (error) {
      console.log("Error in checkoutSuccess:", error.message);
       res.status(500).json({ message: "Server error", error: error.message });
    }
}

