import { Injectable, Inject } from '@angular/core';
import { Subject,BehaviorSubject,Observable } from "rxjs";
import { DOCUMENT } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {

  private screen = new Subject();
  public screenWidth: string = '';


    constructor(
      @Inject(DOCUMENT) private document: Document,) {
        this.checkWidth();
    }

    onMobileChange(status: string) {
        this.screen.next(status);
    }

    getMobileStatus(): Observable<any> {
        return this.screen.asObservable();
    }

    public checkWidth(type:any='') {
        var width = window.innerWidth;
        if(type==''){
          if (width <= 768) {
            this.screenWidth = 'mobile';
            this.onMobileChange('mobile');
            this.loadStyle('mobile.css');
          } else if (width > 768 && width <= 992) {
            this.screenWidth = 'tablet';
            this.onMobileChange('desktop');
            this.loadStyle('desktop.css');
          } else {
            this.screenWidth = 'desktop';
            this.onMobileChange('desktop');
            this.loadStyle('desktop.css');
          }
        }else if(type=='driver'){

          if (width <= 768) {
            this.screenWidth = 'mobile';
            this.onMobileChange('mobile');
            this.loadStyle('driver-mobile-style.css');
          } else if (width > 768 && width <= 992) {
            this.screenWidth = 'tablet';
            this.onMobileChange('desktop');
            this.loadStyle('driver-desktop-style.css');
          } else {
            this.screenWidth = 'desktop';
            this.onMobileChange('desktop');
            this.loadStyle('driver-desktop-style.css');
          }
        }
      
    }

    loadStyle(styleName: string) {
      const head = this.document.getElementsByTagName('head')[0];
  
      let themeLink = this.document.getElementById(
        'adoptive-theme'
      ) as HTMLLinkElement;
      if (themeLink) {
        themeLink.href = styleName;
      } else {
        const style = this.document.createElement('link');
        style.id = 'adoptive-theme';
        style.rel = 'stylesheet';
        style.type="text/css";
        style.href = `${styleName}`;
  
        head.appendChild(style);
      }
    }
}
