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
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormioForm, FormioOptions } from 'angular-formio';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { parse } from 'querystring';
import { Subscription } from 'rxjs';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { FormioHistoryService } from '../formio-history-viewer/formio-history-viewer.service';
import { FormioImportService } from '../formio-import/formio-import.service';
import { Person } from '../models/entities/core-person.model';
import { FormBuilderForm } from '../models/entities/form-builder-form';
import { FormResponse } from '../models/entities/form-response';
import { PreOpAssessmentSummary } from '../models/entities/poa-assessmentsummary';
import { PreOpAssessment } from '../models/entities/poa-preopassessment';
import { PreOpTaskSummary } from '../models/entities/poa-tasksummary';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { ConfigService } from '../services/config.service';
import { SubjectsService } from '../services/subjects.service';
import { TaskAutomationService } from '../services/taskautomation.service';
import { ToasterService } from '../services/toaster-service.service';


@Component({
  selector: 'app-assessment-frailty',
  templateUrl: './assessment-frailty.component.html',
  styleUrls: ['./assessment-frailty.component.css']
})
export class AssessmentFrailtyComponent implements OnDestroy{

  @Output() assessmentsViewClosed = new EventEmitter<boolean>();


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

    this.getAsssessmentSummaryURI = this.appService.baseURI + "/GetObject?synapsenamespace=local&synapseentityname=poa_assessmentsummary&id=" + this.poaId;
    this.postAsssessmentSummaryURI = this.appService.baseURI + "/PostObject?synapsenamespace=local&synapseentityname=poa_assessmentsummary";
    this.GetPOASummary();
    this.GetTaskSummary();
    this.getSelectedFormWithContext();
    this.gotoTop();

  };

  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  //Task Summary
poaTaskSummary: PreOpTaskSummary;
getTaskSummaryURI: string;
postTaskSummaryURI: string;

async GetTaskSummary() {
  this.getTaskSummaryURI = this.appService.baseURI + "/GetObject?synapsenamespace=local&synapseentityname=poa_tasksummary&id=" + this.poaId;
  this.postTaskSummaryURI = this.appService.baseURI + "/PostObject?synapsenamespace=local&synapseentityname=poa_tasksummary";
  this.subscriptions.add(
    this.apiRequest.getRequest(this.getTaskSummaryURI)
      .subscribe((response) => {
        this.poaTaskSummary = JSON.parse(response);
        if(!this.poaTaskSummary.poa_tasksummary_id) {
         this.poaTaskSummary.poa_tasksummary_id = this.poaId;
         this.poaTaskSummary.poa_tasksummary_id = this.poaId;
         this.PostTaskSummary();
       }
      })
    )
}

async PostTaskSummary() {
  this.subscriptions.add(
    this.apiRequest.postRequest(this.postTaskSummaryURI, this.poaTaskSummary)
      .subscribe((response) => {
      })
    )
}
//End Task Summary


  getAsssessmentSummaryURI: string;
  postAsssessmentSummaryURI: string;
  poaSummary: PreOpAssessmentSummary;
  async GetPOASummary() {
    this.subscriptions.add(
     this.apiRequest.getRequest(this.getAsssessmentSummaryURI)
     .subscribe((response) => {
       this.poaSummary = JSON.parse(response);
       if(!this.poaSummary.poa_assessmentsummary_id) {
        this.poaSummary.poa_assessmentsummary_id = this.poaId;
        this.poaSummary.poa_preopassessment_id = this.poaId;
        this.PostPOASummary();
       }
     })
   )
  }
  async PostPOASummary() {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.postAsssessmentSummaryURI, this.poaSummary)
        .subscribe((response) => {
         //this.toasterService.showToaster("Success","Note Saved");
        })
      )
  }

  constructor(private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService, private modalService: BsModalService, private httpClient: HttpClient , private spinner: NgxSpinnerService, private configService: ConfigService, private toasterService: ToasterService, private confirmationDialogService: ConfirmationDialogService, private formioHistoryService: FormioHistoryService, private formioImportService: FormioImportService, private taskAutomationService: TaskAutomationService) {



  }

  poaId: string;
  personId: string;
  formBuilderFormId: string = '50568f2c-e1fb-4769-dcbf-44ba69bb4e62';
  formContextKey: string;

  private _preOpAssessment: PreOpAssessment;
  get preOpAssessment(): PreOpAssessment { return this._preOpAssessment; }

  async cancel() {

    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go back to the assessment summary? Any new changes will not be saved.')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }

    this.assessmentsViewClosed.emit(true);
  }

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


    var taskMessage = '';


   await this.subscriptions.add(
    this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=formbuilderresponse',this.formResponse)
    .subscribe((response) => {

      //------------------------------------------------------------------------------------------------
        //Prepare the required Variables
        var parsedResponse = JSON.parse(this.formResponse.formresponse);

        var frailtyscore = parsedResponse["assessedFrailtyScore"];
        var frailtyrequired = parsedResponse["doesThePatientRequireTheAssessment"];
        var frailtysixtyplus = parsedResponse["aged60Plus"];


        //Get the latest version in case someone has changed something in another section at the same time
        this.subscriptions.add(
          this.apiRequest.getRequest(this.getAsssessmentSummaryURI)
          .subscribe((summary) => {
            this.poaSummary = JSON.parse(summary);
            //Update the observables
            this.poaSummary.frailtyscore = frailtyscore;
            this.poaSummary.frailtyrequired = frailtyrequired;
            this.poaSummary.frailtysixtyplus = frailtysixtyplus;

            //update the entity record
            this.subscriptions.add(
              this.apiRequest.postRequest(this.postAsssessmentSummaryURI, this.poaSummary)
                .subscribe((response) => {
                  this.toasterService.showToaster("Success","Rockwood Clinical Frailty Scale Assessment Saved");

                  if(Number(frailtyscore.substring(0, 1)) >= 5 ) {
                    taskMessage = "Rockwood Clinical Frailty Scale >= 5, Refer to Complex Case Team";
                    this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, "taskrefercomplexcase", "POA Nurse", "Please refer to Complex Case Team", taskMessage);
                    this.poaTaskSummary.taskrefercomplexcase = true;
                  }



                  this.assessmentsViewClosed.emit(true);
                })
              )

          })
        )
        //------------------------------------------------------------------------------------------------

    })
  )

  }

  async RefreshPOA(requiresHDU: boolean, reason: string) {

    this.subscriptions.add(
      this.apiRequest.getRequest(this.getPOAURI)
      .subscribe((response) => {

       this.updatePOA = JSON.parse(response);

       this.updatePOA.hdurequired = requiresHDU;
       if(!this.updatePOA.hdurequiredreason) {
        this.updatePOA.hdurequiredreason = reason;
       }

        //update the entity record
        this.subscriptions.add(
          this.apiRequest.postRequest(this.postPOAURI, this.updatePOA)
            .subscribe((response) => {

              if(requiresHDU) {
                requiresHDU = true;
                this.toasterService.showToaster('info', reason);
              }

              this.assessmentsViewClosed.emit(true);
             //this.toasterService.showToaster("Success","Note Saved");
            })
          )

      })
    )
   }


  onRender() {
    //console.log('onRender');
  }

  onChange(value: any) {
    //console.log('onChange');
    //console.log(value);
  }

  async viewHistory() {
    var response = false;
    await this.formioHistoryService.confirm(this.formContextKey, 'Frailty Assessment')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  async viewPrevious() {
    var response = false;
    await this.formioImportService.confirm(this.formBuilderFormId, this.personId, this.formResponse, 'Frailty Assessment','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
    else {
      await this.getSelectedFormWithContext();
    }
  }


}

