import { AppDataSource } from '../config/data-source';
import { User } from '../entities/user.entity';
import { DriverProfile } from '../entities/driver-profile.entity';
import { DriverPresence } from '../entities/driver-presence.entity';
import { UserRole, VehicleType } from '@waka/shared';
import { faker } from '@faker-js/faker';

// Nigerian names data
const nigerianFirstNames = [
  'Chukwuemeka', 'Oluwaseun', 'Adebayo', 'Chinonso', 'Oluwatobi',
  'Ifeoma', 'Ngozi', 'Amina', 'Fatima', 'Zainab',
  'Emeka', 'Ikenna', 'Chidi', 'Nnamdi', 'Kelechi',
  'Adanna', 'Chioma', 'Amarachi', 'Chiamaka', 'Obioma',
  'Tunde', 'Bola', 'Segun', 'Femi', 'Wale',
  'Bisi', 'Funke', 'Yemi', 'Lola', 'Tope'
];

const nigerianLastNames = [
  'Okafor', 'Nwankwo', 'Okoro', 'Adebayo', 'Ogunleye',
  'Iwu', 'Eze', 'Obi', 'Nwosu', 'Okafor',
  'Adeyemi', 'Oluwaseyi', 'Babatunde', 'Olumide', 'Adekunle',
  'Ibrahim', 'Mohammed', 'Hassan', 'Aliyu', 'Usman',
  'Okafor', 'Nwosu', 'Eze', 'Okoro', 'Nwankwo'
];

// Nigerian communities/areas
const nigerianCommunities = [
  'Lagos Island', 'Victoria Island', 'Ikoyi', 'Surulere', 'Yaba',
  'Ikeja', 'Lekki', 'Ajah', 'Festac Town', 'Gbagada',
  'Mushin', 'Oshodi', 'Agege', 'Ikorodu', 'Badagry',
  'Abuja Central', 'Wuse', 'Maitama', 'Asokoro', 'Garki',
  'Port Harcourt', 'Calabar', 'Enugu', 'Kano', 'Ibadan'
];

// Vehicle brands by type
const bikeBrands = ['Honda', 'Yamaha', 'Bajaj', 'TVS', 'Hero'];
const tricycleBrands = ['Bajaj', 'TVS', 'Piaggio', 'Mahindra'];
const carBrands = ['Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Volkswagen'];

const vehicleColors = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Silver', 'Grey', 'Brown', 'Orange'
];

// Generate Nigerian phone number
function generateNigerianPhone(): string {
  const prefixes = ['080', '081', '070', '090', '091'];
  const prefix = faker.helpers.arrayElement(prefixes);
  const number = faker.string.numeric(8);
  return `${prefix}${number}`;
}

// Generate Nigerian name
function generateNigerianName(): { firstName: string; lastName: string; fullName: string } {
  const firstName = faker.helpers.arrayElement(nigerianFirstNames);
  const lastName = faker.helpers.arrayElement(nigerianLastNames);
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`
  };
}

// Generate license plate (Nigerian format)
function generateLicensePlate(): string {
  const letters = faker.string.alpha(3).toUpperCase();
  const numbers = faker.string.numeric(3);
  return `${letters}-${numbers}`;
}

// Generate areas of operation (2-4 areas)
function generateAreasOfOperation(): string[] {
  const count = faker.number.int({ min: 2, max: 4 });
  return faker.helpers.arrayElements(nigerianCommunities, count);
}

// Generate avatar URL (using a placeholder service that supports names)
function generateAvatarUrl(name: string): string {
  // Using UI Avatars service for consistent avatars
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=200&background=random&bold=true`;
}

async function seedDrivers() {
  try {
    console.log('🌱 Starting driver seed...');

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }

    const userRepository = AppDataSource.getRepository(User);
    const driverProfileRepository = AppDataSource.getRepository(DriverProfile);
    const driverPresenceRepository = AppDataSource.getRepository(DriverPresence);

    // Check if drivers already exist
    const existingDrivers = await driverProfileRepository.count();
    if (existingDrivers > 0) {
      console.log(`⚠️  Found ${existingDrivers} existing drivers. Clearing existing drivers...`);
      // Delete existing drivers (cascade will handle related records)
      await driverPresenceRepository.delete({});
      await driverProfileRepository.delete({});
      await userRepository.delete({ role: UserRole.DRIVER });
      console.log('✅ Cleared existing drivers');
    }

    const driversToCreate = 20;
    const createdDrivers = [];

    console.log(`\n📝 Creating ${driversToCreate} drivers...\n`);

    for (let i = 0; i < driversToCreate; i++) {
      const { firstName, lastName, fullName } = generateNigerianName();
      const vehicleType = faker.helpers.arrayElement([
        VehicleType.BIKE,
        VehicleType.TRICYCLE,
        VehicleType.CAR
      ]);

      // Select appropriate vehicle brand based on type
      let vehicleBrand: string;
      switch (vehicleType) {
        case VehicleType.BIKE:
          vehicleBrand = faker.helpers.arrayElement(bikeBrands);
          break;
        case VehicleType.TRICYCLE:
          vehicleBrand = faker.helpers.arrayElement(tricycleBrands);
          break;
        case VehicleType.CAR:
          vehicleBrand = faker.helpers.arrayElement(carBrands);
          break;
      }

      // Create user
      const user = userRepository.create({
        firebaseUid: `seed-driver-${faker.string.uuid()}`,
        role: UserRole.DRIVER,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone: generateNigerianPhone(),
        displayName: fullName,
        photoUrl: generateAvatarUrl(fullName),
        isActive: true,
      });

      const savedUser = await userRepository.save(user);

      // Create driver profile
      const driverProfile = driverProfileRepository.create({
        userId: savedUser.id,
        vehicleType,
        vehicleBrand,
        vehicleColor: faker.helpers.arrayElement(vehicleColors),
        licensePlate: generateLicensePlate(),
        communityHome: faker.helpers.arrayElement(nigerianCommunities),
        bio: faker.lorem.paragraph({ min: 2, max: 4 }),
        isVerified: faker.datatype.boolean({ probability: 0.7 }), // 70% verified
        averageRating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
        ratingCount: faker.number.int({ min: 5, max: 150 }),
        areasOfOperation: generateAreasOfOperation(),
        hoursOnline: parseFloat(faker.number.float({ min: 10, max: 500, fractionDigits: 2 }).toFixed(2)),
        profileVisits: faker.number.int({ min: 50, max: 2000 }),
        totalRides: faker.number.int({ min: 20, max: 500 }),
      });

      const savedDriverProfile = await driverProfileRepository.save(driverProfile);

      // Create driver presence
      const isOnline = faker.datatype.boolean({ probability: 0.3 }); // 30% online
      const driverPresence = driverPresenceRepository.create({
        driverProfileId: savedDriverProfile.id,
        isOnline,
        lastSeenAt: faker.date.recent({ days: 7 }),
        lastLat: isOnline ? faker.location.latitude({ min: 6.3, max: 6.7 }) : null, // Lagos area
        lastLng: isOnline ? faker.location.longitude({ min: 3.2, max: 3.6 }) : null,
        lastAccuracyM: isOnline ? faker.number.float({ min: 5, max: 50, fractionDigits: 1 }) : null,
        lastHeading: isOnline ? faker.number.float({ min: 0, max: 360, fractionDigits: 1 }) : null,
        lastSpeedMps: isOnline ? faker.number.float({ min: 0, max: 15, fractionDigits: 1 }) : null,
      });

      await driverPresenceRepository.save(driverPresence);

      createdDrivers.push({
        name: fullName,
        vehicleType,
        community: driverProfile.communityHome,
        isOnline,
        rating: driverProfile.averageRating,
      });

      console.log(`✅ Created driver ${i + 1}/${driversToCreate}: ${fullName} (${vehicleType})`);
    }

    console.log('\n📊 Seed Summary:');
    console.log(`   Total drivers created: ${createdDrivers.length}`);
    console.log(`   Online drivers: ${createdDrivers.filter(d => d.isOnline).length}`);
    console.log(`   Offline drivers: ${createdDrivers.filter(d => !d.isOnline).length}`);
    
    const byVehicleType = createdDrivers.reduce((acc, d) => {
      acc[d.vehicleType] = (acc[d.vehicleType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n   By vehicle type:');
    Object.entries(byVehicleType).forEach(([type, count]) => {
      console.log(`     ${type}: ${count}`);
    });

    console.log('\n✨ Driver seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding drivers:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the seed
seedDrivers()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed failed:', error);
    process.exit(1);
  });

