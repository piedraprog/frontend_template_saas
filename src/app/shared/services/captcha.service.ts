import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CaptchaService {
  constructor() {}

  confirmCaptcha() {
    console.log('confirmCaptcha');
  }
}
