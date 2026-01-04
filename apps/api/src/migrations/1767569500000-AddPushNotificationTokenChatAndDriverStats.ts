import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPushNotificationTokenChatAndDriverStats1767569500000
  implements MigrationInterface
{
  name = 'AddPushNotificationTokenChatAndDriverStats1767569500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "push_notification_token" varchar`,
    );
    await queryRunner.query(
      `CREATE TABLE "conversations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "participant1_id" uuid NOT NULL, "participant2_id" uuid NOT NULL, "last_message_id" uuid, "last_message_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8bbf06c10c1ea19f1fcd2c72ecb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_conversations_participant1_participant2" ON "conversations" ("participant1_id", "participant2_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_conversations_participant1" ON "conversations" ("participant1_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_conversations_participant2" ON "conversations" ("participant2_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_conversations_updated_at" ON "conversations" ("updated_at")`,
    );
    await queryRunner.query(
      `CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversation_id" uuid NOT NULL, "sender_id" uuid NOT NULL, "content" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_messages_conversation_created" ON "messages" ("conversation_id", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_messages_sender" ON "messages" ("sender_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_messages_created_at" ON "messages" ("created_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_profiles" ADD "areas_of_operation" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_profiles" ADD "hours_online" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_profiles" ADD "profile_visits" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_profiles" ADD "total_rides" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD CONSTRAINT "FK_conversations_participant1" FOREIGN KEY ("participant1_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD CONSTRAINT "FK_conversations_participant2" FOREIGN KEY ("participant2_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_messages_conversation" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_messages_sender" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_sender"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_conversation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP CONSTRAINT "FK_conversations_participant2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP CONSTRAINT "FK_conversations_participant1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_profiles" DROP COLUMN "total_rides"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_profiles" DROP COLUMN "profile_visits"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_profiles" DROP COLUMN "hours_online"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_profiles" DROP COLUMN "areas_of_operation"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_messages_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_messages_sender"`);
    await queryRunner.query(`DROP INDEX "IDX_messages_conversation_created"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP INDEX "IDX_conversations_updated_at"`);
    await queryRunner.query(`DROP INDEX "IDX_conversations_participant2"`);
    await queryRunner.query(`DROP INDEX "IDX_conversations_participant1"`);
    await queryRunner.query(
      `DROP INDEX "IDX_conversations_participant1_participant2"`,
    );
    await queryRunner.query(`DROP TABLE "conversations"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "push_notification_token"`,
    );
  }
}
