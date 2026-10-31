const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Policy = require('./models/Policy');
const Claim = require('./models/Claim');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Claim.deleteMany({});
    await Policy.deleteMany({});
    await User.deleteMany({});

    console.log('[Seed] Creating Users...');
    const users = await User.create([
      {
        name: 'Sarah Connor',
        email: 'sarah.connor@example.com',
        password: 'securePassword123!',
        phone: '+1-555-019-2834',
        role: 'customer',
        dateOfBirth: new Date('1988-05-12'),
        address: {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          zipCode: '97477',
          country: 'USA'
        }
      },
      {
        name: 'John Miller',
        email: 'john.miller@example.com',
        password: 'agentSecurePass456!',
        phone: '+1-555-014-9988',
        role: 'agent',
        address: {
          street: '100 Financial Way, Suite 400',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          country: 'USA'
        }
      },
      {
        name: 'Elena Rostova',
        email: 'admin@insuranceco.com',
        password: 'adminMasterPassword789!',
        phone: '+1-555-012-3456',
        role: 'admin',
        address: {
          street: '1 Corporate Blvd',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }
      }
    ]);

    const customer = users[0];
    const agent = users[1];

    console.log('[Seed] Creating Policies...');
    const policies = await Policy.create([
      {
        policyNumber: 'POL-HLTH-2026-001',
        title: 'Premium Comprehensive Health Plan',
        policyType: 'Health',
        description: 'Complete inpatient, outpatient, and prescription drug coverage with zero co-pay.',
        premiumAmount: 450.00,
        coverageAmount: 500000.00,
        deductibleAmount: 1500.00,
        paymentFrequency: 'Monthly',
        termMonths: 12,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2027-01-01'),
        status: 'Active',
        user: customer._id,
        agent: agent._id
      },
      {
        policyNumber: 'POL-AUTO-2026-002',
        title: 'Full Collision & Comprehensive Auto Coverage',
        policyType: 'Auto',
        description: 'Covers collision, comprehensive perils, roadside assistance, and rental reimbursement.',
        premiumAmount: 1200.00,
        coverageAmount: 100000.00,
        deductibleAmount: 500.00,
        paymentFrequency: 'Annual',
        termMonths: 12,
        startDate: new Date('2026-03-15'),
        endDate: new Date('2027-03-15'),
        status: 'Active',
        user: customer._id,
        agent: agent._id
      }
    ]);

    console.log('[Seed] Creating Claims...');
    await Claim.create([
      {
        claimNumber: 'CLM-2026-0001',
        policy: policies[1]._id,
        user: customer._id,
        claimAmount: 3200.00,
        approvedAmount: 2700.00,
        incidentDate: new Date('2026-04-10'),
        incidentDescription: 'Minor collision at an intersection resulting in front bumper and headlight damage.',
        incidentLocation: 'Main St & 4th Ave, Springfield',
        status: 'Approved',
        reviewNotes: 'Assessed by adjuster John Miller. Deductible of $500 applied.',
        reviewedBy: agent._id,
        documents: [
          {
            name: 'accident_report.pdf',
            url: 'https://example.com/docs/accident_report.pdf'
          },
          {
            name: 'repair_estimate.pdf',
            url: 'https://example.com/docs/repair_estimate.pdf'
          }
        ]
      }
    ]);

    console.log('[Seed] Database seeded successfully with sample Users, Policies, and Claims!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedData();

