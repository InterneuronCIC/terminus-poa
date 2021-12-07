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
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { escapeRegExp } from '@angular/compiler/src/util';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormioForm, FormioOptions } from 'angular-formio';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { AllergyLookupDescriptionsService } from '../allergy-lookup-descriptions/allergy-lookup-descriptions.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { LinkedEncounter } from '../models/baseviews/linked-encounter';
import { AllergyCategory } from '../models/entities/allergy-category';
import { AllergyClinicalStatus } from '../models/entities/allergy-clinical-status';
import { AllergyCriticality } from '../models/entities/allergy-criticality';
import { AllergyIntolerance } from '../models/entities/allergy-intolerance';
import { AllergyReportedByGroup } from '../models/entities/allergy-reported-by-group';
import { AllergyVerificationStatus } from '../models/entities/allergy-verification-status';
import { FormBuilderForm } from '../models/entities/form-builder-form';
import { FormResponse } from '../models/entities/form-response';
import { PreOpAssessment } from '../models/entities/poa-preopassessment';
import { SNOMED } from '../models/snomed-model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { ConfigService } from '../services/config.service';
import { SubjectsService } from '../services/subjects.service';
import { ToasterService } from '../services/toaster-service.service';

@Component({
  selector: 'app-allergy-history-viewer',
  templateUrl: './allergy-history-viewer.component.html',
  styleUrls: ['./allergy-history-viewer.component.css']
})
export class AllergyHistoryViewerComponent implements OnInit {



  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() allergyId: string;

  getPOAHistoryURI: string;


  historyView: string;

  getAllergyHistoryListURI: string;
  allergyHistoryList: AllergyIntolerance[];

  allergyIntolerance: AllergyIntolerance;

  allergyIntoleranceList: AllergyIntolerance[];
  categoryList: AllergyCategory[];
  clinicalStatusList: AllergyClinicalStatus[];
  criticalityList: AllergyCriticality[];
  verificationStatusList: AllergyVerificationStatus[];
  reportedByGroupList: AllergyReportedByGroup[];

  getCategoryListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycategory&orderby=displayorder ASC";
  getClinicalStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyclinicalstatus&orderby=displayorder ASC";
  getCriticalityListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycriticality&orderby=displayorder ASC";
  getVerificationStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyverificationstatus&orderby=displayorder ASC";
  getReportedByGroupListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyreportedbygroup&orderby=displayorder ASC";

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

  submission: any;

    //API Variables
    globalURL: string = this.appService.baseURI;
    careRecordURL: string = this.appService.carerecordURI;
    terminologyURL: string = this.appService.terminologyURI;
    autonomicURL: string = this.appService.autonomicURI;
    imageServerURL: string = this.appService.imageserverURI;
    bearerAuthToken: string;

  subscriptions: Subscription = new Subscription();

  constructor(private activeModal: NgbActiveModal, private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService, private modalService: BsModalService, private httpClient: HttpClient , private spinner: NgxSpinnerService, private configService: ConfigService, private toasterService: ToasterService, private confirmationDialogService: ConfirmationDialogService, private allergyLookupDescriptionsService: AllergyLookupDescriptionsService) { }

  bsConfig: any;

  ngOnInit() {

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'allergyreportedbygroup_id',
      textField: 'groupname',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 10,
      allowSearchFilter: true
    };

    this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };
    this.historyView = 'list';
    this.bearerAuthToken = 'bearer '+ this.appService.apiService.authService.user.access_token;
    this.getAllergyHistoryListURI = this.appService.baseURI + '/GetObjectHistory?synapsenamespace=core&synapseentityname=allergyintolerance&id=' + this.allergyId;
    this.GetAllergyHistory();

    this.getCategoryList();
    this.getClinicalStatusList();
    this.getCriticalityList();
    this.getVerificationStatusList();
    this.getReportedByList();

  }

  async GetAllergyHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getAllergyHistoryListURI)
       .subscribe((response) => {
        var resp = JSON.parse(response);
         this.allergyHistoryList = resp.reverse();
         this.spinner.hide("form-history-spinner");
       })
     )
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


  public decline() {
    this.activeModal.close(false);
  }

  public accept() {
    this.activeModal.close(true);
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

   viewHistoryForm(obj: any) {

    this.allergyIntolerance = obj;

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

  try {
    this.allergyIntolerance.reportedbygroup = JSON.parse(this.allergyIntolerance.reportedbygroup);
  }
  catch(ex) {
    this.allergyIntolerance.reportedbygroup = JSON.parse('[]');
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


    this.historyView = 'form';
  }

  dataObjectString: any;
  initialdataObjectString: string;
  dataObject: any;



  onRender() {
    //console.log('onRender');
  }

  onChange(value: any) {
    //console.log('onChange');
    //console.log(value);
  }

  backToList() {
    //this.historyForm = null;
    this.submission = null;
    this.historyView = 'list';
  }

  replaceAll(str, find, replace) {
    if(!str) {
      return null;
    }
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  }


  async viewDescription(option: string) {
    var response = false;
    console.log(option);
    await this.allergyLookupDescriptionsService.confirm(option, 'Allergy Descriptions')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
}


}
