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
import { PreOpTask } from '../models/entities/poa-task';
import { PreOpTaskStatus } from '../models/entities/poa-tast-status';
import { SNOMED } from '../models/snomed-model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { ConfigService } from '../services/config.service';
import { SubjectsService } from '../services/subjects.service';
import { ToasterService } from '../services/toaster-service.service';

@Component({
  selector: 'app-task-history-viewer',
  templateUrl: './task-history-viewer.component.html',
  styleUrls: ['./task-history-viewer.component.css']
})
export class TaskHistoryViewerComponent implements OnInit {


  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() taskId: string;

  getPOAHistoryURI: string;


  historyView: string;

  getHistoryListURI: string;
  historyList: PreOpTask[];
  selectedTask: PreOpTask;

  taskStatusList: PreOpTaskStatus[];
  getTaskStatusListUri: string = "/GetList?synapsenamespace=local&synapseentityname=poa_taskstatus&orderby=statusorder ASC";


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

  ngOnInit() {
    this.getTaskStatusList();
    this.historyView = 'list';
    this.bearerAuthToken = 'bearer '+ this.appService.apiService.authService.user.access_token;
    this.getHistoryListURI = this.appService.baseURI + '/GetObjectHistory?synapsenamespace=local&synapseentityname=poa_task&id=' + this.taskId;
    this.GetHistory();

  }

  async getTaskStatusList() {
    await this.apiRequest.getRequest(this.appService.baseURI + this.getTaskStatusListUri)
    .subscribe((data) => {
      this.taskStatusList = JSON.parse(data);
    })

   }

  async GetHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getHistoryListURI)
       .subscribe((response) => {
        var resp = JSON.parse(response);
         this.historyList = resp.reverse();
         this.spinner.hide("form-history-spinner");
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
    this.selectedTask = obj;
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




}
