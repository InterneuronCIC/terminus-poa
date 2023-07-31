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
// import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormioForm, FormioOptions } from 'angular-formio';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { LinkedEncounter } from '../models/baseviews/linked-encounter';
import { FormBuilderForm } from '../models/entities/form-builder-form';
import { FormResponse } from '../models/entities/form-response';
import { PreOpAssessment } from '../models/entities/poa-preopassessment';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { ConfigService } from '../services/config.service';
import { SubjectsService } from '../services/subjects.service';
import { ToasterService } from '../services/toaster-service.service';


@Component({
  selector: 'app-general-history-viewer',
  templateUrl: './general-history-viewer.component.html',
  styleUrls: ['./general-history-viewer.component.css']
})
export class GeneralHistoryViewerComponent implements OnInit {


  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() poaId: string;

  getPOAHistoryURI: string;

  bsConfig: any;

  historyList: PreOpAssessment[];
  historyForm: PreOpAssessment;

  historyView: string;


  selectedPOA: PreOpAssessment;

  getLinkedEncounterListURI: string;
  linkedEncounterList: LinkedEncounter[];

  getLinkedEncounterURI: string;
  linkedEncounter: LinkedEncounter;

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

  constructor(private activeModal: NgbActiveModal, private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService, private modalService: BsModalService, private httpClient: HttpClient , private spinner: NgxSpinnerService, private configService: ConfigService, private toasterService: ToasterService, private confirmationDialogService: ConfirmationDialogService) { }

  ngOnInit() {
    this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };
    this.historyView = 'list';
    this.bearerAuthToken = 'bearer '+ this.appService.apiService.authService.user.access_token;
    this.getPOAHistoryURI = this.appService.baseURI + '/GetObjectHistory?synapsenamespace=local&synapseentityname=poa_preopassessment&id=' + this.poaId;
    this.GetFormHistory();
  }

  async GetFormHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getPOAHistoryURI)
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

    this.selectedPOA = obj;
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
    this.GetLinkedEncounters();
    this.GetLinkedEncounter();
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
    this.historyForm = null;
    this.submission = null;
    this.historyView = 'list';
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


}
