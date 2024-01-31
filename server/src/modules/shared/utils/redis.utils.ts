import Redis from 'ioredis';

export async function getAllRedisData(
  redis: Redis,
  pattern: string = '*'
): Promise<Record<string, any>> {
  const result = {};
  const keys = await getRedisKeys(redis, pattern);

  for (const key of keys) {
    result[key] = await getValueByKey(redis, key);
  }
  return result;
}

async function getRedisKeys(redis: Redis, pattern: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    redis.keys(pattern, (err: Error, keys: string[]) => {
      if (err) {
        reject(err);
      }
      resolve(keys);
    });
  });
}

async function getValueByKey(redis: Redis, key: string) {
  return new Promise((resolve, reject) => {
    redis.get(key, (err: Error, value: string) => {
      if (err) {
        reject(err);
      }
      resolve(value);
    });
  });
}
