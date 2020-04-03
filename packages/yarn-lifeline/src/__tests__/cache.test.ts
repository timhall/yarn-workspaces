import { remove, statSync } from 'fs-extra';
import { join } from 'path';
import { add, clear, evictOutdated, list, show } from '../cache';
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

  const value = await list(config);
  expect(value.abc.path).toEqual(join(cache, 'abc'));
  expect(value.def.path).toEqual(join(cache, 'def'));
});

test('should clear cache', async () => {
  await remove(cache);
  await add('abc', config);
  expect((await list(config)).abc.path).toEqual(join(cache, 'abc'));

  await clear(config);
  expect(await list(config)).toEqual({});
});

test('should evict outdated', async () => {
  await remove(cache);
  await add('abc', config);
  await add('def', config);
  await add('ghi', config);

  let value = await list(config);
  expect(Object.keys(value)).toEqual(['abc', 'def', 'ghi']);

  await evictOutdated(config, 2);

  value = await list(config);
  expect(Object.keys(value)).toEqual(['def', 'ghi']);
});
