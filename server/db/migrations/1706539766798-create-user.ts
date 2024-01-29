import {MigrationInterface, QueryRunner} from 'typeorm';

export class CreateUser1706539766798 implements MigrationInterface {
  name = 'CreateUser1706539766798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`role\` enum ('ADMIN', 'USER') NOT NULL DEFAULT 'USER', \`nickname\` varchar(30) NOT NULL, \`email\` varchar(50) NOT NULL, \`password\` varchar(255) NOT NULL, \`nicknameColorHEX\` varchar(255) NOT NULL, \`isBanned\` tinyint NOT NULL DEFAULT 0, \`isMuted\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_e2364281027b926b879fa2fa1e\` (\`nickname\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
    await queryRunner.query(`DROP INDEX \`IDX_e2364281027b926b879fa2fa1e\` ON \`user\``);
    await queryRunner.query(`DROP TABLE \`user\``);
  }
}
