import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TraggetUserMenuCountsService {
  private traggetUserMenuCountsSubject = new Subject<any>();

  constructor() { }

  setTraggetUserMenuCounts(traggetUserMenuCounts: any) {
    localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(traggetUserMenuCounts));
    this.traggetUserMenuCountsSubject.next(traggetUserMenuCounts);
  }

  getTraggetUserMenuCounts(): Observable<any> {
    const traggetUserMenuCounts = JSON.parse(localStorage.getItem('TraggetUserMenuCounts') || '{}');
    this.traggetUserMenuCountsSubject.next(traggetUserMenuCounts);
    return this.traggetUserMenuCountsSubject.asObservable();
  }
}
