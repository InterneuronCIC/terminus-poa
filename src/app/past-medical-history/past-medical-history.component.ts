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
import { Console } from 'console';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { FormioHistoryService } from '../formio-history-viewer/formio-history-viewer.service';
import { FormioImportService } from '../formio-import/formio-import.service';
import { Person } from '../models/entities/core-person.model';
import { FormBuilderForm } from '../models/entities/form-builder-form';
import { FormResponse } from '../models/entities/form-response';
import { PreOpAssessment } from '../models/entities/poa-preopassessment';
import { PreOpTaskSummary } from '../models/entities/poa-tasksummary';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { ConfigService } from '../services/config.service';
import { SubjectsService } from '../services/subjects.service';
import { TaskAutomationService } from '../services/taskautomation.service';
import { ToasterService } from '../services/toaster-service.service';

@Component({
  selector: 'app-past-medical-history',
  templateUrl: './past-medical-history.component.html',
  styleUrls: ['./past-medical-history.component.css']
})
export class PastMedicalHistoryComponent implements OnDestroy{

  showRelevantForm: boolean = false;

  @Input() set preOpAssessment(value: PreOpAssessment) {

    this.showRelevantForm = false;

    this.personId = value.person_id;
    this.poaId = value.poa_preopassessment_id;
    this.formContextKey = 'POA|' + this.formBuilderFormId + '|' + this.personId + '|' + this.poaId;

        this.submission = null;
        this.formResponse = null;
        this.showVersionWarning = false;

        this.getPOAURI = this.appService.baseURI +  "/GetObject?synapsenamespace=local&synapseentityname=poa_preopassessment&id=" + this.poaId;
        this.postPOAURI = this.appService.baseURI + "/PostObject?synapsenamespace=local&synapseentityname=poa_preopassessment";
        this.GetLivePOA();
        this.getSelectedFormWithContext();

        this.GetTaskSummary();

        this.gotoTop();

  };

  constructor(private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService, private modalService: BsModalService, private httpClient: HttpClient , private spinner: NgxSpinnerService, private configService: ConfigService, private toasterService: ToasterService, private confirmationDialogService: ConfirmationDialogService, private formioHistoryService: FormioHistoryService, private formioImportService: FormioImportService, private taskAutomationService: TaskAutomationService) {



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



  getPOAURI: string;
  postPOAURI: string;
  selectedPOA: PreOpAssessment;

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
        this.selectedPOA.iscompletedpastmedicalhistory = completed;
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


  poaId: string;
  personId: string;
  formBuilderFormId: string = 'a091ab71-36a7-d4c2-fbe5-7cbbca459818';
  formContextKey: string;

  private _preOpAssessment: PreOpAssessment;
  get preOpAssessment(): PreOpAssessment { return this._preOpAssessment; }

  @Output() viewClosed = new EventEmitter<boolean>();

  //API Variables
  globalURL: string = this.appService.baseURI;
  careRecordURL: string = this.appService.carerecordURI;
  terminologyURL: string = this.appService.terminologyURI;
  autonomicURL: string = this.appService.autonomicURI;
  imageServerURL: string = this.appService.imageserverURI;

  subscriptions: Subscription = new Subscription();
  formResponse: FormResponse;
  formResponseRelevant: FormResponse;
  formVersion: number;
  showVersionWarning: boolean;

    //Form Builder Variables
    actionGetFormEndpoint: string;
    actionPostFormEndpoint: string;



    bearerAuthToken: string;
    submission: any;
    relevantSubmission: any;
    formComponents: any = [];
    formComponentsAtLoad: any = [];
    formBuilderComponentsString: string;
    formBuilder: FormioForm;
    generatedForm: FormioForm;
    relevantForm: FormioForm;
    formName: string;
    appContexts: any;
    triggerRefresh: EventEmitter<unknown>;


    //public options: FormioOptions;
    // options: Object = {
    //   submitMessage: "",
    //   disableAlerts: true,
    //   noAlerts: true,
    //   readOnly: false
    // }

    options: Object = {


    }


  // private _personData: Person;
  // @Input() set person(value: Person) {
  //   )};
  //  get person(): Person { return this._personData; }

  displayReleventForm() {
    this.getRelevantForm();
    this.showRelevantForm = true;
  }

  hideRelevantForm() {
    this.showRelevantForm = false;
  }


   getRelevantForm() {



    this.relevantForm = null;
    this.formResponseRelevant = null;

    this.formResponseRelevant = this.formResponse;

     //Make readonly if locked or blocked

       var resp = [];
        for (const control of JSON.parse(this.formResponseRelevant.formcomponents)) {
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
        this.formResponseRelevant.formcomponents = JSON.stringify(resp);



      this.relevantForm = {components: JSON.parse(this.formResponseRelevant.formcomponents)};

      this.relevantSubmission = this.buildDataObjectRelevant();


   }

   buildDataObjectRelevant() {

    this.dataObject = JSON.parse('{"data":' + this.formResponseRelevant.formresponse + '}') ;
    this.dataObject["data"]["configBearerAuthToken"] = this.bearerAuthToken;
    //this.dataObject["data"]["submit"] = false;

    this.dataObject["data"]["configGlobalURL"] = this.globalURL;
    this.dataObject["data"]["configAutonomicURL"] = this.autonomicURL;
    this.dataObject["data"]["configTerminologyURL"] = this.terminologyURL;
    this.dataObject["data"]["configImageServerURL"] = this.imageServerURL;
    this.dataObject["data"]["configCareRecordURL"] = this.careRecordURL;
    this.dataObject["data"]["configCareRecordURL"] = this.careRecordURL;
    this.dataObject["data"]["chkOnlyShowPositiveResponses"] = true;

    return this.dataObject;



  }

   async getSelectedFormWithContext() {

    this.generatedForm = null;


    this.submission = null;
    this.formVersion = 0;



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

        //var formResponseUri = "/GetObjectWithInsert/core/formbuilderresponse/_contextkey/" + this.formContextKey + "/" + this.formContextKey + "/true";
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

          this.formComponentsAtLoad = this.formResponse.formcomponents;

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


          //console.log(JSON.parse(this.formResponse.formcomponents));


          if(this.formVersion != this.formResponse.formversion) {
            this.showVersionWarning = true;
          }

        //  console.log(this.formResponse.formcomponents);
          //console.log(JSON.parse(this.formResponse.formcomponents));


          //console.log(this.formResponse.formresponse);
          //console.log(this.submission);



          this.generatedForm = {components: JSON.parse(this.formResponse.formcomponents)};


          this.submission = this.buildDataObject();


          //console.log(this.formResponse.formcomponents);

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

    this.formResponse.formcomponents = this.formComponentsAtLoad;

    //Prepare the required Variables
    var parsedResponse = JSON.parse(this.formResponse.formresponse);

    var diabeticType = parsedResponse["diabeticType"];

    var diabeticPump = parsedResponse["diabeticPump"];

    var diabeticHypoDoYouKnowWhen = parsedResponse["diabeticHypoDoYouKnowWhen"];

    var diabeticBeedHospitalised = parsedResponse["diabeticBeedHospitalised"];

    var acceptBloodTransfusion = parsedResponse["acceptBloodTransfusion"];

    var syndromicCongenitalCondition= parsedResponse["syndromicCongenitalCondition"];

    var taskflaghaem = parsedResponse["bloodDisorder"];

    var isItCurrentlyWellControlled = false;
    var mentalHealthProblemsDiagnoses = parsedResponse["mentalHealthProblemsDiagnoses"];

    if (typeof(mentalHealthProblemsDiagnoses) != "undefined")  {
      mentalHealthProblemsDiagnoses.forEach(element => {
        if(element["isItCurrentlyWellControlled"] == 'no') {
          isItCurrentlyWellControlled = true;
        }
      });
    }

    var mentalHealthProblemsSpecialistCare = parsedResponse["mentalHealthProblemsSpecialistCare"];

    var mentalHealthProblemsSelfHarm = parsedResponse["mentalHealthProblemsSelfHarm"];

    var rheumatoidArthritis = parsedResponse["rheumatoidArthritis"];

    var anyReasonToQuestionThePersonsCapacity= parsedResponse["syndromicCongenitalCondition"];
    var anySpecificDecisionsNeedingMoreDetailedAssessment= parsedResponse["syndromicCongenitalCondition"];

    var anaestheticProblems = parsedResponse["anaestheticProblems"];


    //console.log(submission["data"]);
    this.formResponse.responsemeta = JSON.stringify(submission["meta"]);

    this.formResponse = this.formResponse as FormResponse;

   this.subscriptions.add(
    this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=formbuilderresponse',this.formResponse)
    .subscribe((response) => {


      var taskMessage = '';
      var taskName = '';
      var taskType = '';

      if(diabeticType  === 'type1') {
        taskMessage = "Type 1 Diabetic - Please refer to Diabetes Team";
        taskName = "Please refer to Diabetes Team";
        taskType = 'taskreferdiabetesteam';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskreferdiabetesteam = true;

        taskMessage = "Type 1 Diabetic - Please refer to Pharmacy";
        taskName = "Please refer to Pharmacy";
        taskType = 'taskreferpharmacy';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskreferpharmacy = true
      }

      if(diabeticType  === 'type2') {
        taskMessage = "Type 2 Diabetic - Please refer to Diabetes Team";
        taskName = "Please refer to Diabetes Team";
        taskType = 'taskreferdiabetesteam';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskreferdiabetesteam = true;

        taskMessage = "Type 2 Diabetic - Please refer to Pharmacy";
        taskName = "Please refer to Pharmacy";
        taskType = 'taskreferpharmacy';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskreferpharmacy = true;
      }

      if(diabeticPump  === 'yes') {
        taskMessage = "Diabetes Pump - Please refer to Diabetes Team";
        taskName = "Please refer to Diabetes Team";
        taskType = 'taskreferdiabetesteam';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskreferdiabetesteam = true;
      }

      if(diabeticHypoDoYouKnowWhen  === 'no') {
        taskMessage = "Patient does not know when they are having a hypo - Please refer to Diabetes Team";
        taskName = "Please refer to Diabetes Team";
        taskType = 'taskreferdiabetesteam';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskreferdiabetesteam = true;
      }

      if(diabeticBeedHospitalised  === 'yes') {
        taskMessage = "Patient has been been hospitalised for complications related to hypo- or hyperglycaemia eg. DKA/HHS - Please refer to Diabetes Team";
        taskName = "Please refer to Diabetes Team";
        taskType = 'taskreferdiabetesteam';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskreferdiabetesteam = true;
      }

      if(acceptBloodTransfusion  === 'no') {
        taskMessage = "Patient will not accept a blood transfusion - Please refer to anaesthetist";
        taskName = "Please refer to anaesthetist";
        taskType = 'taskreferanaesthetist';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskreferanaesthetist = true;
      }

      if(syndromicCongenitalCondition  === 'yes') {
        taskMessage = "Patient has a a syndromic / congenital condition  - Please refer to Complex Case Team";
        taskName = "Please refer to Complex Case Team";
        taskType = 'taskrefercomplexcase';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskrefercomplexcase = true;
      }

      if(isItCurrentlyWellControlled  === true ) {
        taskMessage = "Patient has uncontrolled mental health problem(s)  - Please refer to Complex Case Team";
        taskName = "Please refer to Complex Case Team";
        taskType = 'taskrefercomplexcase';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskrefercomplexcase = true;
      }

      if(mentalHealthProblemsSpecialistCare  === 'yes') {
        taskMessage = "Patient has been under specialist mental health services  - Please refer to Complex Case Team";
        taskName = "Please refer to Complex Case Team";
        taskType = 'taskrefercomplexcase';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskrefercomplexcase = true;
      }

      if(mentalHealthProblemsSelfHarm  === 'yes') {
        taskMessage = "Patient has had thoughts of self-harm or self-harmed in the past three years?  - Please refer to Complex Case Team";
        taskName = "Please refer to Complex Case Team";
        taskType = 'taskrefercomplexcase';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskrefercomplexcase = true;
      }

      if(rheumatoidArthritis  === 'yes') {
        taskMessage = "Patient has Rheumatoid Arthritis - C-spine x-ray required";
        taskName = "C-spine x-ray required";
        taskType = 'taskcspinexray';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskcspinexray = true;
      }

      if(anyReasonToQuestionThePersonsCapacity  === 'yes') {
        taskMessage = "Patient needs more detailed assessment - Please refer to Complex Case Team";
        taskName = "Please refer to Complex Case Team";
        taskType = 'taskrefercomplexcase';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskrefercomplexcase = true;
      }

      if(anySpecificDecisionsNeedingMoreDetailedAssessment  === 'yes') {
        taskMessage = "Specific decissions regarding more detailed assessment required - Please refer to Complex Case Team";
        taskName = "Please refer to Complex Case Team";
        taskType = 'taskrefercomplexcase';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskrefercomplexcase = true;
      }

      if(taskflaghaem  === 'yes') {
        taskMessage = "Patient has blood disorder - Please add HAEM Flag to iCS and Fitness Outcome Section";
        taskName = "Please add HAEM Flag to iCS and Fitness Outcome Section";
        taskType = 'taskflaghaem';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskflaghaem = true;
      }

      if(anaestheticProblems === 'yes') {
        taskMessage = "Personal or family history of anaesthetic problems - Consider referring to anaesthetist";
        taskName = "Consider referring to anaesthetist";
        taskType = 'taskconsiderreferanaesthetist';
        this.taskAutomationService.checkTask(this.poaTaskSummary, this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, taskType, "POA Nurse", taskName, taskMessage);
        this.poaTaskSummary.taskconsiderreferanaesthetist = true;
      }

    //var = parsedResponse["syndromicCongenitalCondition"];
    //var anySpecificDecisionsNeedingMoreDetailedAssessment= parsedResponse["syndromicCongenitalCondition"];

      this.toasterService.showToaster("Success","Form Saved");

      if(this.appService.autoproceedtonextsection) {
        this.appService.viewToShow = 'tasks';
        this.viewClosed.emit(true);
      }

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
    await this.formioHistoryService.confirm(this.formContextKey, 'Past Medical History')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  async viewPrevious() {
    var response = false;
    await this.formioImportService.confirm(this.formBuilderFormId, this.personId, this.formResponse, 'Past Medical History','','Import')
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

  this.appService.viewToShow = 'general';
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

  this.appService.viewToShow = 'tasks';
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
