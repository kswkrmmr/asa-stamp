#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/3f0290b03247bc35889145a68e61650114cc4e0b356b5b269147db7691837c45/contract';
import endContract from '../../snapshots/3f0290b03247bc35889145a68e61650114cc4e0b356b5b269147db7691837c45/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'adminSetting',
        columns: [
          col('endHour', 'int4', {
            notNull: true,
            default: lit(9),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('endMinute', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('startHour', 'int4', {
            notNull: true,
            default: lit(6),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('startMinute', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'stamp',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('stampedOn', 'date', { notNull: true, codecRef: { codecId: 'pg/date-temporal@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'user',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'stamp',
        constraint: 'stamp_userId_stampedOn_key',
        columns: ['userId', 'stampedOn'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_name_key',
        columns: ['name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'stamp',
        index: 'stamp_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'stamp',
        foreignKey: {
          name: 'stamp_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
