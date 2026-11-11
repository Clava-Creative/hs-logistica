import * as migration_20261111_193630_inicial from './20261111_193630_inicial';

export const migrations = [
  {
    up: migration_20261111_193630_inicial.up,
    down: migration_20261111_193630_inicial.down,
    name: '20261111_193630_inicial'
  },
];
