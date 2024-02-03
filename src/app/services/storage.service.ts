import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  storeItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  retrieveItem(key: string): string | null {
    return localStorage.getItem(key);
  }
}
