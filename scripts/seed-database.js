// MongoDB Database Seeding Script
// Run with: node scripts/seed-database.js

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'reloop';

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('items').deleteMany({});
    await db.collection('pickupRequests').deleteMany({});
    await db.collection('transactions').deleteMany({});
    await db.collection('itemCategories').deleteMany({});
    
    console.log('Cleared existing data');
    
    // Seed item categories
    const categories = [
      {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Apparel and fashion items',
        subcategories: ['Shirts', 'Pants', 'Dresses', 'Jackets', 'Accessories'],
        acceptedConditions: ['like-new', 'very-good', 'good', 'fair'],
        averageProcessingTime: 24,
        sustainabilityFactor: 1.0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        subcategories: ['Phones', 'Laptops', 'Headphones', 'Cameras', 'Gaming'],
        acceptedConditions: ['like-new', 'very-good', 'good'],
        averageProcessingTime: 48,
        sustainabilityFactor: 1.5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Home & Garden',
        slug: 'home',
        description: 'Home appliances and garden items',
        subcategories: ['Kitchen', 'Furniture', 'Decor', 'Tools', 'Plants'],
        acceptedConditions: ['like-new', 'very-good', 'good', 'fair'],
        averageProcessingTime: 72,
        sustainabilityFactor: 2.0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    await db.collection('itemCategories').insertMany(categories);
    console.log('Seeded item categories');
    
    // Seed sample users
    const users = [
      {
        email: 'customer@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // password123
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        role: 'customer',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'US',
          coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        isVerified: true,
        isActive: true,
        stats: {
          itemsSubmitted: 5,
          itemsDonated: 3,
          itemsResold: 2,
          co2Saved: 12.5,
          revenueGenerated: 8500,
          ecoPoints: 125,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'retailer@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567891',
        role: 'retailer',
        isVerified: true,
        isActive: true,
        stats: {
          itemsSubmitted: 0,
          itemsDonated: 0,
          itemsResold: 15,
          co2Saved: 45.2,
          revenueGenerated: 25000,
          ecoPoints: 452,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'ngo@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G',
        firstName: 'Mike',
        lastName: 'Johnson',
        phone: '+1234567892',
        role: 'ngo',
        isVerified: true,
        isActive: true,
        stats: {
          itemsSubmitted: 0,
          itemsDonated: 0,
          itemsResold: 0,
          co2Saved: 0,
          revenueGenerated: 0,
          ecoPoints: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    const userResult = await db.collection('users').insertMany(users);
    console.log('Seeded users');
    
    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('items').createIndex({ submitterId: 1 });
    await db.collection('items').createIndex({ category: 1 });
    await db.collection('items').createIndex({ status: 1 });
    await db.collection('items').createIndex({ destination: 1 });
    await db.collection('items').createIndex({ 'marketplaceData.isListed': 1 });
    await db.collection('pickupRequests').createIndex({ requesterId: 1 });
    await db.collection('pickupRequests').createIndex({ status: 1 });
    await db.collection('transactions').createIndex({ buyerId: 1 });
    await db.collection('transactions').createIndex({ sellerId: 1 });
    await db.collection('transactions').createIndex({ itemId: 1 });
    
    console.log('Created database indexes');
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();