import { remove, statSync } from 'fs-extra';
import { join } from 'path';
import { add, clear, list, show } from '../cache';
import { Config } from '../config';

const fixtures = join(__dirname, '../__fixtures__');
const cache = join(fixtures, 'cache');
const output = join(fixtures, 'output');

const config: Config = {
  base: fixtures,
  cache,
  output
};

afterAll(async () => {
  await remove(cache);
});

test('should add to cache', async () => {
  await add('abc', config);

  const cacheDir = join(cache, 'abc');
  expect(statSync(cacheDir).isDirectory()).toBe(true);
});

test('should show in cache', async () => {
  await add('abc', config);

  expect(await show('abc', config)).toBe(join(cache, 'abc'));
  expect(await show('def', config)).toBe(undefined);
});

test('should list cache', async () => {
  await add('abc', config);
  await add('def', config);

  const expected = {
    abc: join(cache, 'abc'),
    def: join(cache, 'def')
  };
  expect(await list(config)).toEqual(expected);
});

test('should clear cache', async () => {
  await remove(cache);
  await add('abc', config);
  expect(await list(config)).toEqual({ abc: join(cache, 'abc') });

  await clear(config);
  expect(await list(config)).toEqual({});
});
