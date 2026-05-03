import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';

dotenv.config();

/**
 * Seed script to populate database with sample data
 * Run with: npm run seed
 */
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const adminPassword = await bcrypt.hash('admin123', 12);
    const memberPassword = await bcrypt.hash('member123', 12);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: memberPassword,
      role: 'member',
    });

    const member2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: memberPassword,
      role: 'member',
    });

    const member3 = await User.create({
      name: 'Bob Wilson',
      email: 'bob@example.com',
      password: memberPassword,
      role: 'member',
    });

    console.log('Created users');

    // Create projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with new branding',
      deadline: new Date('2025-06-30'),
      members: [member1._id, member2._id],
      createdBy: admin._id,
    });

    const project2 = await Project.create({
      name: 'Mobile App Development',
      description: 'Build iOS and Android apps for the product',
      deadline: new Date('2025-08-15'),
      members: [member2._id, member3._id],
      createdBy: admin._id,
    });

    const project3 = await Project.create({
      name: 'API Integration',
      description: 'Integrate third-party payment and analytics APIs',
      deadline: new Date('2025-05-20'),
      members: [member1._id, member3._id],
      createdBy: admin._id,
    });

    console.log('Created projects');

    // Create tasks
    const tasks = [
      // Website Redesign tasks
      {
        title: 'Design homepage mockup',
        description: 'Create wireframes and high-fidelity mockups for the new homepage',
        status: 'completed',
        dueDate: new Date('2025-05-10'),
        assignedTo: member1._id,
        projectId: project1._id,
        createdBy: admin._id,
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build mobile-friendly navigation menu',
        status: 'in-progress',
        dueDate: new Date('2025-05-15'),
        assignedTo: member2._id,
        projectId: project1._id,
        createdBy: admin._id,
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        status: 'todo',
        dueDate: new Date('2025-05-25'),
        assignedTo: member1._id,
        projectId: project1._id,
        createdBy: admin._id,
      },
      // Mobile App tasks
      {
        title: 'Set up React Native project',
        description: 'Initialize project with proper folder structure',
        status: 'completed',
        dueDate: new Date('2025-04-20'),
        assignedTo: member2._id,
        projectId: project2._id,
        createdBy: admin._id,
      },
      {
        title: 'Implement user authentication',
        description: 'Add login, signup, and password reset flows',
        status: 'in-progress',
        dueDate: new Date('2025-05-05'),
        assignedTo: member3._id,
        projectId: project2._id,
        createdBy: admin._id,
      },
      {
        title: 'Build product listing screen',
        description: 'Create scrollable list with search and filters',
        status: 'todo',
        dueDate: new Date('2025-05-20'),
        assignedTo: member2._id,
        projectId: project2._id,
        createdBy: admin._id,
      },
      // API Integration tasks
      {
        title: 'Research payment providers',
        description: 'Compare Stripe, PayPal, and Square for our needs',
        status: 'completed',
        dueDate: new Date('2025-04-15'),
        assignedTo: member1._id,
        projectId: project3._id,
        createdBy: admin._id,
      },
      {
        title: 'Implement Stripe integration',
        description: 'Set up Stripe checkout and webhook handling',
        status: 'todo',
        dueDate: new Date('2025-05-01'),
        assignedTo: member3._id,
        projectId: project3._id,
        createdBy: admin._id,
      },
      {
        title: 'Add analytics tracking',
        description: 'Integrate Google Analytics and Mixpanel',
        status: 'todo',
        dueDate: new Date('2025-04-28'),
        assignedTo: member1._id,
        projectId: project3._id,
        createdBy: admin._id,
      },
    ];

    await Task.insertMany(tasks);
    console.log('Created tasks');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Test accounts:');
    console.log('  Admin: admin@example.com / admin123');
    console.log('  Member: john@example.com / member123');
    console.log('  Member: jane@example.com / member123');
    console.log('  Member: bob@example.com / member123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
