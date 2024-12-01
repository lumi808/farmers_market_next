import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


export const addToCart = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { buyerId, productId, quantity } = req.body;

    try {
      const cart = await prisma.cart.findUnique({
        where: { buyerId }
      });

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const cartItem = await prisma.cartItem.create({
        data: {
          cart: {
            connect: { id: cart.id }, // Connect using the cart ID
          },
          product: {
            connect: { id: productId },
          },
          quantity,
        },
      });
      return res.status(201).json(cartItem);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to add item to cart' });
    }
  } else {
    return res.setHeader('Allow', ['POST']).status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// GET /api/cart
export const getCart = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { buyerId } = req.query;

    try {
      const cart = await prisma.cart.findUnique({
        where: { buyerId: String(buyerId) },
        include: {
          products: {
            include: {
              product: true, // Include product details
            },
          },
        },
      });
      return res.status(200).json(cart);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve cart' });
    }
  } else {
    return res.setHeader('Allow', ['GET']).status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// Export the handler
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return addToCart(req, res);
  } else if (req.method === 'GET') {
    return getCart(req, res);
  } else {
    return res.setHeader('Allow', ['POST', 'GET']).status(405).end(`Method ${req.method} Not Allowed`);
  }
};
