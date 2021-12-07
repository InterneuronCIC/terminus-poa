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
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormioForm, FormioOptions } from 'angular-formio';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { FormBuilderForm } from '../models/entities/form-builder-form';
import { FormResponse } from '../models/entities/form-response';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { ConfigService } from '../services/config.service';
import { SubjectsService } from '../services/subjects.service';
import { ToasterService } from '../services/toaster-service.service';

@Component({
  selector: 'app-formio-import',
  templateUrl: './formio-import.component.html',
  styleUrls: ['./formio-import.component.css']
})
export class FormioImportComponent implements OnInit {

  userAcknowledged: string;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() formContextKey: string;
  @Input() person_id: string;
  @Input() formResponse: FormResponse;

  getPOAHistoryURI: string;

  historyList: FormResponse[];
  historyForm: FormResponse;

  historyView: string;

  generatedForm: FormioForm;

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
    this.historyView = 'list';
    this.bearerAuthToken = 'bearer '+ this.appService.apiService.authService.user.access_token;
    this.getPOAHistoryURI = this.appService.baseURI + '/GetBaseViewListByAttribute/poa_formhistory?synapseattributename=formbuilderpersonid&attributevalue=' + this.person_id + '|' + this.formContextKey;
    this.GetFormHistory();
  }

  async GetFormHistory() {
    this.spinner.show("form-import-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getPOAHistoryURI)
       .subscribe((response) => {
        var resp = JSON.parse(response);
         this.historyList = resp.reverse();
         this.spinner.hide("form-import-spinner");
       })
     )
  }

  get filteredHistoryList(): FormResponse[] {

      if(!this.formResponse)
      {
        return [] as FormResponse[];
      }

      if(!this.formResponse.formbuilderresponse_id)
      {
        return [] as FormResponse[];
      }

      if(!this.historyList) {
        return [] as FormResponse[];
      }

      return this.historyList.filter((a) =>
        a.formbuilderresponse_id != this.formResponse.formbuilderresponse_id
      );

  }



  public decline() {
    this.activeModal.close(false);
  }

  public async accept() {

    //Import
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
    this.formResponse.formresponse = this.historyForm.formresponse;

    await this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=formbuilderresponse',this.formResponse)
      .subscribe((response) => {


        this.toasterService.showToaster("Success","Previous Form section imported");

        this.activeModal.close(true);

      })
    )


  }

  public dismiss() {
    this.activeModal.dismiss();
  }

   viewHistoryForm(obj: any) {
    this.historyView = 'form';
    this.historyForm = obj;

   //Make readonly
    var resp = [];
    for (const control of JSON.parse(this.historyForm.formcomponents)) {
      if (control.key == 'submit') {
        control.hidden = true;
      }
      else {
        control.disabled = true;
      }
      resp.push(control);
    }
    this.historyForm.formcomponents = JSON.stringify(resp);

    this.generatedForm = {components: JSON.parse(this.historyForm.formcomponents)};

    this.submission = this.buildDataObject();


  }

  dataObjectString: any;
  initialdataObjectString: string;
  dataObject: any;

  buildDataObject() {

    this.dataObject = JSON.parse('{"data":' + this.historyForm.formresponse + '}') ;
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


}
