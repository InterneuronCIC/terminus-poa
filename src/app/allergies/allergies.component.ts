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
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Inject, Input, LOCALE_ID, OnDestroy, OnInit, Output } from '@angular/core';
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
import { AllergyCriticality } from '../models/entities/allergy-criticality';
import { AllergyIntolerance } from '../models/entities/allergy-intolerance';
import { AllergyCategory } from '../models/entities/allergy-category';
import { AllergyClinicalStatus } from '../models/entities/allergy-clinical-status';
import { AllergyVerificationStatus } from '../models/entities/allergy-verification-status';
import { Guid } from 'guid-typescript';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { AllergyReportedByGroup } from '../models/entities/allergy-reported-by-group';
// import { ThrowStmt } from '@angular/compiler';
// import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
import { SNOMED } from '../models/snomed-model';
import { TerminologyConcept } from '../models/terminology-concept';
// import { escapeRegExp } from '@angular/compiler/src/util';
import { AllergyLookupDescriptionsService } from '../allergy-lookup-descriptions/allergy-lookup-descriptions.service';
import { AllergyHistoryViewerService } from '../allergy-history-viewer/allergy-history-viewer.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { AllergyWithMeta } from '../models/baseviews/allergy-with-meta';

@Component({
  selector: 'app-allergies',
  templateUrl: './allergies.component.html',
  styleUrls: ['./allergies.component.css']
})
export class AllergiesComponent {

  subscriptions: Subscription = new Subscription();
  poaId: string;
  personId: string;

  allergyIntolerance: AllergyIntolerance;
  oldVerificationStatus: string;
  oldreportedbyname: string;
  oldreportedbygroup: string;

  allergyIntoleranceList: AllergyWithMeta[];
  categoryList: AllergyCategory[];
  clinicalStatusList: AllergyClinicalStatus[];
  criticalityList: AllergyCriticality[];
  verificationStatusList: AllergyVerificationStatus[];
  reportedByGroupList: AllergyReportedByGroup[];
 //allergyList: AllergyList[];

  refreshingList: boolean;

  selectedAllergiesView: string;
  displayWarningMessage: String;

  addAllergyStep: Number;

  showAllergyReactions: boolean;

  maxDateValue: Date = new Date();

  saving: boolean = false;

  //Date Picker Models
  model: any;
  bsConfig: any;

  //Multiselect
  dropdownList = [];
  selectedItems = [];
  dropdownSettings:IDropdownSettings = {} as IDropdownSettings;
  onItemSelect(item: any) {
    //this.getTaskName();
  }
  onSelectAll(items: any) {
    //this.getTaskName();
  }
  //Multiselect

  getAllergyListForPersonURI: string;
  getAllergyURI: string = this.appService.baseURI + "/GetObject?synapsenamespace=core&synapseentityname=allergyintolerance&id=";
  postAllergyURI: string = this.appService.baseURI + "/PostObject?synapsenamespace=core&synapseentityname=allergyintolerance";
  getCategoryListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycategory&orderby=displayorder ASC";
  getClinicalStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyclinicalstatus&orderby=displayorder ASC";
  getCriticalityListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycriticality&orderby=displayorder ASC";
  getVerificationStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyverificationstatus&orderby=displayorder ASC";
  getReportedByGroupListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyreportedbygroup&orderby=displayorder ASC";
  private _preOpAssessment: PreOpAssessment;
  @Input() set preOpAssessment(value: PreOpAssessment) {

    this.saving = false;

    this.selectedAllergiesView = "list";
    this.refreshingList = false;
    this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };
    this.addAllergyStep = 1
    this.showAllergyReactions = true;

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'allergyreportedbygroup_id',
      textField: 'groupname',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 10,
      allowSearchFilter: true
    };

    this.personId = value.person_id;
    this.poaId = value.poa_preopassessment_id;

    //this.getAllergyListForPersonURI = this.appService.baseURI +  "/GetListByAttribute?synapsenamespace=core&synapseentityname=allergyintolerance&synapseattributename=person_id&attributevalue=" + this.personId + "&orderby=clinicalstatusvalue ASC, causativeagentcodesystem DESC, _sequenceid DESC";

    this.getAllergyListForPersonURI = this.appService.baseURI +  "/GetBaseViewListByAttribute/poa_allergylist?synapseattributename=person_id&attributevalue=" + this.personId + "&orderby=clinicalstatusvalue ASC, causativeagentcodesystem DESC, _sequenceid DESC";


    this.getPOAURI = this.appService.baseURI +  "/GetObject?synapsenamespace=local&synapseentityname=poa_preopassessment&id=" + this.poaId;
    this.postPOAURI = this.appService.baseURI + "/PostObject?synapsenamespace=local&synapseentityname=poa_preopassessment";
    this.initialiseData();

    this.gotoTop();

  };
  get preOpAssessment(): PreOpAssessment { return this._preOpAssessment; }

  @Output() viewClosed = new EventEmitter<boolean>();

  resetAllergy() {
    //this.inactiveErrorCheck = 'No error';
    //this.inactiveErrorMessage = '';

    this.allergyIntolerance = {} as AllergyIntolerance;
  }

  async recordNoKnownAllergies() {


    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to record that this patient has no known allergies?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }

    this.allergyIntolerance = {} as AllergyIntolerance;


    this.allergyIntolerance.allergyintolerance_id = String(Guid.create());
    this.allergyIntolerance.person_id = this.personId;
    this.allergyIntolerance.encounter_id = null;

    this.allergyIntolerance.causativeagentcodesystem = "NON-ALLERGY";
    this.allergyIntolerance.causativeagentcode = "No known allergies";
    this.allergyIntolerance.causativeagentdescription = "No known allergies";

    this.allergyIntolerance.clinicalstatusvalue = "Active";
    this.allergyIntolerance.clinicalstatusby = this.appService.loggedInUserName;
    this.allergyIntolerance.cliinicialstatusdatetime = this.getDateTime();

    this.allergyIntolerance.category = "Flag";
    this.allergyIntolerance.criticality = "Unable to Assess";

    this.allergyIntolerance.onsetdate = this.getDate();
    this.allergyIntolerance.enddate = null;
    this.allergyIntolerance.lastoccurencedate = this.getDate();

    this.allergyIntolerance.reportedbygroup = '[ { "allergyreportedbygroup_id": "Patient", "groupname": "Patient" } ]';
    this.allergyIntolerance.reportedbyname = this.appService.currentPersonName;
    this.allergyIntolerance.reportedbydatetime = this.getDateTime();

    this.allergyIntolerance.recordedby = this.appService.loggedInUserName;
    this.allergyIntolerance.recordeddatetime = this.getDateTime();

    this.allergyIntolerance.verificationstatus = "Unconfirmed";
    this.allergyIntolerance.assertedby = this.appService.loggedInUserName;
    this.allergyIntolerance.asserteddatetime = this.getDateTime();

    //this.allergyIntolerance.category = "Flag";
    this.allergyIntolerance.reactionconcepts = '{"_term":"flag","_code":"flag","bindingValue":"flag | flag","fsn":"flag","level":0,"parentCode":null}';

    this.allergyIntolerance. allergynotes = null;
    this.allergyIntolerance.manifestationnotes = null;

    this.subscriptions.add(
      this.apiRequest.postRequest(this.postAllergyURI, this.allergyIntolerance)
        .subscribe((response) => {

         this.toasterService.showToaster("Success","No Allergies for patient recorded");
         this.resetAllergy();
         //Update patient banner
         this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
         this.getAllergyListForPerson();

        })
      )

  }


  async recordNewRandomAllergy() {

    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to record that it has not posible to ascertain if the patient has any allergies?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }

    this.allergyIntolerance = {} as AllergyIntolerance;


    this.allergyIntolerance.allergyintolerance_id = String(Guid.create());
    this.allergyIntolerance.person_id = this.personId;
    this.allergyIntolerance.encounter_id = null;

    this.allergyIntolerance.causativeagentcodesystem = "SNOMED CT";
    this.allergyIntolerance.causativeagentcode = "67866001";
    this.allergyIntolerance.causativeagentdescription = "Insulin";

    this.allergyIntolerance.clinicalstatusvalue = "Active";
    this.allergyIntolerance.clinicalstatusby = this.appService.loggedInUserName;
    this.allergyIntolerance.cliinicialstatusdatetime = this.getDateTime();

    this.allergyIntolerance.category = "Adverse Drug Reaction";
    this.allergyIntolerance.criticality = "Life Threatening";

    this.allergyIntolerance.onsetdate = this.getDate();
    this.allergyIntolerance.enddate = null;
    this.allergyIntolerance.lastoccurencedate = this.getDate();

    this.allergyIntolerance.reportedbygroup = "Patient";
    this.allergyIntolerance.reportedbyname = this.appService.currentPersonName;
    this.allergyIntolerance.reportedbydatetime = this.getDateTime();

    this.allergyIntolerance.recordedby = this.appService.loggedInUserName;
    this.allergyIntolerance.recordeddatetime = this.getDateTime();

    this.allergyIntolerance.verificationstatus = "Unconfirmed";
    this.allergyIntolerance.assertedby = this.appService.loggedInUserName;
    this.allergyIntolerance.asserteddatetime = this.getDateTime();

    this.allergyIntolerance. allergynotes = null;
    this.allergyIntolerance.manifestationnotes = null;

    this.subscriptions.add(
      this.apiRequest.postRequest(this.postAllergyURI, this.allergyIntolerance)
        .subscribe((response) => {

         this.toasterService.showToaster("Success","Not posible to ascertain recorded");
         this.resetAllergy();
         this.getAllergyListForPerson();

        })
      )

  }



  async recordNotAbleToVerify() {

    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to record that it has not posible to ascertain if the patient has any allergies?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }

    this.allergyIntolerance = {} as AllergyIntolerance;


    this.allergyIntolerance.allergyintolerance_id = String(Guid.create());
    this.allergyIntolerance.person_id = this.personId;
    this.allergyIntolerance.encounter_id = null;

    this.allergyIntolerance.causativeagentcodesystem = "NON-ALLERGY";
    this.allergyIntolerance.causativeagentcode = "Not posible to ascertain if patient has any allergies";
    this.allergyIntolerance.causativeagentdescription = "Not posible to ascertain if patient has any allergies";

    this.allergyIntolerance.clinicalstatusvalue = "Active";
    this.allergyIntolerance.clinicalstatusby = this.appService.loggedInUserName;
    this.allergyIntolerance.cliinicialstatusdatetime = this.getDateTime();

    this.allergyIntolerance.category = "Flag";
    this.allergyIntolerance.criticality = "Unable to Assess";

    this.allergyIntolerance.onsetdate = this.getDate();
    this.allergyIntolerance.enddate = null;
    this.allergyIntolerance.lastoccurencedate = this.getDate();

    this.allergyIntolerance.reportedbygroup = '[ { "allergyreportedbygroup_id": "Patient", "groupname": "Patient" } ]';
    this.allergyIntolerance.reportedbyname = this.appService.currentPersonName;
    this.allergyIntolerance.reportedbydatetime = this.getDateTime();

    this.allergyIntolerance.recordedby = this.appService.loggedInUserName;
    this.allergyIntolerance.recordeddatetime = this.getDateTime();

    this.allergyIntolerance.verificationstatus = "Unconfirmed";
    this.allergyIntolerance.assertedby = this.appService.loggedInUserName;
    this.allergyIntolerance.asserteddatetime = this.getDateTime();

    this.allergyIntolerance. allergynotes = null;
    this.allergyIntolerance.manifestationnotes = null;

        //this.allergyIntolerance.category = "Flag";
        this.allergyIntolerance.reactionconcepts = '{"_term":"flag","_code":"flag","bindingValue":"flag | flag","fsn":"flag","level":0,"parentCode":null}';

    this.subscriptions.add(
      this.apiRequest.postRequest(this.postAllergyURI, this.allergyIntolerance)
        .subscribe((response) => {

         this.toasterService.showToaster("Success","Not posible to ascertain recorded");
         this.resetAllergy();
          //Update patient banner
          this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
         this.getAllergyListForPerson();

        })
      )

  }

  async initialiseData() {
    await this.GetLivePOA();
    await this.getAllergyListForPerson();
    await this.getCategoryList();
    await this.getClinicalStatusList();
    await this.getCriticalityList();
    await this.getVerificationStatusList();
    await this.getReportedByList();
  }

  async  getAllergyListForPerson() {
    this.refreshingList = true;
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getAllergyListForPersonURI)
     .subscribe((response) => {
       this.allergyIntoleranceList = JSON.parse(response);
       this.refreshingList = false;
     })
   )
  }


  get activeAllergies(): AllergyWithMeta[] {
      return this.allergyIntoleranceList.filter((a) =>
        a.clinicalstatusvalue == 'Active' && a.causativeagentcodesystem != "NON-ALLERGY"
      );
  }

  get activeAllergiesAndFlags(): AllergyWithMeta[] {
    return this.allergyIntoleranceList.filter((a) =>
      a.clinicalstatusvalue == 'Active' && a.causativeagentcode != this.allergyIntolerance.causativeagentcode
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

  async  getCategoryList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getCategoryListURI)
     .subscribe((response) => {
       this.categoryList = JSON.parse(response);
     })
   )
  }

  async  getReportedByList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getReportedByGroupListURI)
     .subscribe((response) => {
       this.getReportedByList = JSON.parse(response);
     })
   )
  }


  async  getClinicalStatusList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getClinicalStatusListURI)
     .subscribe((response) => {
       this.clinicalStatusList = JSON.parse(response);
     })
   )
  }

  async  getCriticalityList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getCriticalityListURI)
     .subscribe((response) => {
       this.criticalityList = JSON.parse(response);
     })
   )
  }

  async  getVerificationStatusList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getVerificationStatusListURI)
     .subscribe((response) => {
       this.verificationStatusList = JSON.parse(response);
     })
   )
  }


  //verificationStatusList: AllergyVerificationStatus[];

  get poaOnlyVerificationStatusList(): AllergyVerificationStatus[] {

      return this.verificationStatusList.filter((a) =>
        a.poaonly == true
      );

  }


  save() {
    this.viewClosed.emit(true);
  }



  constructor(private apiRequest: ApirequestService, public appService: AppService, private subjects: SubjectsService, private spinner: NgxSpinnerService, private toasterService: ToasterService, private modalService: BsModalService, @Inject(LOCALE_ID) private locale: string, private confirmationDialogService: ConfirmationDialogService, private allergyLookupDescriptionsService: AllergyLookupDescriptionsService, private allergyHistoryViewerService: AllergyHistoryViewerService) {

  }

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
        this.selectedPOA.iscompletedallergies = completed;
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

  getDate(): Date {
    var date = new Date();
    return date;
  }



  addAllergy() {

    this.saving = false;

    this.allergyIntolerance = {} as AllergyIntolerance;


    this.allergyIntolerance.allergyintolerance_id = String(Guid.create());
    this.allergyIntolerance.person_id = this.personId;
    this.allergyIntolerance.encounter_id = null;


    this.allergyIntolerance.clinicalstatusvalue = "Active";
    this.allergyIntolerance.clinicalstatusby = this.appService.loggedInUserName;
    this.allergyIntolerance.cliinicialstatusdatetime = this.getDateTime();

    this.allergyIntolerance.category = "Allergy";
    this.allergyIntolerance.criticality = "Non-Life Threatening";

    this.allergyIntolerance.onsetdate = this.getDate();
    this.allergyIntolerance.enddate = null;
    this.allergyIntolerance.lastoccurencedate = this.getDate();

    this.allergyIntolerance.reportedbygroup = JSON.parse('[ { "allergyreportedbygroup_id": "Patient", "groupname": "Patient" } ]');
    this.allergyIntolerance.reportedbyname = this.appService.currentPersonName;
    this.allergyIntolerance.reportedbydatetime = this.getDateTime();

    this.allergyIntolerance.recordedby = this.appService.loggedInUserName;
    this.allergyIntolerance.recordeddatetime = this.getDateTime();

    this.allergyIntolerance.verificationstatus = "Unconfirmed";
    this.allergyIntolerance.assertedby = this.appService.loggedInUserName;
    this.allergyIntolerance.asserteddatetime = this.getDateTime();

    this.allergyIntolerance. allergynotes = null;
    this.allergyIntolerance.manifestationnotes = null;

    this.allergyIntolerance.allergyconcept = {} as SNOMED;
    this.allergyIntolerance.reactionconcepts = [] as SNOMED[];

    this.allergyIntolerance.displaywarning = "No errors";


    this.selectedAllergiesView = "add";
    this.addNonCodedAllergy = false;
    this.addAllergyStep = 1;
  }


  async refreshAlllergyList() {
    await this.getAllergyListForPerson();
  }

  async cancelAddingAllergy() {
    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to cancel adding an allergy?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }
    this.resetAllergy();
    this.selectedAllergiesView = "list";

  }

  async cancelEditingAllergy() {
    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to cancel edditng the allergy?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }
    this.resetAllergy();
    this.selectedAllergiesView = "list";
  }


  async saveEditAllergy() {

        //Supply any prompts to deal with complex logic
        if(this.allergyIntolerance.verificationstatus === "Entered in error" && this.allergyIntolerance.clinicalstatusvalue == 'Active') {
          var response = false;
          await this.confirmationDialogService.confirm("Please confirm", "Verification status is 'Entered in error' and status is 'Active'. Do you want to update the status to 'Inactive'?")
          .then((confirmed) => response = confirmed)
          .catch(() => response = false);
          if(!response) {

          }
          else {
            this.allergyIntolerance.clinicalstatusvalue = "Inactive";
          }
        }





        //Update any logic
        if(this.allergyIntolerance.clinicalstatusvalue === 'Active') {
          this.allergyIntolerance.enddate = null;
        }

        //console.log('verificationstatus: ' + this.allergyIntolerance.verificationstatus + ' - ' + this.uneditedAllergyIntollerence.verificationstatus);

        if(this.allergyIntolerance.verificationstatus != this.oldVerificationStatus) {
          this.allergyIntolerance.assertedby = this.appService.loggedInUserName;
          this.allergyIntolerance.asserteddatetime = this.getDateTime();
        }

        if(this.allergyIntolerance.reportedbyname != this.oldreportedbyname) {
          this.allergyIntolerance.reportedbydatetime = this.getDateTime();
        }

        if(this.allergyIntolerance.reportedbygroup != this.oldreportedbygroup) {
          this.allergyIntolerance.reportedbydatetime = this.getDateTime();
        }

        this.showAllergyReactions = false;
        //Convert any dates
        this.allergyIntolerance.onsetdate = this.allergyIntolerance.onsetdate as Date;
        this.allergyIntolerance.enddate = this.allergyIntolerance.enddate as Date;
        this.allergyIntolerance.lastoccurencedate = this.allergyIntolerance.lastoccurencedate as Date;

        //Convert concepts to strings
        this.saving = true;

        this.allergyIntolerance.allergyconcept = JSON.stringify(this.allergyIntolerance.allergyconcept);
        this.allergyIntolerance.reactionconcepts = JSON.stringify(this.allergyIntolerance.reactionconcepts);
        this.allergyIntolerance.reportedbygroup = JSON.stringify(this.allergyIntolerance.reportedbygroup);

        //update the entity record
        await this.subscriptions.add(
          this.apiRequest.postRequest(this.postAllergyURI, this.allergyIntolerance)
            .subscribe((response) => {

              this.saving = false;

              this.toasterService.showToaster("Success","Allergy Saved");

              this.getAllergyListForPerson();

              //Update patient banner
              this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");


              if(this.allergyIntolerance.causativeagentcodesystem != "NON-ALLERGY" && this.allergyIntolerance.clinicalstatusvalue === "Active") {
                this.allergyIntoleranceList.forEach( (element) => {

                  if(element.causativeagentcodesystem == "NON-ALLERGY" && element.clinicalstatusvalue === "Active" ) {
                    //this.markAllergyInactive(element);

                    element.clinicalstatusvalue = 'Inactive';
                    element.enddate = this.getDate();

                    //update the entity record
                    this.subscriptions.add(
                      this.apiRequest.postRequest(this.postAllergyURI, element)
                        .subscribe((response) => {
                          //Update patient banner
                          this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
                          this.getAllergyListForPerson();
                          this.toasterService.showToaster("Info", element.causativeagentdescription + ' set to inactive');
                        })
                      )



                  }
              });

              }


              this.showAllergyReactions = true;

              this.resetAllergy();

              this.selectedAllergiesView = "list";
            })
          )
  }

  async editAllergy(allergy: AllergyIntolerance) {

    this.saving = false;

    this.showAllergyReactions = false;

    var getAllergyAddress = this.getAllergyURI + allergy.allergyintolerance_id;
    //this.getAllergyURI = this.getAllergyURI + allergy.allergyintolerance_id;


    this.subscriptions.add(
      this.apiRequest.getRequest(getAllergyAddress)
      .subscribe((response) => {
        this.allergyIntolerance = JSON.parse(response);


        try {
          this.allergyIntolerance.reportedbygroup = JSON.parse(this.allergyIntolerance.reportedbygroup);
        }
        catch(ex) {
          this.allergyIntolerance.reportedbygroup = JSON.parse('[]');
        }

        this.oldVerificationStatus = this.allergyIntolerance.verificationstatus;
        this.oldreportedbyname = this.allergyIntolerance.reportedbyname;
        this.oldreportedbygroup = this.allergyIntolerance.reportedbygroup;
        this.checkActiveEnteredInError();

        //Convert any dates
      if(!this.allergyIntolerance.onsetdate)
      {
        this.allergyIntolerance.onsetdate = null;
      }
      else
      {
        this.allergyIntolerance.onsetdate = new Date (this.allergyIntolerance.onsetdate as Date);
      }

      if(!this.allergyIntolerance.enddate)
      {
        this.allergyIntolerance.enddate = null;
      }
      else
      {
        this.allergyIntolerance.enddate = new Date (this.allergyIntolerance.enddate as Date);
      }

      if(!this.allergyIntolerance.lastoccurencedate)
      {
        this.allergyIntolerance.lastoccurencedate = null;
      }
      else
      {
        this.allergyIntolerance.lastoccurencedate = new Date (this.allergyIntolerance.lastoccurencedate as Date);
      }



      //Cast concept strings to concepts
      if(this.allergyIntolerance.category == "Flag") {
        this.allergyIntolerance.reactionconcepts = '[{"_term":"flag","_code":"flag","bindingValue":"flag | flag","fsn":"flag","level":0,"parentCode":null}]';
      }

      if(this.allergyIntolerance.category == "Flag") {
        this.allergyIntolerance.allergyconcept = '{"_term":"flag","_code":"flag","bindingValue":"flag | flag","fsn":"flag","level":0,"parentCode":null}';
      }


      this.allergyIntolerance.allergyconcept = JSON.parse(this.allergyIntolerance.allergyconcept) as SNOMED;

      this.allergyIntolerance.reactionconcepts = this.replaceAll(this.allergyIntolerance.reactionconcepts, '_term', 'term');
      this.allergyIntolerance.reactionconcepts = this.replaceAll(this.allergyIntolerance.reactionconcepts, '_code', 'code');
      this.allergyIntolerance.reactionconcepts = JSON.parse(this.allergyIntolerance.reactionconcepts) as SNOMED[];

      //console.log( this.allergyIntolerance.reactionconcepts);



      this.selectedAllergiesView = "edit";

      this.showAllergyReactions = true;

      this.gotoTop();


      })
    )

  }

  replaceAll(str, find, replace) {
    if(!str) {
      return null;
    }
    return str.replace(new RegExp(this.escapeRegex(find), 'g'), replace);
  }

  escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }


  async saveAddAllergy() {

    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to add this allergy?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }

    //Supply any prompts to deal with complex logic
    if(this.allergyIntolerance.verificationstatus === "Entered in error" && this.allergyIntolerance.clinicalstatusvalue == 'Active') {
      var response = false;
      await this.confirmationDialogService.confirm("Please confirm", "Verification status is 'Entered in error' and status is 'Active'. Do you want to update the status to 'Inactive'?")
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {

      }
      else {
        this.allergyIntolerance.clinicalstatusvalue = "Inactive";
      }
    }


    this.showAllergyReactions = false;

    //Update any logic
    if(this.allergyIntolerance.clinicalstatusvalue === 'Active') {
      this.allergyIntolerance.enddate = null;
    }

    this.saving = true;
    this.allergyIntolerance.allergyconcept = JSON.stringify(this.allergyIntolerance.allergyconcept);
    this.allergyIntolerance.reactionconcepts = JSON.stringify(this.allergyIntolerance.reactionconcepts);
    this.allergyIntolerance.reportedbygroup = JSON.stringify(this.allergyIntolerance.reportedbygroup);

    //console.log('verificationstatus: ' + this.allergyIntolerance.verificationstatus + ' - ' + this.uneditedAllergyIntollerence.verificationstatus);

    //Convert any dates
    this.allergyIntolerance.onsetdate = this.allergyIntolerance.onsetdate as Date;
    this.allergyIntolerance.enddate = this.allergyIntolerance.enddate as Date;
    this.allergyIntolerance.lastoccurencedate = this.allergyIntolerance.lastoccurencedate as Date;

    //update the entity record
    await this.subscriptions.add(
      this.apiRequest.postRequest(this.postAllergyURI, this.allergyIntolerance)
        .subscribe((response) => {

          this.saving = false;

          this.toasterService.showToaster("Success","Allergy Saved");
          //Update patient banner
          this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");

          this.getAllergyListForPerson();

          if(this.allergyIntolerance.causativeagentcodesystem != "NON-ALLERGY" && this.allergyIntolerance.clinicalstatusvalue === "Active") {
            this.allergyIntoleranceList.forEach( (element) => {

              if(element.causativeagentcodesystem == "NON-ALLERGY" && element.clinicalstatusvalue === "Active" ) {
                //this.markAllergyInactive(element);

                delete element['poaonly'];
                delete element['poaname'];
                element.reportedbygroup = JSON.parse(element.reportedbygroup);
                element.reportedbygroup = JSON.stringify(element.reportedbygroup);
                element.clinicalstatusvalue = 'Inactive';
                element.enddate = this.getDate();

                //update the entity record
                this.subscriptions.add(
                  this.apiRequest.postRequest(this.postAllergyURI, element)
                    .subscribe((response) => {
                      //Update patient banner
                      this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
                      this.getAllergyListForPerson();
                      this.toasterService.showToaster("Info", element.causativeagentdescription + ' set to inactive');
                    })
                  )

                  this.showAllergyReactions = true;



              }
          });

          }




          this.resetAllergy();

          this.selectedAllergiesView = "list";
        })
      )
}



  async markAllergyInactive(allergy: AllergyIntolerance) {
    allergy.clinicalstatusvalue = 'Inactive';
    allergy.enddate = this.getDate();

    //update the entity record
    await this.subscriptions.add(
      this.apiRequest.postRequest(this.postAllergyURI, allergy)
        .subscribe((response) => {
          this.toasterService.showToaster("Info", allergy.causativeagentdescription + ' set to inactive');
        })
      )


  }

  reportedByMe() {
    this.allergyIntolerance.reportedbyname = this.appService.loggedInUserName;
  }

  reportedByPatient() {
    this.allergyIntolerance.reportedbyname = this.appService.currentPersonName;
  }

  endDateToday() {
    this.allergyIntolerance.enddate = new Date (this.getDate() as Date);
  }

  async reverifyAllergy() {
    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to reverify?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }
    this.allergyIntolerance.assertedby = this.appService.loggedInUserName;
    this.allergyIntolerance.asserteddatetime = this.getDateTime();
    this.toasterService.showToaster('info', "Reverified - will be actioned on save");
  }

  checkActiveEnteredInError() {

    if(this.allergyIntolerance.verificationstatus === "Entered in error" && this.allergyIntolerance.clinicalstatusvalue == 'Active') {
      this.allergyIntolerance.displaywarning = null;
      this.displayWarningMessage = "Unable to have Status set to 'Active' and Verification Status set to 'Entered in error'";
    }
    else {
      this.allergyIntolerance.displaywarning = "No errors";
      this.displayWarningMessage = "";
    }

  }



  // Terminology

  results: SNOMED[] = [];
  resultsReactions: SNOMED[] = [];

  otherConcept: TerminologyConcept = {
      concept_id: 9177,
      conceptcode: "74964007",
      conceptname: "Non-coded"
  }


  addNonCodedAllergy: boolean;

  search(event) {
    this.subscriptions.add(
        this.apiRequest.getRequest(this.appService.terminologyURI.replace("VALUE", event.query + "/substance?api-version=1.0"))
            .subscribe((response) => {
                let resultsFromDb: SNOMED[] = [];



                let concept: SNOMED = new SNOMED();
                concept.code = this.otherConcept.conceptcode;
                concept.term = event.query + ' (Non-coded)';

                resultsFromDb.push(concept);

                response.data.forEach((item) => {
                    let snomedData: SNOMED = new SNOMED();
                    snomedData.code = item.code;
                    snomedData.fsn = item.fsn;
                    snomedData.level = item.level;
                    snomedData.parentCode = item.parentCode;
                    snomedData.term = item.term;
                    resultsFromDb.push(snomedData);
                })
                this.results = resultsFromDb;
            })
    );
}

selectedValue(diag: SNOMED) {



    // console.log(diag.code);

    // if(!diag) {
    //   console.log('You have selected an invalid allergen');
    // }
    // let selectedAllergy = [];

    // if (diag.code == this.otherConcept.conceptcode) {
    //     selectedAllergy = this.operationDiagnosis.filter(x =>
    //         (x.diagnosistext.toLowerCase().replace(/ /g, '') == diag.term.toLowerCase().replace(/ /g, '')));
    // }
    // else {
    //     selectedAllergy = this.operationDiagnosis.filter(x => x.diagnosiscode == diag.code);
    // }

    // if (addedProcs.length == 0) {
    //     let diagnosis: CoreDiagnosis = new CoreDiagnosis();
    //     diagnosis.diagnosis_id = diag.code + '|' + this.operationId,
    //         diagnosis.operation_id = this.operationId,
    //         diagnosis.statuscode = 'Active',
    //         diagnosis.statustext = 'Active',
    //         diagnosis.diagnosiscode = diag.code,
    //         diagnosis.diagnosistext = diag.term

      //     this.operationDiagnosis.push(diagnosis);
      // }
  }

  get existingAllergies(): AllergyWithMeta[] {
    if(!this.allergyIntoleranceList) {
      //console.log(1);
      return [] as AllergyWithMeta[];
    }
    if(!this.allergyIntolerance.allergyconcept) {
      //console.log(2);
      return [] as AllergyWithMeta[];
    }

    if(this.allergyIntolerance.allergyconcept.code === '74964007') {
      //console.log(2);
      return [] as AllergyWithMeta[];
    }

    //console.log(3);
    //console.log(this.allergyIntolerance.allergyconcept);
    return this.allergyIntoleranceList.filter((a) =>
      a.causativeagentcode == this.allergyIntolerance.allergyconcept.code
    );
}


  unSelectedValue(event) {
      // this.confirmationService.confirm({
      //     message: 'Are you sure that you want to delete this diagnosis?',
      //     accept: () => {
      //         for (var i = 0; i < this.operationDiagnosis.length; i++) {
      //             if (this.operationDiagnosis[i].diagnosistext === event.term) {
      //                 this.operationDiagnosis.splice(i, 1);
      //                 i--;
      //             }
      //         }
      //     },
      //     reject: () => {
      //         this.ac.selectItem(event);
      //     }
      // });
  }

  clearSelectedAllergy() {
    this.allergyIntolerance.allergyconcept = null;
  }


  addAllergyStep1Next() {
    this.allergyIntolerance.causativeagentcode = this.allergyIntolerance.allergyconcept.code;
    this.allergyIntolerance.causativeagentcodesystem = 'SNOMED CT';
    this.allergyIntolerance.causativeagentdescription = this.allergyIntolerance.allergyconcept.term;
    //this.allergyIntolerance.allergyconcept = this.allergyIntolerance.allergyconcept;
    this.addAllergyStep = 2;
  }

  addAllergyStep2Next() {
    //this.allergyIntolerance.reactionconcepts = this.reactionsToAdd;
    this.addAllergyStep = 3;
  }

  addAllergyStep2Back() {
    this.addAllergyStep = 1;
  }

  addAllergyStep3Back() {
    this.addAllergyStep = 2;
  }

//
searchReactions(event) {
  this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.terminologyURI.replace("VALUE", event.query + "/disorder?api-version=1.0"))
          .subscribe((response) => {
              let resultsFromDb: SNOMED[] = [];



              let concept: SNOMED = new SNOMED();
              concept.code = this.otherConcept.conceptcode;
              concept.term = event.query + ' (Non-coded)';

              resultsFromDb.push(concept);

              response.data.forEach((item) => {
                  let snomedData: SNOMED = new SNOMED();
                  snomedData.code = item.code;
                  snomedData.fsn = item.fsn;
                  snomedData.level = item.level;
                  snomedData.parentCode = item.parentCode;
                  snomedData.term = item.term;
                  resultsFromDb.push(snomedData);
              })
              this.resultsReactions = resultsFromDb;
          })
  );
}

selectReactionValue(diag: SNOMED) {



  // console.log(diag.code);

  // if(!diag) {
  //   console.log('You have selected an invalid allergen');
  // }
  // let selectedAllergy = [];

  // if (diag.code == this.otherConcept.conceptcode) {
  //     selectedAllergy = this.operationDiagnosis.filter(x =>
  //         (x.diagnosistext.toLowerCase().replace(/ /g, '') == diag.term.toLowerCase().replace(/ /g, '')));
  // }
  // else {
  //     selectedAllergy = this.operationDiagnosis.filter(x => x.diagnosiscode == diag.code);
  // }

  // if (addedProcs.length == 0) {
  //     let diagnosis: CoreDiagnosis = new CoreDiagnosis();
  //     diagnosis.diagnosis_id = diag.code + '|' + this.operationId,
  //         diagnosis.operation_id = this.operationId,
  //         diagnosis.statuscode = 'Active',
  //         diagnosis.statustext = 'Active',
  //         diagnosis.diagnosiscode = diag.code,
  //         diagnosis.diagnosistext = diag.term

    //     this.operationDiagnosis.push(diagnosis);
    // }
}


unSelectReactionValue(event) {
    // this.confirmationService.confirm({
    //     message: 'Are you sure that you want to delete this diagnosis?',
    //     accept: () => {
    //         for (var i = 0; i < this.operationDiagnosis.length; i++) {
    //             if (this.operationDiagnosis[i].diagnosistext === event.term) {
    //                 this.operationDiagnosis.splice(i, 1);
    //                 i--;
    //             }
    //         }
    //     },
    //     reject: () => {
    //         this.ac.selectItem(event);
    //     }
    // });
}
//


async viewDescription(option: string) {
      var response = false;
      console.log(option);
      await this.allergyLookupDescriptionsService.confirm(option, 'Allergy Descriptions')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
}

async viewHistory() {
  var response = false;
  await this.allergyHistoryViewerService.confirm(this.allergyIntolerance.allergyintolerance_id, 'General History','','Import')
  .then((confirmed) => response = confirmed)
  .catch(() => response = false);
  if(!response) {
    return;
  }
  else {
   // await this.getSelectedFormWithContext();
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

  this.appService.viewToShow = 'medicationHistory';
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
