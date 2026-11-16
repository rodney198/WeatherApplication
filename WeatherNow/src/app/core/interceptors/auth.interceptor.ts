/**
 * WeatherNow - HTTP Auth Interceptor (Function-based)
 * Injects the API key into weather API requests.
 * Never exposes credentials in source code.
 */

import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  // Only add API key to weather API requests
  if (req.url.includes('api.openweathermap.org')) {
    const apiKey = environment.weatherApiKey;
    if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
      const cloned = req.clone({
        setParams: { appid: apiKey },
      });
      return next(cloned);
    }
  }
  return next(req);
};