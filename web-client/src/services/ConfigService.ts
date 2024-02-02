class ConfigService {
  public readonly apiUrl = import.meta.env.VITE_BASE_API_URL;
  public readonly tokenKey = 'accessToken';
}

const configService = new ConfigService();
Object.freeze(configService);
export {configService};
