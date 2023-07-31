//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2023  Interneuron Holdings Ltd

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
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormioAppConfig, FormioForm, FormioOptions } from 'angular-formio';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { Person } from '../models/entities/core-person.model';
import { FormBuilderForm } from '../models/entities/form-builder-form';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { ConfigService } from '../services/config.service';
import { SubjectsService } from '../services/subjects.service';
import { ToasterService } from '../services/toaster-service.service';
import jwtDecode, { JwtDecodeOptions } from '../../../node_modules/jwt-decode';
import { KeyValuePair } from '../models/keyvaluepair';
import { KeyValuePipe } from '@angular/common';
import { stringify } from '@angular/compiler/src/util';
import { FormResponse } from '../models/entities/form-response';
import { EventEmitter } from '@angular/core';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';


@Component({
  selector: 'app-dynamic-form-renderer',
  templateUrl: './dynamic-form-renderer.component.html',
  styleUrls: ['./dynamic-form-renderer.component.css']
})
export class DynamicFormRendererComponent implements OnInit, OnDestroy {


  //API Variables
  globalURL: string = this.appService.baseURI;
  careRecordURL: string = this.appService.carerecordURI;
  terminologyURL: string = this.appService.terminologyURI;
  autonomicURL: string = this.appService.autonomicURI;
  imageServerURL: string = this.appService.imageserverURI;

  constructor(private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService, private modalService: BsModalService, private httpClient: HttpClient , private spinner: NgxSpinnerService, private configService: ConfigService, private toasterService: ToasterService, private confirmationDialogService: ConfirmationDialogService) {



  }

  subscriptions: Subscription = new Subscription();
  formList: FormBuilderForm[];
  selectedFormId: string = null;
  selectedContext: string;
  currentlySelectedFormId: string = null;
  currentlySelectedForm: FormBuilderForm;
  contextKey: string;
  selectedContextType: string;
  formResponse: FormResponse;
  formVersion: number;
  showVersionWarning: boolean;

  showManualContext: boolean = false;

    //Form Builder Variables
    actionGetFormEndpoint: string;
    actionPostFormEndpoint: string;
    bearerAuthToken: string;
    submission: any;
    formComponents: any = [];
    formBuilderComponentsString: string;
    formBuilder: FormioForm;
    generatedForm: FormioForm;
    formName: string;
    appContexts: any;
    triggerRefresh: EventEmitter<unknown>;

    public formioOptions: FormioOptions = {
      'disableAlerts': true
    };

    //public options: FormioOptions;
    options: Object = {
      submitMessage: "",
      disableAlerts: true,
      noAlerts: true,
      readOnly: true
    }


  private _personData: Person;
  @Input() set person(value: Person) {


    this.appContexts = this.appService.contexts;
    this.selectedContext = this.appContexts["person_id"];

    this.subscriptions.add(

      this.apiRequest.getRequest(this.appService.baseURI + '/GetBaseViewList/formbuilder_formbuilderlist?orderby=formname ASC')
      .subscribe((response) => {

        this.submission = null;
        this.formResponse = null;
        this.showVersionWarning = false;

        this.selectedFormId = null;
        this.getSelectedFormWithContext();
        var data = JSON.parse(response);
        this.formList = data;


      })



    )};
    get person(): Person { return this._personData; }


    getSelectedContextType():string {
      for (var key in this.appContexts) {
        // check if the property/key is defined in the object itself, not in parent
        if (this.appContexts.hasOwnProperty(key)) {
          if(this.appContexts[key] == this.selectedContext) {
            return key;
          }
        }
      }
    }

    buildContextKey(): string {
      var form = this.selectedFormId;
      var contextType = this.getSelectedContextType();
      var context = this.selectedContext;
      return form + '|' + contextType + '|' + context;
    }



    // buildSomethign(): string {
    //   // GetObjectWithInsert('core'', 'formbuilderresponse', '_contextkey', '1111-1111-1111', '1111-1111-1111' , true)
    // }



   async getSelectedFormWithContext() {

    this.generatedForm = null;
    this.submission = null;
    this.formVersion = 0;

    this.selectedContextType = this.getSelectedContextType();
    this.contextKey = this.buildContextKey();

    this.currentlySelectedFormId = this.selectedFormId;
    this.selectedFormId = null;
    await this.sleep(50);
    this.selectedFormId = this.currentlySelectedFormId;

    this.generatedForm = null;

    if(this.selectedFormId) {

    this.actionGetFormEndpoint = this.appService.baseURI + "/GetObject?synapsenamespace=meta&synapseentityname=formbuilderform&id=" + this.selectedFormId;
    this.actionPostFormEndpoint = this.appService.baseURI + "/PostObject?synapsenamespace=meta&synapseentityname=formbuilderform";

    this.bearerAuthToken = 'bearer '+ this.appService.apiService.authService.user.access_token;

    this.subscriptions.add(

      this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=meta&synapseentityname=formbuilderform&id='  + this.selectedFormId)
      .subscribe((response) => {
        var data = JSON.parse(response);
        this.currentlySelectedForm = data;
        this.formComponents = JSON.parse(data.formcomponents);

       // console.log(this.formComponents);

        this.formName = data.formname;
        this.showVersionWarning = false;

        this.formResponse = null;
        this.formVersion = data.version;

        var formResponseUri = "/GetObjectWithInsert/core/formbuilderresponse/_contextkey/" + this.contextKey + "/" + this.contextKey + "/true";
        this.apiRequest.getRequest(this.appService.baseURI + formResponseUri)
        .subscribe((data) => {
          this.formResponse = JSON.parse(data);



          if(!this.formResponse.formcomponents) {
            this.formResponse.formversion = this.formVersion;
            this.formResponse.formcomponents = this.currentlySelectedForm.formcomponents;
            this.formResponse.formversion = this.currentlySelectedForm.version;
            this.formResponse.responseversion = 0;
            this.formResponse.responsestatus = "New";
            this.formResponse.formresponse = '{"new":"new"}';
          }




          if(this.formVersion != this.formResponse.formversion) {
            this.showVersionWarning = true;
          }



          //console.log(this.formResponse.formresponse);
          //console.log(this.submission);

          this.generatedForm = {components: JSON.parse(this.formResponse.formcomponents)};


          this.submission = this.buildDataObject();



          // this.submission = {
          //   data: {
          //     whatIsYourName: 'Joe',
          //     doYouAgree: true
          //   }
          // };

        })



      })


    )

    }

   }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

   dataObjectString: any;
   initialdataObjectString: string;
   dataObject: any;

   buildDataObject() {

     this.dataObject = JSON.parse('{"data":' + this.formResponse.formresponse + '}') ;
     this.dataObject["data"]["configBearerAuthToken"] = this.bearerAuthToken;
     //this.dataObject["data"]["submit"] = false;

     this.dataObject["data"]["configGlobalURL"] = this.globalURL;
     this.dataObject["data"]["configAutonomicURL"] = this.autonomicURL;
     this.dataObject["data"]["configTerminologyURL"] = this.terminologyURL;
     this.dataObject["data"]["configImageServerURL"] = this.imageServerURL;
     this.dataObject["data"]["configCareRecordURL"] = this.careRecordURL;


     //this.dataObject["data"]["configUserUsername"] =  jwtDecode(this.appService.apiService.authService.user.access_token)["IPUId"];
     //this.dataObject["data"]["configUserDisplayName"] = jwtDecode(this.appService.apiService.authService.user.access_token)["name"];
     //console.log(this.dataObject);

     //delete this.dataObject["data"]["submit"];

     //console.log(this.dataObject);

     return this.dataObject;



   }


  ngOnInit() {


  }

  ngOnDestroy(): void {
    this.selectedFormId = null;
    this.subscriptions.unsubscribe();
  }

  async onSubmit(submission: any) {

    console.log(submission);

    this.buildDataObject();

    //document.getElementById("previewModalClose").click();

    //Delete the configBearerAuthToken for the submission
    delete submission["data"]["configBearerAuthToken"];
    //Delete the configGlobalURL for the submission
    delete submission["data"]["configGlobalURL"];
    //Delete the configUserUsername for the submission
    delete submission["data"]["configUserUsername"];
    //Delete the configUserDisplayName for the submission
    delete submission["data"]["configUserDisplayName"];
    //Delete the submit for the submission
    delete submission["data"]["submit"];


    this.formResponse.formresponse = JSON.stringify(submission["data"]);


    //console.log(submission["data"]);
    this.formResponse.responsemeta = JSON.stringify(submission["meta"]);



   this.subscriptions.add(
    this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=formbuilderresponse',this.formResponse)
    .subscribe((response) => {


      this.toasterService.showToaster("Success","Form Saved");

    })
  )






  //  this.currentlySelectedFormId = this.selectedFormId;
  //  this.selectedFormId = null;
  //  await this.sleep(50);
  //  this.selectedFormId = this.currentlySelectedFormId;



  //  this.generatedForm =
  //  {
  //    components: this.formComponents
  //  }




  }

  onRender() {
    //console.log('onRender');
  }

  onChange(value: any) {
    //console.log('onChange');
    //console.log(value);
  }

  toggleContextView() {
    this.showManualContext = !this.showManualContext;
  }

}
