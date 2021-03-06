import { Component, DoCheck } from '@angular/core';
import { ToastyConfig } from 'ng2-toasty';
import { AuthService } from './auth/auth.service';
import { Renderer2 } from '@angular/core';
import { OnInit } from '@angular/core';

import { SecurityInfo } from './shared/model/about/security-info.model';
import { SharedAboutService } from './shared/services/shared-about.service';
import { Observable } from 'rxjs/Observable';
import { AboutInfo } from './shared/model/about/about-info.model';
import { BusyService } from './shared/services/busy.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements DoCheck, OnInit {

  public securityInfo: SecurityInfo;
  public dataflowVersionInfo$: Observable<AboutInfo>;

  public isCollapsed = true;
  public busy: any = [];

  constructor(private toastyConfig: ToastyConfig,
      private renderer: Renderer2,
      private authService: AuthService,
      private busyService: BusyService,
      private sharedAboutService: SharedAboutService) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.limit = 5;
    this.toastyConfig.showClose = true;
    this.toastyConfig.position  =  'top-right';
    this.toastyConfig.timeout   = 3000;

    this.securityInfo = authService.securityInfo;
  }

  ngDoCheck() {
    this.securityInfo = this.authService.securityInfo;
  }

  ngOnInit() {
    this.dataflowVersionInfo$ = this.sharedAboutService.getAboutInfo();
    this.renderer.listen('document', 'scroll', (evt) => {
      this.updateToasty();
    });
    this.renderer.listen('document', 'resize', (evt) => {
      this.updateToasty();
    });
    this.updateToasty();

    this.busyService.busyObjects$.forEach(busyObject => {
      if (busyObject) {
        while (busyObject.length > 0) {
          /*
           * Unfortunately, Angular2 Busy does not support
           * "Overlapping Subscriptions" and does not work
           * with mutable arrays. Ideally, good Spinner solution
           * would be able to accept a BehaviorSubject<boolean> as input,
           * so that we could manage the on/off state of the spinner on
           * our end.
           *
           * see: https://github.com/devyumao/angular2-busy/issues/77
           */
          this.busy = [];
          this.busy.push(busyObject.pop());
        }
      }
    });

  }

  private updateToasty() {
    const bodyScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const navHeight = document.getElementsByTagName('nav')[0].offsetHeight;
    let marginToParent = 10;
    const toastyElement = document.getElementById('toasty');

    if (window.outerWidth <= 768) {
      marginToParent = 0;
    }

    if (bodyScrollTop > navHeight) {
      toastyElement.style.top = marginToParent + 'px';
    } else if (bodyScrollTop >= 0) {
      const distance = navHeight - bodyScrollTop;
      toastyElement.style.top = distance + marginToParent + 'px';
    }
  }

  public toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  public collapse(): void {
    if (!this.isCollapsed) {
      this.isCollapsed = true;
    }
  }
}
