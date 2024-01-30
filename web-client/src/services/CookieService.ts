import Cookies from 'js-cookie';

export class CookieService {
  private readonly TOKEN_KEY = 'accessToken';

  public setToken(token: string) {
    Cookies.set(this.TOKEN_KEY, token, {
      expires: 14,
      secure: true,
    });
  }

  public getToken(): string | null {
    return Cookies.get(this.TOKEN_KEY) || null;
  }
}
