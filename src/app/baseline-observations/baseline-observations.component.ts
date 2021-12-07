//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2021  Interneuron CIC

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
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormioForm, FormioOptions } from 'angular-formio';
import { Guid } from 'guid-typescript';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { Person } from '../models/entities/core-person.model';
import { FormBuilderForm } from '../models/entities/form-builder-form';
import { FormResponse } from '../models/entities/form-response';
import { PreOpAssessment } from '../models/entities/poa-preopassessment';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { ConfigService } from '../services/config.service';
import { SubjectsService } from '../services/subjects.service';
import { ToasterService } from '../services/toaster-service.service';
import { Observation } from '../models/entities/observation';
import { ObservationEvent } from '../models/entities/observation-event';
import { Console } from 'console';
import { ThrowStmt } from '@angular/compiler';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { FormioHistoryService } from '../formio-history-viewer/formio-history-viewer.service';
import { FormioImportService } from '../formio-import/formio-import.service';

@Component({
  selector: 'app-baseline-observations',
  templateUrl: './baseline-observations.component.html',
  styleUrls: ['./baseline-observations.component.css']
})
export class BaselineObservationsComponent implements OnDestroy{

  postObservationEventURI: string;
  postObservationURI: string;

  @Input() set preOpAssessment(value: PreOpAssessment) {
    this.personId = value.person_id;
    this.poaId = value.poa_preopassessment_id;
    this.formContextKey = 'POA|' + this.formBuilderFormId + '|' + this.personId + '|' + this.poaId;

        this.submission = null;
        this.formResponse = null;
        this.showVersionWarning = false;

        this.getPOAURI = this.appService.baseURI +  "/GetObject?synapsenamespace=local&synapseentityname=poa_preopassessment&id=" + this.poaId;
        this.postPOAURI = this.appService.baseURI + "/PostObject?synapsenamespace=local&synapseentityname=poa_preopassessment";
        this.GetLivePOA();


        this.postObservationEventURI = this.appService.baseURI +  "/PostObject?synapsenamespace=core&synapseentityname=observationevent";
        this.postObservationURI = this.appService.baseURI + "/PostObject?synapsenamespace=core&synapseentityname=observation";

        this.getSelectedFormWithContext();

        this.gotoTop();

  };

  @Output() frameworkAction = new EventEmitter<string>();

  constructor(private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService, private modalService: BsModalService, private httpClient: HttpClient , private spinner: NgxSpinnerService, private configService: ConfigService, private toasterService: ToasterService, private confirmationDialogService: ConfirmationDialogService, private formioHistoryService: FormioHistoryService, private formioImportService: FormioImportService) {



  }

  poaId: string;
  personId: string;
  formBuilderFormId: string = '05e49cab-4ade-537a-619c-1b9cd3104272';
  formContextKey: string;

  private _preOpAssessment: PreOpAssessment;
  get preOpAssessment(): PreOpAssessment { return this._preOpAssessment; }

  @Output() viewClosed = new EventEmitter<boolean>();


  getPOAURI: string;
  postPOAURI: string;
  selectedPOA: PreOpAssessment;
  updatePOA: PreOpAssessment;

  async GetLivePOA() {
     this.subscriptions.add(
      this.apiRequest.getRequest(this.getPOAURI)
      .subscribe((response) => {
        this.selectedPOA = JSON.parse(response);
      })
    )
   }
   async markSectionCompleted(completed) {
     //Get the latest version in case someone has changed something in another section at the same time
    this.subscriptions.add(
      this.apiRequest.getRequest(this.getPOAURI)
      .subscribe((response) => {
        this.selectedPOA = JSON.parse(response);
        //Ubdate the observable
        this.selectedPOA.iscompletedbaselineobservations = completed;
        //update the entity record
        this.subscriptions.add(
          this.apiRequest.postRequest(this.postPOAURI, this.selectedPOA)
            .subscribe((response) => {
             //this.toasterService.showToaster("Success","Note Saved");
            })
          )

      })
    )
   }

  //API Variables
  globalURL: string = this.appService.baseURI;
  careRecordURL: string = this.appService.carerecordURI;
  terminologyURL: string = this.appService.terminologyURI;
  autonomicURL: string = this.appService.autonomicURI;
  imageServerURL: string = this.appService.imageserverURI;

  subscriptions: Subscription = new Subscription();
  formResponse: FormResponse;
  formVersion: number;
  showVersionWarning: boolean;

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


  // private _personData: Person;
  // @Input() set person(value: Person) {
  //   )};
  //  get person(): Person { return this._personData; }




   async getSelectedFormWithContext() {

    this.generatedForm = null;
    this.submission = null;
    this.formVersion = 0;


    this.generatedForm = null;

    if(this.formBuilderFormId) {

    this.actionGetFormEndpoint = this.appService.baseURI + "/GetObject?synapsenamespace=meta&synapseentityname=formbuilderform&id=" + this.formBuilderFormId;
    this.actionPostFormEndpoint = this.appService.baseURI + "/PostObject?synapsenamespace=meta&synapseentityname=formbuilderform";

    this.bearerAuthToken = 'bearer '+ this.appService.apiService.authService.user.access_token;

    this.subscriptions.add(

      this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=meta&synapseentityname=formbuilderform&id='  + this.formBuilderFormId)
      .subscribe((response) => {


        var data = JSON.parse(response);

        this.formComponents = JSON.parse(data.formcomponents);

        this.formName = data.formname;
        this.showVersionWarning = false;

        this.formResponse = null;
        this.formVersion = data.version;

        var formResponseUri = "/GetObject?synapsenamespace=core&synapseentityname=formbuilderresponse&id=" + this.formContextKey;
        this.apiRequest.getRequest(this.appService.baseURI + formResponseUri)
        .subscribe((data) => {

          this.formResponse = JSON.parse(data) as FormResponse;

          if(!this.formResponse.formcomponents) {
            this.formResponse.formbuilderresponse_id = this.formContextKey;
            this.formResponse.formversion = this.formVersion;
            this.formResponse.formcomponents = JSON.stringify(this.formComponents);
            this.formResponse.formversion = this.formVersion;
            this.formResponse.responseversion = 0;
            this.formResponse.responsestatus = "New";
            this.formResponse.formresponse = '{"new":"new"}';
            this.formResponse.person_id = this.personId;
            this.formResponse.formbuilderform_id = this.formBuilderFormId;
          }

          //Clean out system generated fields to prevent duplication
          this.formResponse._row_id = null;
          this.formResponse._sequenceid = null;
          //this.formResponse._contextkey = null;
          this.formResponse._createdtimestamp = null;
          this.formResponse._createddate = null;
          this.formResponse._createdsource = null;
          this.formResponse._createdmessageid = null;
          this.formResponse._createdby = null;
          this.formResponse._recordstatus = null;
          this.formResponse._timezonename = null;
          this.formResponse._timezoneoffset = null;
          this.formResponse._tenant = null;

          //Add in FormBuilderFormId;
          this.formResponse.formbuilderform_id = this.formBuilderFormId;

          //Make readonly if locked or blocked
         if(this.appService.lockedOrBlocked) {
          var resp = [];
          for (const control of JSON.parse(this.formResponse.formcomponents)) {
            if (control.key == 'submit') {
              control.hidden = true;
            }
            else if(control.type == "table") {
              for (const row of control.rows) {
                for (const item of row) {
                  for (const component of item.components) {
                    component.disabled = true;
                  }
                }
              }
            }
            else {
              control.disabled = true;
            }
            resp.push(control);
          }
          this.formResponse.formcomponents = JSON.stringify(resp);
        }

          if(this.formVersion != this.formResponse.formversion) {
            this.showVersionWarning = true;
          }

        //  console.log(this.formResponse.formcomponents);
          //console.log(JSON.parse(this.formResponse.formcomponents));


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
    this.subscriptions.unsubscribe();
  }

  async onSubmit(submission: any) {

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



   await this.subscriptions.add(
    this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=formbuilderresponse',this.formResponse)
    .subscribe((response) => {


        //------------------------------------------------------------------------------------------------
        //Prepare the required Variables
        var parsedResponse = JSON.parse(this.formResponse.formresponse);

        var height = parsedResponse["height"]
        var weight = parsedResponse["weight"]
        var bmi = parsedResponse["bmi"];

        // console.log("Height:" + height);
        // console.log("Weight:" + weight);
        // console.log("BMI:" + bmi);

        if(isNaN(height)){
          height = null;
        }

        if(isNaN(weight)){
          weight = null;
        }

        if(isNaN(bmi)){
          bmi = null;
        }



        //Update selected POA
        this.selectedPOA.height = height;
        this.selectedPOA.weight = weight;
        this.selectedPOA.bmi = bmi;

        this.RefreshPOA(height,weight,bmi);








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


  errorMessage :string;


  weightObservation: Observation;
  heightObservation: Observation;
  observationEvent: ObservationEvent;



  async RefreshPOA(height: number, weight: number, bmi: number) {

   await this.subscriptions.add(
     this.apiRequest.getRequest(this.getPOAURI)
     .subscribe((response) => {

      this.updatePOA = JSON.parse(response);

      this.updatePOA.height = height;
      this.updatePOA.weight = weight;
      this.updatePOA.bmi = Number(bmi);

       //update the entity record
       this.subscriptions.add(
         this.apiRequest.postRequest(this.postPOAURI, this.updatePOA)
           .subscribe((response) => {


        //--------------------------------
        //Need to post updted values to the server
        //--------------------------------

        //Post the Observation Event
        this.RefreshObservationEvent();

        //Post the Height Observation
        this.RefreshHeightObservation();

        //Post the Weight Observation
        this.RefreshWeightObservation();

        //------------------------------------------------------------------------------------------------





            //this.toasterService.showToaster("Success","Note Saved");
           })
         )

     })
   )
  }


  //this.selectedPOA
  async RefreshObservationEvent() {
    this.observationEvent = {} as ObservationEvent;
    this.observationEvent.observationevent_id = this.selectedPOA.obervationeventid;
    this.observationEvent.eventcorrelationid = this.selectedPOA.eventcorrelationid;
    this.observationEvent.person_id = this.selectedPOA.person_id;
    this.observationEvent.encounter_id = "";
    this.observationEvent.datestarted = this.getDateTime();
    this.observationEvent.datefinished = this.getDateTime();
    this.observationEvent.addedby = this.appService.loggedInUserName;
    this.observationEvent.isamended = false;
    this.observationEvent.observationfrequency = 168;  //Monitoring not clinically indicated
    this.observationEvent.observationscaletype_id = 'eeb70c54-3412-4d00-bc87-c894315cb75d'; //News 2 Scale 1
    this.observationEvent.incomplete = true;
    await this.subscriptions.add(
      this.apiRequest.postRequest(this.postObservationEventURI, this.observationEvent)
        .subscribe((response) => {

          // this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
          // this.toasterService.showToaster("Info","Refresh Observation Event");

      })
    )
  }


  async RefreshWeightObservation() {
    if(!this.selectedPOA.weight) {
      //Refresh Patient Banner
      this.toasterService.showToaster("Success","Baseline observations saved");
      if(this.appService.autoproceedtonextsection) {
        this.appService.viewToShow = 'allergies';
        this.viewClosed.emit(true);
      }

      return;
    }
    this.weightObservation = {} as Observation;
    this.weightObservation.observation_id = this.selectedPOA.weightobservationid;
    this.weightObservation.eventcorrelationid = this.selectedPOA.eventcorrelationid;
    this.weightObservation.timerecorded = this.getDateTime();
    this.weightObservation.observationevent_id = this.selectedPOA.obervationeventid;
    this.weightObservation.observationtype_id = "71d6a339-7d9e-4054-99d6-683da95331dc"; //WEIGHT
    this.weightObservation.hasbeenammended = false;
    this.weightObservation._createdby = this.appService.loggedInUserName;
    this.weightObservation.value = this.selectedPOA.weight.toString();
    this.weightObservation.units = 'kg';

    await this.subscriptions.add(
      this.apiRequest.postRequest(this.postObservationURI, this.weightObservation)
        .subscribe((response) => {
          //Update patient banner
          this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
          //this.toasterService.showToaster("Info","Weight Saved");
          //Refresh Patient Banner
          this.toasterService.showToaster("Success","Baseline observations saved");
          if(this.appService.autoproceedtonextsection) {
            this.appService.viewToShow = 'allergies';
            this.viewClosed.emit(true);
          }

        })
    )


  }


  async RefreshHeightObservation() {
    if(!this.selectedPOA.height) {
      return;
    }
    this.heightObservation = {} as Observation;
    this.heightObservation.observation_id = this.selectedPOA.heightobservationid;
    this.heightObservation.eventcorrelationid = this.selectedPOA.eventcorrelationid;
    this.heightObservation.timerecorded = this.getDateTime();
    this.heightObservation.observationevent_id = this.selectedPOA.obervationeventid;
    this.heightObservation.observationtype_id = "83a4b253-5599-43d2-a377-9f8001e7dbac"; //HEIGHT
    this.heightObservation.hasbeenammended = false;
    this.heightObservation._createdby = this.appService.loggedInUserName;
    this.heightObservation.value = this.selectedPOA.height.toString();
    this.heightObservation.units = 'cm';

    await this.subscriptions.add(
      this.apiRequest.postRequest(this.postObservationURI, this.heightObservation)
        .subscribe((response) => {
          // this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
          // this.toasterService.showToaster("Info","Height Saved");
        })
    )
  }



  getDateTime(): string {
    var date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1);
    let day = date.getDate();
    let hrs = date.getHours();
    let mins = date.getMinutes();
    let secs = date.getSeconds();
    let msecs = date.getMilliseconds();

    let returndate = (year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) +
      "T" + (hrs < 10 ? "0" + hrs : hrs) + ":" + (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs) + "." + (msecs < 10 ? "00" + msecs : (msecs < 100 ? "0" + msecs : msecs)));

    return returndate;
  }


  async viewHistory() {
    var response = false;
    await this.formioHistoryService.confirm(this.formContextKey, 'Baseline Observations')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  async viewPrevious() {
    var response = false;
    await this.formioImportService.confirm(this.formBuilderFormId, this.personId, this.formResponse, 'Baseline Observations','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
    else {
      await this.getSelectedFormWithContext();
    }
  }


  //--------------------------------------
// Navigation
//--------------------------------------

async cancel() {

  //console.log("this.appService.displayWarnings:" + this.appService.displayWarnings);

  var displayConfirmation = this.appService.displayWarnings;
  if(displayConfirmation) {
    var response = false;
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go to the main menu? Any new changes will not be saved.')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  this.appService.viewToShow = 'home';
  this.viewClosed.emit(true);
}

async mainmenu() {

  //console.log("this.appService.displayWarnings:" + this.appService.displayWarnings);

  var displayConfirmation = this.appService.displayWarnings;
  if(displayConfirmation) {
    var response = false;
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go to the menu? Any new changes will not be saved.')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }
  this.appService.viewToShow = 'home';
  this.viewClosed.emit(true);
}


async back() {

  //console.log("this.appService.displayWarnings:" + this.appService.displayWarnings);

  var displayConfirmation = this.appService.displayWarnings;
  if(displayConfirmation) {
    var response = false;
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go back to the previous screen? Any new changes will not be saved.')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  this.appService.viewToShow = 'tasks';
  this.viewClosed.emit(true);
}

async next() {

  //console.log("this.appService.displayWarnings:" + this.appService.displayWarnings);

  var displayConfirmation = this.appService.displayWarnings;
  if(displayConfirmation) {
    var response = false;
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go to the next screen? Any new changes will not be saved.')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  this.appService.viewToShow = 'allergies';
  this.viewClosed.emit(true);
}

gotoTop() {
  window.scroll({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
}

//--------------------------------------
// End Navigation
//--------------------------------------



}
