import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class InitialSchema1736000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'firebase_uid',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['PASSENGER', 'DRIVER', 'ADMIN'],
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'display_name',
            type: 'varchar',
          },
          {
            name: 'photo_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_firebase_uid',
        columnNames: ['firebase_uid'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'passenger_profiles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isUnique: true,
          },
          {
            name: 'default_community',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'passenger_profiles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'passenger_profiles',
      new TableIndex({
        name: 'IDX_passenger_profiles_user_id',
        columnNames: ['user_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'driver_profiles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isUnique: true,
          },
          {
            name: 'vehicle_type',
            type: 'enum',
            enum: ['BIKE', 'TRICYCLE', 'CAR'],
          },
          {
            name: 'vehicle_brand',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'vehicle_color',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'license_plate',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'community_home',
            type: 'varchar',
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'average_rating',
            type: 'numeric',
            precision: 2,
            scale: 1,
            default: 0,
          },
          {
            name: 'rating_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'driver_profiles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'driver_profiles',
      new TableIndex({
        name: 'IDX_driver_profiles_user_id',
        columnNames: ['user_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'driver_documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'driver_profile_id',
            type: 'uuid',
          },
          {
            name: 'doc_type',
            type: 'enum',
            enum: ['ID_CARD', 'DRIVER_LICENSE', 'VEHICLE_PAPERS', 'OTHER'],
          },
          {
            name: 'file_url',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: "'PENDING'",
          },
          {
            name: 'reviewed_by_user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reviewed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'driver_documents',
      new TableForeignKey({
        columnNames: ['driver_profile_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'driver_profiles',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'driver_documents',
      new TableForeignKey({
        columnNames: ['reviewed_by_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'driver_presence',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'driver_profile_id',
            type: 'uuid',
            isUnique: true,
          },
          {
            name: 'is_online',
            type: 'boolean',
            default: false,
          },
          {
            name: 'last_seen_at',
            type: 'timestamp',
          },
          {
            name: 'last_lat',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'last_lng',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'last_accuracy_m',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'last_heading',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'last_speed_mps',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'driver_presence',
      new TableForeignKey({
        columnNames: ['driver_profile_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'driver_profiles',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'driver_presence',
      new TableIndex({
        name: 'IDX_driver_presence_driver_profile_id',
        columnNames: ['driver_profile_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'driver_presence',
      new TableIndex({
        name: 'IDX_driver_presence_is_online',
        columnNames: ['is_online'],
      }),
    );

    await queryRunner.createIndex(
      'driver_presence',
      new TableIndex({
        name: 'IDX_driver_presence_last_seen_at',
        columnNames: ['last_seen_at'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'driver_location_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'driver_profile_id',
            type: 'uuid',
          },
          {
            name: 'lat',
            type: 'double precision',
          },
          {
            name: 'lng',
            type: 'double precision',
          },
          {
            name: 'accuracy_m',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'heading',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'speed_mps',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'recorded_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'driver_location_history',
      new TableForeignKey({
        columnNames: ['driver_profile_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'driver_profiles',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'driver_location_history',
      new TableIndex({
        name: 'IDX_driver_location_history_driver_profile_id_recorded_at',
        columnNames: ['driver_profile_id', 'recorded_at'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'communities',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'state',
            type: 'varchar',
          },
          {
            name: 'lga',
            type: 'varchar',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'center_lat',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'center_lng',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'communities',
      new TableIndex({
        name: 'IDX_communities_state_lga_name',
        columnNames: ['state', 'lga', 'name'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'reviews',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'driver_profile_id',
            type: 'uuid',
          },
          {
            name: 'passenger_user_id',
            type: 'uuid',
          },
          {
            name: 'rating',
            type: 'integer',
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'reviews',
      new TableForeignKey({
        columnNames: ['driver_profile_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'driver_profiles',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'reviews',
      new TableForeignKey({
        columnNames: ['passenger_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'reviews',
      new TableIndex({
        name: 'IDX_reviews_driver_profile_id_created_at',
        columnNames: ['driver_profile_id', 'created_at'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'audit_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'event_type',
            type: 'varchar',
          },
          {
            name: 'payload_json',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'audit_events',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex(
      'audit_events',
      new TableIndex({
        name: 'IDX_audit_events_user_id_created_at',
        columnNames: ['user_id', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_events');
    await queryRunner.dropTable('reviews');
    await queryRunner.dropTable('communities');
    await queryRunner.dropTable('driver_location_history');
    await queryRunner.dropTable('driver_presence');
    await queryRunner.dropTable('driver_documents');
    await queryRunner.dropTable('driver_profiles');
    await queryRunner.dropTable('passenger_profiles');
    await queryRunner.dropTable('users');
  }
}

