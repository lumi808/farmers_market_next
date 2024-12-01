import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get('buyerId');
  
    if (!buyerId) {
      return new Response(JSON.stringify({ error: 'Buyer ID is required' }), { status: 400 });
    }
  
    try {
      const cart = await prisma.cart.findUnique({
        where: { buyerId },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });
  
      if (!cart) {
        return new Response(JSON.stringify({ message: 'Cart not found' }), { status: 404 });
      }
  
      return new Response(JSON.stringify(cart), { status: 200 });
    } catch (error) {
      console.log(error);
      return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
    }
}

export async function POST(req: Request) {
    const { buyerId, productId, quantity } = await req.json();
    console.log("DATA", buyerId, productId, quantity)
  
    if (!buyerId || !productId || !quantity) {
      return new Response(JSON.stringify({ error: 'Buyer ID, Product ID, and Quantity are required' }), { status: 400 });
    }
  
    try {
      let cart = await prisma.cart.findUnique({
        where: { buyerId },
      });
  
      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            buyerId,
          },
        });
      }
  
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });
  
      if (existingCartItem) {
        await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
      }
  
      return new Response(JSON.stringify({ message: 'Product added to cart successfully' }), { status: 200 });
    } catch (error) {
      console.log(error);
      return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
    }
}
