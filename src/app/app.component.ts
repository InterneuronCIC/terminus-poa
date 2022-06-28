//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2022  Interneuron CIC

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

//See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.If not, see<http://www.gnu.org/licenses/>.
//END LICENSE BLOCK 
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild, ElementRef, OnDestroy, isDevMode, OnInit, HostListener } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
// import { isArray } from 'util';
import { action, DataContract, filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from './models/filter.model';
import { ApirequestService } from './services/apirequest.service';
import { AppService } from './services/app.service';
import { SubjectsService } from './services/subjects.service';
import { KeyValuePair } from './models/keyvaluepair';
import { ConfigService } from './services/config.service';
import { Console } from 'console';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import jwtDecode, { JwtDecodeOptions } from './../../node_modules/jwt-decode';
import { ConfirmationDialogService } from './confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  title = 'Pre-Operative Assessment';
  subscriptions: Subscription = new Subscription();
  //show: boolean = false;

  // @ViewChild(ToastContainerDirective, { static: true })
  // toastContainer: ToastContainerDirective;

  appContexts: object;

  isProduction: boolean;
  showDevSearch: boolean = true;
  searchClass: string = "col-md-3";
  mainClass: string = "col-md-9";


  @Input() set datacontract(value: DataContract) {

    this.appService.reset();
   // GlobalConstants.globalDatContract = value;
    this.appContexts = value.contexts[0];
    //console.log(this.appContexts);
    this.appService.personId = this.appContexts["person_id"];
    this.appService.encounterId= this.appContexts["encounter_id"] ? this.appContexts["encounter_id"] : "No encounter";
    this.appService.apiService = value.apiService;
    this.appService.contexts = this.appContexts;
    this.subjects.unload = value.unload;
    this.initConfigAndGetMeta(this.appService.apiService);
  }

  @Output() frameworkAction = new EventEmitter<string>();

  // scrollBarEvent(event: any) {
  //   console.log("scrollBarEvent:" + event);
  //   alert(event);
  // }

  constructor(private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService, private modalService: BsModalService, private configService: ConfigService, private toastrService: ToastrService, private confirmationDialogService: ConfirmationDialogService) {

    this.subscriptions.add(
      this.subjects.frameworkEvent.subscribe(
        (e: string) => { this.emitFrameworkEvent(e)}
      )
    );

    console.log("Enviroment" + environment.production);
    this.isProduction = environment.production;
    if (!environment.production) {
      this.initDevMode();
    }
  }



  onActivate(event) {
    let scrollToTop = window.setInterval(() => {
        let pos = window.pageYOffset;
        if (pos > 0) {
            window.scrollTo(0, pos - 20); // how far to scroll on each step
        } else {
            window.clearInterval(scrollToTop);
        }
    }, 16);
}


  ngOnInit(): void {
    //this.toastrService.overlayContainer = this.toastContainer;
    //console.log('Terminus Dev Starter Loaded');
  }

  emitFrameworkEvent(e: string) {
    this.frameworkAction.emit(e);
  }




  async initDevMode() {


    //Set initial patient
    //this.appService.personId = 'ef9856bb-88cf-4de2-bdf9-78c8d1c055fa';


    //this.appService.contexts = this.appContexts;

    let value: any = {};
    value.authService = {};
    value.authService.user = {};
    let auth = this.apiRequest.authService;

    await auth.getToken().then((token) => {
      value.authService.user.access_token = token;

      let decodedToken: any;
      decodedToken = this.appService.decodeAccessToken(token);

      this.initConfigAndGetMeta(value);

          this.appService.enableLogging = this.appService.appConfig.enablelogging;
          this.appService.loggedInUserName = 'Dev user';



    });




  }


  async checkLockedOrBlocked() {
    if(this.appService.authoriseAction('Edit POA')) {
      this.appService.blocked = false;
    }
    else
    {
      this.appService.blocked = true;
    }

    if(this.appService.blocked || this.appService.locked) {
      this.appService.lockedOrBlocked = true;
    }
    else
    {
      this.appService.lockedOrBlocked = false;
    }
  }




  async initConfigAndGetMeta(value: any) {

    this.appService.apiService = value;
    let decodedToken: any;
    if (this.appService.apiService) {
      decodedToken = this.appService.decodeAccessToken(this.appService.apiService.authService.user.access_token);
      if (decodedToken != null)
        this.appService.loggedInUserName = decodedToken.name ? (Array.isArray(decodedToken.name) ? decodedToken.name[0] : decodedToken.name) : decodedToken.IPUId;

    }
    await this.subscriptions.add(this.apiRequest.getRequest("./assets/config/terminus-poa-config.json?V" + Math.random()).subscribe(
      async (response) => {
        this.appService.appConfig = response;

        this.appService.baseURI = this.appService.appConfig.uris.baseuri;
        this.appService.terminologyURI = this.appService.appConfig.uris.terminologyuri;
        this.appService.carerecordURI = this.appService.appConfig.uris.carerecorduri;
        this.appService.autonomicURI = this.appService.appConfig.uris.autonomicuri;
        this.appService.imageserverURI = this.appService.appConfig.uris.imageserveruri;
        this.appService.identityserverURI = this.appService.appConfig.uris.identityserveruri;
        this.appService.currentMedicationModuleURI = this.appService.appConfig.uris.currentmedsmoduleuri;
        //console.log(this.appService.appConfig.uris.baseuri);
        this.appService.enableLogging = this.appService.appConfig.enablelogging;

        //console.log(this.createRoleFilter(decodedToken));

        //get actions for rbac
        await this.subscriptions.add(this.apiRequest.postRequest(`${this.appService.baseURI}/GetBaseViewListByPost/rbac_actions`, this.createRoleFilter(decodedToken))
          .subscribe((response: action[]) => {
            this.appService.roleActions = response;
            //  console.log(this.appService.roleActions);
            //  this.appService.logToConsole(response);
            this.checkLockedOrBlocked();

          }));

       // await this.getMetaData();

        //get all meta before emitting events
        //all components depending on meta should perform any action only after receiveing these events
        //use await on requets that are mandatory before the below events can be fired.

        //emit events after getting initial config. //this happens on first load only.
        this.appService.logToConsole("Service reference is being published from init config");
        this.subjects.apiServiceReferenceChange.next();
        this.appService.logToConsole("personid is being published from init config");
        this.subjects.personIdChange.next();



      }));

  }



  // async initConfigAndGetMeta(value: any) {

  //   this.appService.apiService = value;
  //   let decodedToken: any;
  //   if (this.appService.apiService) {
  //     decodedToken = this.appService.decodeAccessToken(this.appService.apiService.authService.user.access_token);
  //     if (decodedToken != null)
  //       this.appService.loggedInUserName = decodedToken.name ? (isArray(decodedToken.name) ? decodedToken.name[0] : decodedToken.name) : decodedToken.IPUId;

  //   }
  //   await this.subscriptions.add(this.apiRequest.getRequest(this.configService.getConfigURL()).subscribe(
  //     async (response) => {
  //       this.appService.appConfig = response;
  //       this.appService.baseURI = this.appService.appConfig.uris.baseuri;

  //       this.appService.enableLogging = this.appService.appConfig.enablelogging;

  //       //get actions for rbac
  //       await this.subscriptions.add(this.apiRequest.postRequest(`${this.appService.baseURI}/GetBaseViewListByPost/rbac_actions`, this.createRoleFilter(decodedToken))
  //         .subscribe((response: action[]) => {
  //           this.appService.roleActions = response;
  //           this.appService.logToConsole(response);
  //         }));

  //      //await this.getMetaData();

  //       //get all meta before emitting events
  //       //all components depending on meta should perform any action only after receiveing these events
  //       //use await on requets that are mandatory before the below events can be fired.

  //       //emit events after getting initial config. //this happens on first load only.
  //       this.appService.logToConsole("Service reference is being published from init config");
  //       this.subjects.apiServiceReferenceChange.next();
  //       this.appService.logToConsole("personid is being published from init config");
  //       this.subjects.personIdChange.next();



  //     }));

  // }

  createRoleFilter(decodedToken: any) {

    let condition = "";
    let pm = new filterParams();
    let synapseroles;
    if (environment.production)
      synapseroles = decodedToken.SynapseRoles
    else
      synapseroles = decodedToken.client_SynapseRoles
    if (!Array.isArray(synapseroles)) {
      condition = "rolename = @rolename";
      pm.filterparams.push(new filterparam("rolename", synapseroles));
    }
    else
      for (var i = 0; i < synapseroles.length; i++) {
        condition += "or rolename = @rolename" + i + " ";
        pm.filterparams.push(new filterparam("rolename" + i, synapseroles[i]));
      }
    condition = condition.replace(/^\or+|\or+$/g, '');
    let f = new filters();
    f.filters.push(new filter(condition));


    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY 1");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    this.appService.logToConsole(JSON.stringify(body));
    return JSON.stringify(body);
  }

  toggleDevSearch() {
    this.showDevSearch = !this.showDevSearch;

    if(this.showDevSearch) {
      this.searchClass = "col-md-3";
      this.mainClass = "col-md-9";
    }
    else {
      this.searchClass = "hidden";
      this.mainClass = "col-md-12";
    }

  }

  ngOnDestroy() {
    this.appService.logToConsole("app component being unloaded");
    this.appService.encounterId = null;
    this.appService.personId = null;
    this.appService.isCurrentEncouner = null;
    this.appService.reset();
    this.subscriptions.unsubscribe();
    this.subjects.unload.next("app-terminus-poa");
  }

  topPosToStartShowing = 100;
  isShow: boolean;
  @HostListener('window:scroll')
  checkScroll() {

    // window의 scroll top
    // Both window.pageYOffset and document.documentElement.scrollTop returns the same result in all the cases. window.pageYOffset is not supported below IE 9.

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    //console.log('[scroll]', scrollPosition);

    if (scrollPosition >= this.topPosToStartShowing) {
      this.isShow = true;
    } else {
      this.isShow = false;
    }


  }

  // TODO: Cross browsing
  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }


}
