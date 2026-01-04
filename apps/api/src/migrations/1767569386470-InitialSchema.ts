import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1767569386470 implements MigrationInterface {
  name = 'InitialSchema1767569386470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM('PASSENGER', 'DRIVER', 'ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "vehicle_type_enum" AS ENUM('BIKE', 'TRICYCLE', 'CAR')`,
    );
    await queryRunner.query(
      `CREATE TYPE "document_type_enum" AS ENUM('ID_CARD', 'DRIVER_LICENSE', 'VEHICLE_PAPERS', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "document_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );

    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firebase_uid" varchar NOT NULL, "role" "user_role_enum" NOT NULL, "email" varchar, "phone" varchar, "display_name" varchar NOT NULL, "photo_url" varchar, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_users_firebase_uid" UNIQUE ("firebase_uid"), CONSTRAINT "PK_users" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_firebase_uid" ON "users" ("firebase_uid")`,
    );

    await queryRunner.query(
      `CREATE TABLE "passenger_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "default_community" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_passenger_profiles_user_id" UNIQUE ("user_id"), CONSTRAINT "PK_passenger_profiles" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_passenger_profiles_user_id" ON "passenger_profiles" ("user_id")`,
    );

    await queryRunner.query(
      `CREATE TABLE "driver_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "vehicle_type" "vehicle_type_enum" NOT NULL, "vehicle_brand" varchar, "vehicle_color" varchar, "license_plate" varchar, "community_home" varchar NOT NULL, "bio" text, "is_verified" boolean NOT NULL DEFAULT false, "average_rating" numeric(2,1) NOT NULL DEFAULT '0', "rating_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_driver_profiles_user_id" UNIQUE ("user_id"), CONSTRAINT "UQ_driver_profiles_license_plate" UNIQUE ("license_plate"), CONSTRAINT "PK_driver_profiles" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_driver_profiles_user_id" ON "driver_profiles" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_driver_profiles_license_plate" ON "driver_profiles" ("license_plate") WHERE "license_plate" IS NOT NULL`,
    );

    await queryRunner.query(
      `CREATE TABLE "driver_presence" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "driver_profile_id" uuid NOT NULL, "is_online" boolean NOT NULL DEFAULT false, "last_seen_at" TIMESTAMP NOT NULL, "last_lat" double precision, "last_lng" double precision, "last_accuracy_m" double precision, "last_heading" double precision, "last_speed_mps" double precision, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_driver_presence_driver_profile_id" UNIQUE ("driver_profile_id"), CONSTRAINT "PK_driver_presence" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_driver_presence_driver_profile_id" ON "driver_presence" ("driver_profile_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_driver_presence_is_online" ON "driver_presence" ("is_online")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_driver_presence_last_seen_at" ON "driver_presence" ("last_seen_at")`,
    );

    await queryRunner.query(
      `CREATE TABLE "driver_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "driver_profile_id" uuid NOT NULL, "doc_type" "document_type_enum" NOT NULL, "file_url" text NOT NULL, "status" "document_status_enum" NOT NULL DEFAULT 'PENDING', "reviewed_by_user_id" uuid, "reviewed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_driver_documents" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE TABLE "driver_location_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "driver_profile_id" uuid NOT NULL, "lat" double precision NOT NULL, "lng" double precision NOT NULL, "accuracy_m" double precision, "heading" double precision, "speed_mps" double precision, "recorded_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_driver_location_history" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_driver_location_history_driver_profile_recorded" ON "driver_location_history" ("driver_profile_id", "recorded_at")`,
    );

    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "driver_profile_id" uuid NOT NULL, "passenger_user_id" uuid NOT NULL, "rating" integer NOT NULL, "comment" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_reviews" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_driver_profile_created" ON "reviews" ("driver_profile_id", "created_at")`,
    );

    await queryRunner.query(
      `CREATE TABLE "communities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "state" varchar NOT NULL, "lga" varchar NOT NULL, "name" varchar NOT NULL, "center_lat" double precision, "center_lng" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_communities_state_lga_name" UNIQUE ("state", "lga", "name"), CONSTRAINT "PK_communities" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE TABLE "audit_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "event_type" varchar NOT NULL, "payload_json" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_audit_events" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_events_user_id" ON "audit_events" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_events_event_type" ON "audit_events" ("event_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_events_created_at" ON "audit_events" ("created_at")`,
    );

    await queryRunner.query(
      `ALTER TABLE "passenger_profiles" ADD CONSTRAINT "FK_passenger_profiles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "driver_profiles" ADD CONSTRAINT "FK_driver_profiles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "driver_presence" ADD CONSTRAINT "FK_driver_presence_driver_profile" FOREIGN KEY ("driver_profile_id") REFERENCES "driver_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD CONSTRAINT "FK_driver_documents_driver_profile" FOREIGN KEY ("driver_profile_id") REFERENCES "driver_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD CONSTRAINT "FK_driver_documents_reviewed_by" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "driver_location_history" ADD CONSTRAINT "FK_driver_location_history_driver_profile" FOREIGN KEY ("driver_profile_id") REFERENCES "driver_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_reviews_driver_profile" FOREIGN KEY ("driver_profile_id") REFERENCES "driver_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_reviews_passenger_user" FOREIGN KEY ("passenger_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "audit_events" ADD CONSTRAINT "FK_audit_events_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "audit_events" DROP CONSTRAINT "FK_audit_events_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_passenger_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_driver_profile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_location_history" DROP CONSTRAINT "FK_driver_location_history_driver_profile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP CONSTRAINT "FK_driver_documents_reviewed_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP CONSTRAINT "FK_driver_documents_driver_profile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_presence" DROP CONSTRAINT "FK_driver_presence_driver_profile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_profiles" DROP CONSTRAINT "FK_driver_profiles_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "passenger_profiles" DROP CONSTRAINT "FK_passenger_profiles_user"`,
    );

    await queryRunner.query(`DROP INDEX "IDX_audit_events_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_events_event_type"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_events_user_id"`);
    await queryRunner.query(`DROP TABLE "audit_events"`);
    await queryRunner.query(`DROP TABLE "communities"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_driver_profile_created"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(
      `DROP INDEX "IDX_driver_location_history_driver_profile_recorded"`,
    );
    await queryRunner.query(`DROP TABLE "driver_location_history"`);
    await queryRunner.query(`DROP TABLE "driver_documents"`);
    await queryRunner.query(`DROP INDEX "IDX_driver_presence_last_seen_at"`);
    await queryRunner.query(`DROP INDEX "IDX_driver_presence_is_online"`);
    await queryRunner.query(`DROP INDEX "IDX_driver_presence_driver_profile_id"`);
    await queryRunner.query(`DROP TABLE "driver_presence"`);
    await queryRunner.query(
      `DROP INDEX "IDX_driver_profiles_license_plate"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_driver_profiles_user_id"`);
    await queryRunner.query(`DROP TABLE "driver_profiles"`);
    await queryRunner.query(`DROP INDEX "IDX_passenger_profiles_user_id"`);
    await queryRunner.query(`DROP TABLE "passenger_profiles"`);
    await queryRunner.query(`DROP INDEX "IDX_users_firebase_uid"`);
    await queryRunner.query(`DROP TABLE "users"`);

    await queryRunner.query(`DROP TYPE "document_status_enum"`);
    await queryRunner.query(`DROP TYPE "document_type_enum"`);
    await queryRunner.query(`DROP TYPE "vehicle_type_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
