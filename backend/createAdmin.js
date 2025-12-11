const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Agent = require('./models/Agent');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🔧 Creating admin and test agent...\n');

    // Create Admin
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';

    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      admin = new User({
        email: adminEmail,
        password: hashedAdminPassword
      });
      await admin.save();
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create Test Agent
    const agentEmail = 'agent@test.com';
    const agentPassword = 'agent123';

    // Check if agent already exists
    let agent = await Agent.findOne({ email: agentEmail });
    if (!agent) {
      const hashedAgentPassword = await bcrypt.hash(agentPassword, 10);
      agent = new Agent({
        name: 'Test Agent',
        email: agentEmail,
        mobile: '1234567890',
        password: hashedAgentPassword,
        userType: 'agent',
        createdBy: admin._id
      });
      await agent.save();
      console.log('✅ Test agent created');
    } else {
      console.log('ℹ️  Test agent already exists');
      
      // Update agent password to ensure it's correct
      const hashedAgentPassword = await bcrypt.hash(agentPassword, 10);
      agent.password = hashedAgentPassword;
      await agent.save();
      console.log('✅ Agent password updated');
    }

    console.log('\n📋 Test Credentials:');
    console.log('   Admin:', adminEmail, '/', adminPassword);
    console.log('   Agent:', agentEmail, '/', agentPassword);
    console.log('\n🚀 You can now start the application!');

    process.exit();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
