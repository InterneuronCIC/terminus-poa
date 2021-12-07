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
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormioForm, FormioOptions } from 'angular-formio';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, Subscription } from 'rxjs';
import { Person } from '../models/entities/core-person.model';
import { FormBuilderForm } from '../models/entities/form-builder-form';
import { FormResponse } from '../models/entities/form-response';
import { PreOpAssessment } from '../models/entities/poa-preopassessment';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { ConfigService } from '../services/config.service';
import { SubjectsService } from '../services/subjects.service';
import { ToasterService } from '../services/toaster-service.service';
import { ComponentModuleData } from '../directives/module-loader.directive';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { FormioHistoryService } from '../formio-history-viewer/formio-history-viewer.service';
import { FormioImportService } from '../formio-import/formio-import.service';
import { LinkedEncounter } from '../models/baseviews/linked-encounter';
import { PreOpAssessmentSummary } from '../models/entities/poa-assessmentsummary';
import { KeyValuePair } from '../models/keyvaluepair';
import { AllergyIntolerance } from '../models/entities/allergy-intolerance';
import { PatientBanner } from '../models/baseviews/patientbanner';
import { AppComponent } from '../app.component';
import { PreOpNote } from '../models/entities/poa-note';
import { PreOpTask } from '../models/entities/poa-task';

@Component({
  selector: 'app-print-view',
  templateUrl: './print-view.component.html',
  styleUrls: ['./print-view.component.css']
})
export class PrintViewComponent  implements OnDestroy, AfterViewInit, OnInit {

  subscriptions: Subscription = new Subscription();

  medsHistoryPOA: PreOpAssessment;

  getLinkedEncounterListURI: string;
  linkedEncounterList: LinkedEncounter[];

  getLinkedEncounterURI: string;
  linkedEncounter: LinkedEncounter;

  postPOAURI: string;

  poaId: string;
  personId: string;

  patientBanner: PatientBanner;
  getPatientBannerURI: string;
  async GetPatientBanner() {
    this.subscriptions.add(
     this.apiRequest.getRequest(this.getPatientBannerURI)
     .subscribe((response) => {
        this.patientBanner = JSON.parse(response);
     })
   )
  }

  getAsssessmentSummaryURI: string;
  kvp: KeyValuePair[];


  poaSummary: PreOpAssessmentSummary;
  async GetPOASummary() {
    this.subscriptions.add(
     this.apiRequest.getRequest(this.getAsssessmentSummaryURI)
     .subscribe((response) => {
       this.poaSummary = JSON.parse(response);

       if(!this.poaSummary.cognitivecriteria) {
         this.kvp = {} as KeyValuePair[];
       }
       else {
        this.kvp = JSON.parse(this.poaSummary.cognitivecriteria);
       }
     })
   )
  }

  getAllergyListForPersonURI: string;
  allergyIntoleranceList: AllergyIntolerance[];

  async  getAllergyListForPerson() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getAllergyListForPersonURI)
     .subscribe((response) => {
       this.allergyIntoleranceList = JSON.parse(response);
     })
   )
  }

  get activeAllergies(): AllergyIntolerance[] {
    return this.allergyIntoleranceList.filter((a) =>
      a.clinicalstatusvalue == 'Active' && a.causativeagentcodesystem != "NON-ALLERGY"
    );
}

get NoKnownAllergiesRecorded(): boolean{

  if(!this.allergyIntoleranceList) {
    return false;
  }

  var filter = this.allergyIntoleranceList.filter((a) =>
    a.causativeagentcode == 'No known allergies' && a.causativeagentcodesystem == "NON-ALLERGY"
  );

  if(!filter) {
    return false;
  }
  else if(filter.length > 0) {
    return true;
  }
  else {
    return false;
  }

}

get ActiveNoKnownAllergiesRecorded(): boolean{

if(!this.allergyIntoleranceList) {
  return false;
}

var filter = this.allergyIntoleranceList.filter((a) =>
  a.clinicalstatusvalue == 'Active' && a.causativeagentcode == 'No known allergies' && a.causativeagentcodesystem == "NON-ALLERGY"
);

if(!filter) {
  return false;
}
else if(filter.length > 0) {
  return true;
}
else {
  return false;
}

}

get NotAbleToAscertainRecorded(): boolean{

if(!this.allergyIntoleranceList) {
  return false;
}

var filter = this.allergyIntoleranceList.filter((a) =>
  a.causativeagentcode == 'Not posible to ascertain if patient has any allergies' && a.causativeagentcodesystem == "NON-ALLERGY"
);

if(!filter) {
  return false;
}
else if(filter.length > 0) {
  return true;
}
else {
  return false;
}

}

get ActiveNotAbleToAscertainRecorded(): boolean{

if(!this.allergyIntoleranceList) {
  return false;
}

var filter = this.allergyIntoleranceList.filter((a) =>
a.clinicalstatusvalue == 'Active' && a.causativeagentcode == 'Not posible to ascertain if patient has any allergies' && a.causativeagentcodesystem == "NON-ALLERGY"
);

if(!filter) {
  return false;
}
else if(filter.length > 0) {
  return true;
}
else {
  return false;
}

}


  selectedView: string;

  private _preOpAssessment: PreOpAssessment;
  get preOpAssessment(): PreOpAssessment { return this._preOpAssessment; }

  getPOAURI: string;
  selectedPOA: PreOpAssessment;

  showHideGeneral: boolean = true;
  toggleShowHideGeneral() {
    this.showHideGeneral = !this.showHideGeneral;
  }

  showHideCurrentMedications: boolean = true;
  toggleShowHideCurrentMedications() {
    this.showHideCurrentMedications = !this.showHideCurrentMedications;
  }

  showHideAssessments: boolean = true;
  toggleShowHideAssessments() {
    this.showHideAssessments = !this.showHideAssessments;
  }

  showHideAllergies: boolean = true;
  toggleShowHideAllergies() {
    this.showHideAllergies = !this.showHideAllergies;
  }

  showHideMedicationHistory: boolean = true;
  formIOMedicationHistoryId: string = '44b9a850-ce6b-ca64-53d1-3e31cab5920f';
  formIOMedicationHistoryKey: string;
  formIOMedicationHistoryForm: FormioForm;
  formIOMedicationHistorySubmission: any;
  formIOMedicationHistoryResponse: FormResponse;
  toggleShowHideMedicationHistory() {
    this.showHideMedicationHistory = !this.showHideMedicationHistory;
  }

  showHidePastMedicalHistory: boolean = true;
  formIOPastMedicalHistoryId: string = 'a091ab71-36a7-d4c2-fbe5-7cbbca459818';
  formIOPastMedicalHistoryKey: string;
  formIOPastMedicalHistoryForm: FormioForm;
  formIOPastMedicalHistorySubmission: any;
  formIOPastMedicalHistoryResponse: FormResponse;
  toggleShowHidePastMedicalHistory() {
    this.showHidePastMedicalHistory = !this.showHidePastMedicalHistory;
  }

  showHideBaselineObservations: boolean = true;
  formIOBaselineObservationsId: string = '05e49cab-4ade-537a-619c-1b9cd3104272';
  formIOBaselineObservationsKey: string;
  formIOBaselineObservationsForm: FormioForm;
  formIOBaselineObservationsSubmission: any;
  formIOBaselineObservationsResponse: FormResponse;
  toggleShowHideBaselineObservations() {
    this.showHideBaselineObservations = !this.showHideBaselineObservations;
  }

  showHideSurgicalHistory: boolean = true;
  formIOSurgicalHistoryId: string = '75618a12-b803-f8d5-9806-acf5331f2641';
  formIOSurgicalHistoryKey: string;
  formIOSurgicalHistoryForm: FormioForm;
  formIOSurgicalHistorySubmission: any;
  formIOSurgicalHistoryResponse: FormResponse;
  toggleShowHideSurgicalHistory() {
    this.showHideSurgicalHistory = !this.showHideSurgicalHistory;
  }

  showHidePhysicalExamination: boolean = true;
  formIOPhysicalExaminationId: string = 'abc10bfa-e0e4-8ea6-9c63-721504302616';
  formIOPhysicalExaminationKey: string;
  formIOPhysicalExaminationForm: FormioForm;
  formIOPhysicalExaminationSubmission: any;
  formIOPhysicalExaminationResponse: FormResponse;
  toggleShowHidePhysicalExamination() {
    this.showHidePhysicalExamination = !this.showHidePhysicalExamination;
  }

  showHideFamilyHistory: boolean = true;
  formIOFamilyHistoryId: string = '8f705e3e-72db-2538-21f5-16eaa1db968b';
  formIOFamilyHistoryKey: string;
  formIOFamilyHistoryForm: FormioForm;
  formIOFamilyHistorySubmission: any;
  formIOPFamilyHistoryResponse: FormResponse;
  toggleShowHideFamilyHistory() {
    this.showHideFamilyHistory = !this.showHideFamilyHistory;
  }

  showHideSocialHistory: boolean = true;
  formIOSocialHistoryId: string = '7b754a96-0236-c147-b225-073beabef29b';
  formIOSocialHistoryKey: string;
  formIOSocialHistoryForm: FormioForm;
  formIOSocialHistorySubmission: any;
  formIOPSocialHistoryResponse: FormResponse;
  toggleShowHideSocialHistory() {
    this.showHideSocialHistory = !this.showHideSocialHistory;
  }

  showHideInfectionControl: boolean = true;
  formIOInfectionControlId: string = '3d5250e0-26ac-2fe1-95e5-cb9e291cc67b';
  formIOInfectionControlKey: string;
  formIOInfectionControlForm: FormioForm;
  formIOInfectionControlSubmission: any;
  formIOPInfectionControlResponse: FormResponse;
  toggleShowHideInfectionControl() {
    this.showHideInfectionControl = !this.showHideInfectionControl;
  }


  showHideInformationProvided: boolean = true;
  formIOInformationProvidedId: string = 'd9db67da-7cff-19b8-79ca-7f71f874284e';
  formIOInformationProvidedKey: string;
  formIOInformationProvidedForm: FormioForm;
  formIOInformationProvidedSubmission: any;
  formIOPInformationProvidedResponse: FormResponse;
  toggleShowHideInformationProvided() {
    this.showHideInformationProvided = !this.showHideInformationProvided;
  }

  showHideFitnessOutcome: boolean = true;
  formIOFitnessOutcomeId: string = '6b80af6c-5651-0d23-6613-15800917274d';
  formIOFitnessOutcomeKey: string;
  formIOFitnessOutcomeForm: FormioForm;
  formIOFitnessOutcomeSubmission: any;
  formIOPFitnessOutcomeResponse: FormResponse;
  toggleShowHideFitnessOutcome() {
    this.showHideFitnessOutcome = !this.showHideFitnessOutcome;
  }


  showHideTasks: boolean = true;
  toggleShowHideTasks() {
    this.showHideTasks = !this.showHideTasks;
  }

  showHideNotes: boolean = true;
  toggleShowHideNotes() {
    this.showHideNotes = !this.showHideNotes;
  }



  expandAllSections() {
    this.showHideGeneral = true;
    this.showHideAssessments = true;
    this.showHideAllergies = true;
    this.showHideCurrentMedications = true;

    this.showHidePastMedicalHistory = true;
    this.showHideBaselineObservations = true;
    this.showHideMedicationHistory = true;
    this.showHideSurgicalHistory = true;
    this.showHidePhysicalExamination = true;
    this.showHideFamilyHistory = true;
    this.showHideSocialHistory = true;
    this.showHideInfectionControl = true;
    this.showHideInformationProvided = true;
    this.showHideFitnessOutcome = true;
    this.showHideTasks = true;
    this.showHideNotes = true;
  }

  collapseAllSections() {
    this.showHideGeneral = false;
    this.showHideAssessments = false;
    this.showHideAllergies = false;
    this.showHideCurrentMedications = false;

    this.showHidePastMedicalHistory = false;
    this.showHideBaselineObservations = false;
    this.showHideMedicationHistory = false;
    this.showHideSurgicalHistory = false;
    this.showHidePhysicalExamination = false;
    this.showHideFamilyHistory = false;
    this.showHideSocialHistory = false;
    this.showHideInfectionControl = false;
    this.showHideInformationProvided = false;
    this.showHideFitnessOutcome = false;
    this.showHideTasks = false;
    this.showHideNotes = false;
  }

  bsConfig: any;

  getNoteListUri: string;
  poaNotes: PreOpNote[];
  async GetNotesForPerson() {
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + this.getNoteListUri)
      .subscribe((response) => {
        this.poaNotes = JSON.parse(response);
        //console.log(this.poaNotes);
      })
    )
   }

   poaTasks: PreOpTask[];
   getTaskListUri: string;
   async GetTasksForPOA() {
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + this.getTaskListUri)
      .subscribe((response) => {
        this.poaTasks = JSON.parse(response);
      })
    )
   }


  @Input() set preOpAssessment(value: PreOpAssessment) {

    this.spinner.show("print-view-spinner");

    this.postPOAURI = this.appService.baseURI + "/PostObject?synapsenamespace=local&synapseentityname=poa_preopassessment";

    this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };

    this.bearerAuthToken = 'bearer ' + this.appService.apiService.authService.user.access_token;

    this.selectedView = 'medsHistory';
    this.personId = value.person_id;
    this.poaId = value.poa_preopassessment_id;

    this.formIOMedicationHistoryKey = 'POA|' + this.formIOMedicationHistoryId + '|' + this.personId + '|' + this.poaId;
    this.formIOPastMedicalHistoryKey = 'POA|' + this.formIOPastMedicalHistoryId + '|' + this.personId + '|' + this.poaId;
    this.formIOBaselineObservationsKey = 'POA|' + this.formIOBaselineObservationsId + '|' + this.personId + '|' + this.poaId;
    this.formIOSurgicalHistoryKey = 'POA|' + this.formIOSurgicalHistoryId + '|' + this.personId + '|' + this.poaId;
    this.formIOPhysicalExaminationKey = 'POA|' + this.formIOPhysicalExaminationId + '|' + this.personId + '|' + this.poaId;

    this.formIOFamilyHistoryKey = 'POA|' + this.formIOFamilyHistoryId + '|' + this.personId + '|' + this.poaId;
    this.formIOSocialHistoryKey = 'POA|' + this.formIOSocialHistoryId + '|' + this.personId + '|' + this.poaId;
    this.formIOInfectionControlKey = 'POA|' + this.formIOInfectionControlId + '|' + this.personId + '|' + this.poaId;
    this.formIOInformationProvidedKey = 'POA|' + this.formIOInformationProvidedId + '|' + this.personId + '|' + this.poaId;
    this.formIOFitnessOutcomeKey = 'POA|' + this.formIOFitnessOutcomeId + '|' + this.personId + '|' + this.poaId;

    this.getAsssessmentSummaryURI = this.appService.baseURI + "/GetObject?synapsenamespace=local&synapseentityname=poa_assessmentsummary&id=" + this.poaId;
    this.GetPOASummary();

    this.getAllergyListForPersonURI = this.appService.baseURI +  "/GetListByAttribute?synapsenamespace=core&synapseentityname=allergyintolerance&synapseattributename=person_id&attributevalue=" + this.personId + "&orderby=clinicalstatusvalue ASC, causativeagentcodesystem DESC, _sequenceid DESC";
    this.getAllergyListForPerson();

    this.getNoteListUri  = "/GetBaseViewListByAttribute/poa_poanotes?synapseattributename=poa_preopassessment_id&attributevalue=" + this.poaId + '&orderby=_createddate DESC';


    this.medsHistoryPOA = value;

    this.getPOAURI = this.appService.baseURI +  "/GetObject?synapsenamespace=local&synapseentityname=poa_preopassessment&id=" + this.poaId;
    this.GetNotesForPerson();

    this.getTaskListUri  = "/GetBaseViewListByAttribute/poa_poatasks?synapseattributename=poa_preopassessment_id&attributevalue=" + this.poaId;
    this.GetTasksForPOA();

    this.getPatientBannerURI = this.appService.baseURI + "/GetBaseViewListObjectByAttribute/poa_patientbanner?synapseattributename=person_id&attributevalue=" + this.personId;
    this.GetPatientBanner();

    this.initData();

    this.collapseAllSections();

    this.gotoTop();

  };

  async initData() {

    await this.GetLivePOA();


  }

  @Output() printViewPOAChange: EventEmitter<PreOpAssessment> = new EventEmitter<PreOpAssessment>();
  update() {
    this.appService.poaId = this.poaId;
    this.printViewPOAChange.emit(this.medsHistoryPOA);
  }


  //@Output() hideScrollBar:EventEmitter<Boolean> =new EventEmitter<Boolean>();
  ngOnInit() {
    //this.hideScrollBar.emit(true);
  }

  ngOnDestroy(): void {
    //this.showCurrentMedsModule = false;
    //this.hideScrollBar.emit(false);
    this.subscriptions.unsubscribe();
  }

  onModuleUnLoad(e) {
    //this.showCurrentMedsModule = false;
  }

  reloadOnUnload() {
    this.LoadCurrentMedsComponent();
  }



  onViewClosed(childViewClosed: boolean) {
    this.selectedView = "medsHistory";
    this.LoadCurrentMedsComponent();
    this.GetLivePOA();
  }

  constructor(private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService, private modalService: BsModalService, private httpClient: HttpClient, private spinner: NgxSpinnerService, private configService: ConfigService, private toasterService: ToasterService, public cd: ChangeDetectorRef, private confirmationDialogService: ConfirmationDialogService, private formioHistoryService: FormioHistoryService, private formioImportService: FormioImportService) {
    this.subjects.currentmedsunload.subscribe(() => {
      this.reloadOnUnload();
    })
  }

  ngAfterViewInit(): void {
    this.LoadCurrentMedsComponent();
  }

  @Output() viewClosed = new EventEmitter<boolean>();

  async GetLivePOA() {
      this.subscriptions.add(
        await this.apiRequest.getRequest(this.getPOAURI)
      .subscribe((response) => {
        this.selectedPOA = JSON.parse(response);

        //Convert any dates
        if(!this.selectedPOA.poadate)
        {
          this.selectedPOA.poadate = null;
        }
        else
        {
          this.selectedPOA.poadate = new Date (this.selectedPOA.poadate as Date);
        }

        if(!this.selectedPOA.admissiondate)
        {
          this.selectedPOA.admissiondate = null;
        }
        else
        {
          this.selectedPOA.admissiondate = new Date (this.selectedPOA.admissiondate as Date);
        }

        if(!this.selectedPOA.dischargedate)
        {
          this.selectedPOA.dischargedate = null;
        }
        else
        {
          this.selectedPOA.dischargedate = new Date (this.selectedPOA.dischargedate as Date);
        }

        if(!this.selectedPOA.revalidateddate)
        {
          this.selectedPOA.revalidateddate = null;
        }
        else
        {
          this.selectedPOA.revalidateddate = new Date (this.selectedPOA.revalidateddate as Date);
        }

        if(!this.selectedPOA.poastatus) {
          this.selectedPOA.poastatus = "In Progress";
        }

        //Initialise all other http calls

        this.GetLinkedEncounters();
        this.GetLinkedEncounter();
        this.loadFormIOFormWithResponse(this.formIOMedicationHistoryId, this.formIOMedicationHistoryKey, 'formIOMedicationHistoryForm');
        this.loadFormIOFormWithResponse(this.formIOPastMedicalHistoryId, this.formIOPastMedicalHistoryKey, 'formIOPastMedicalHistoryForm');
        this.loadFormIOFormWithResponse(this.formIOBaselineObservationsId, this.formIOBaselineObservationsKey, 'formIOBaselineObservationsForm');
        this.loadFormIOFormWithResponse(this.formIOSurgicalHistoryId, this.formIOSurgicalHistoryKey, "formIOSurgicalHistoryForm");
        this.loadFormIOFormWithResponse(this.formIOPhysicalExaminationId, this.formIOPhysicalExaminationKey, "formIOPhysicalExaminationForm");

        this.loadFormIOFormWithResponse(this.formIOFamilyHistoryId, this.formIOFamilyHistoryKey, "formIOFamilyHistoryForm");
        this.loadFormIOFormWithResponse(this.formIOSocialHistoryId, this.formIOSocialHistoryKey, "formIOSocialHistoryForm");
        this.loadFormIOFormWithResponse(this.formIOInfectionControlId, this.formIOInfectionControlKey, "formIOInfectionControlForm");
        this.loadFormIOFormWithResponse(this.formIOInformationProvidedId, this.formIOInformationProvidedKey, "formIOInformationProvidedForm");
        this.loadFormIOFormWithResponse(this.formIOFitnessOutcomeId, this.formIOFitnessOutcomeKey, "formIOFitnessOutcomeForm");

        this.spinner.hide("print-view-spinner");

       // setTimeout(() => {  this.spinner.hide("print-view-spinner"); }, 10000);

      })
    )
  }



  async loadFormIOFormWithResponse(formId: string, formKey: string, formIOFormName: string) {
    this.subscriptions.add(
      await this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=meta&synapseentityname=formbuilderform&id=' + formId)
        .subscribe((response) => {
          var data = JSON.parse(response);



          var components = JSON.parse(data.formcomponents);
          var formResponseUri = "/GetObject?synapsenamespace=core&synapseentityname=formbuilderresponse&id=" + formKey;
          this.apiRequest.getRequest(this.appService.baseURI + formResponseUri)
            .subscribe((data) => {
              var response = JSON.parse(data);

              //
              // console.log('//Start : ' + formIOFormName + '//');
              // console.log(formKey);
              // console.log(response.formresponse);
              // console.log('//End//')
              //

              if (!response.formcomponents) {
                response.formcomponents = JSON.stringify(components);
              }
              //Make readonly
                var resp = [];
                for (const control of JSON.parse(response.formcomponents)) {
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
                  response.formcomponents = JSON.stringify(resp);
              }

                if(!response.formresponse) {
                  response.formresponse = '{}' as any;
                }


                switch(formIOFormName) {
                  case "formIOMedicationHistoryForm":
                    this.formIOMedicationHistoryResponse = response;
                    this.formIOMedicationHistoryForm = { components: JSON.parse(response.formcomponents) };
                    this.formIOMedicationHistorySubmission = this.buildDataObject(response.formresponse, formIOFormName);
                    break;
                  case "formIOPastMedicalHistoryForm":
                    this.formIOPastMedicalHistoryResponse = response;
                    this.formIOPastMedicalHistoryForm = { components: JSON.parse(response.formcomponents) };
                    this.formIOPastMedicalHistorySubmission = this.buildDataObject(response.formresponse, formIOFormName);
                    break;
                  case "formIOBaselineObservationsForm":
                    this.formIOBaselineObservationsResponse = response;
                    this.formIOBaselineObservationsForm = { components: JSON.parse(response.formcomponents) };
                    this.formIOBaselineObservationsSubmission = this.buildDataObject(response.formresponse, formIOFormName);
                    break;
                  case "formIOSurgicalHistoryForm":
                    this.formIOSurgicalHistoryResponse = response;
                    this.formIOSurgicalHistoryForm = { components: JSON.parse(response.formcomponents) };
                    this.formIOSurgicalHistorySubmission = this.buildDataObject(response.formresponse, formIOFormName);
                    break;
                  case "formIOPhysicalExaminationForm":
                    this.formIOPhysicalExaminationResponse = response;
                    this.formIOPhysicalExaminationForm = { components: JSON.parse(response.formcomponents) };
                    this.formIOPhysicalExaminationSubmission = this.buildDataObject(response.formresponse, formIOFormName);
                    break;
                  case "formIOFamilyHistoryForm":
                    this.formIOPFamilyHistoryResponse = response;
                    this.formIOFamilyHistoryForm = { components: JSON.parse(response.formcomponents) };
                    this.formIOFamilyHistorySubmission = this.buildDataObject(response.formresponse, formIOFormName);
                    break;
                  case "formIOSocialHistoryForm":
                    this.formIOPSocialHistoryResponse = response;
                    this.formIOSocialHistoryForm = { components: JSON.parse(response.formcomponents) };
                    this.formIOSocialHistorySubmission = this.buildDataObject(response.formresponse, formIOFormName);
                    break;
                  case "formIOInfectionControlForm":
                    this.formIOPInfectionControlResponse = response;
                    this.formIOInfectionControlForm = { components: JSON.parse(response.formcomponents) };
                    this.formIOInfectionControlSubmission = this.buildDataObject(response.formresponse, formIOFormName);
                    break;
                  case "formIOInformationProvidedForm":
                    this.formIOPInformationProvidedResponse = response;
                    this.formIOInformationProvidedForm = { components: JSON.parse(response.formcomponents) };
                    this.formIOInformationProvidedSubmission = this.buildDataObject(response.formresponse, formIOFormName);
                    break;
                  case "formIOFitnessOutcomeForm":
                    this.formIOPFitnessOutcomeResponse = response;
                    this.formIOFitnessOutcomeForm = { components: JSON.parse(response.formcomponents) };
                    this.formIOFitnessOutcomeSubmission = this.buildDataObject(response.formresponse, formIOFormName);
                    break;
                }

            })
        })
    )
  }

  buildDataObject(response: string, formname: string) {
    var dataObject = JSON.parse('{"data":' + response + '}');
    if(!dataObject) {
      return response;
    }

    if(formname == "formIOPastMedicalHistoryForm") {
      dataObject["data"]["chkOnlyShowPositiveResponses"] = true;
    }

    dataObject["data"]["configBearerAuthToken"] = this.bearerAuthToken;
    dataObject["data"]["configGlobalURL"] = this.globalURL;
    dataObject["data"]["configAutonomicURL"] = this.autonomicURL;
    dataObject["data"]["configTerminologyURL"] = this.terminologyURL;
    dataObject["data"]["configImageServerURL"] = this.imageServerURL;
    dataObject["data"]["configCareRecordURL"] = this.careRecordURL;
    return dataObject;
  }

  componentModuleData: ComponentModuleData;
  scriploaded = false;

  hideModuleLoadingMessage() {
    setTimeout(() => {
      this.scriploaded = true
    }, 2000);
  }

  //API Variables
  globalURL: string = this.appService.baseURI;
  careRecordURL: string = this.appService.carerecordURI;
  terminologyURL: string = this.appService.terminologyURI;
  autonomicURL: string = this.appService.autonomicURI;
  imageServerURL: string = this.appService.imageserverURI;



  //Form Builder Variables
  bearerAuthToken: string;
  appContexts: any;
  triggerRefresh: EventEmitter<unknown>;


  // public formioOptions: FormioOptions = {
  //   'disableAlerts': true
  // };

  //public options: FormioOptions;
  options: Object = {
    submitMessage: "",
    disableAlerts: true,
    noAlerts: true,
    readOnly: true
  }




  LoadCurrentMedsComponent() {

    this.componentModuleData = new ComponentModuleData();
    this.componentModuleData.elementTag = "poa-currentmeds";
    this.componentModuleData.url = this.appService.currentMedicationModuleURI;
    this.componentModuleData.datacontract = {
      referralId: "",
      poaId: this.poaId,
      personId: this.personId,
      apiService: this.appService.apiService,
      unload: new Subject(),
      isReadOnly: true
    };

    this.cd.detectChanges();

  }


  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }






  async onSubmit(submission: any) {
  }




  async GetLinkedEncounters() {
    this.getLinkedEncounterListURI = this.appService.baseURI + "/GetBaseViewListByAttribute/poa_linkedencounters?synapseattributename=person_id&attributevalue=" + this.selectedPOA.person_id;
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getLinkedEncounterListURI)
      .subscribe((response) => {
        this.linkedEncounterList = JSON.parse(response);
      })
    )
  }

  async GetLinkedEncounter() {

    if(!this.selectedPOA.linkedencounterid) {
      this.linkedEncounter = null;
      this.selectedPOA.lockedonadmission = false;
      this.selectedPOA.islocked = false;
      return;
    }
    if(this.selectedPOA.linkedencounterid === null) {
      this.linkedEncounter = null;
      this.selectedPOA.lockedonadmission = false;
      this.selectedPOA.islocked = false;
      return;
    }

    if(this.selectedPOA.linkedencounterid === "null") {
      this.linkedEncounter = null;
      this.selectedPOA.lockedonadmission = false;
      this.selectedPOA.islocked = false;
      return;
    }

    this.getLinkedEncounterURI = this.appService.baseURI + "/GetBaseViewListObjectByAttribute/poa_linkedencounters?synapseattributename=encounter_id&attributevalue=" + this.selectedPOA.linkedencounterid;
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getLinkedEncounterURI)
      .subscribe((dataResponse) => {
        this.linkedEncounter = JSON.parse(dataResponse);
      })

    )



  }


  //--------------------------------------
// Navigation
//--------------------------------------

async cancel() {

  //console.log("this.appService.displayWarnings:" + this.appService.displayWarnings);

  var displayConfirmation = this.appService.displayWarnings;
  if(displayConfirmation) {
    var response = false;
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go to the main menu? Any new changes will not be saved')
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
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go to the menu? Any new changes will not be saved')
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
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go back to the previous screen? Any new changes will not be saved')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  this.appService.viewToShow = 'nursingAssessment';
  this.viewClosed.emit(true);
}

async next() {

  //console.log("this.appService.displayWarnings:" + this.appService.displayWarnings);

  var displayConfirmation = this.appService.displayWarnings;
  if(displayConfirmation) {
    var response = false;
    await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to go to the next screen? Any new changes will not be saved')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  this.appService.viewToShow = 'nursingAssessment';
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


async markPrinted(completed) {
  //Get the latest version in case someone has changed something in another section at the same time
 this.subscriptions.add(
   this.apiRequest.getRequest(this.getPOAURI)
   .subscribe((response) => {
     this.selectedPOA = JSON.parse(response);
     //Ubdate the observable
     this.selectedPOA.isprinted = completed;
     if(completed) {
        this.selectedPOA.printeddate = new Date();
        this.selectedPOA.printeduser = this.appService.loggedInUserName;
     }
     else
     {
      this.selectedPOA.printeddate = null;
      this.selectedPOA.printeduser = null;
     }

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



}

