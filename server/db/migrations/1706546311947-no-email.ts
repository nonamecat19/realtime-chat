import {MigrationInterface, QueryRunner} from 'typeorm';

export class NoEmail1706546311947 implements MigrationInterface {
  name = 'NoEmail1706546311947';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`email\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` ADD \`email\` varchar(50) NOT NULL`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\` (\`email\`)`
    );
  }
}
