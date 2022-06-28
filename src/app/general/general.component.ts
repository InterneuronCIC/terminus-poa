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
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Inject, Injectable, Input, LOCALE_ID, OnDestroy, OnInit, Output } from '@angular/core';
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
import { NgbCalendar, NgbDateAdapter, NgbDateParserFormatter, NgbDatepicker, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStructAdapter } from '@ng-bootstrap/ng-bootstrap/datepicker/adapters/ngb-date-adapter';
import * as moment from 'moment';
import { months } from 'moment';
import { formatDate } from '@angular/common';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { GeneralHistoryViewerService } from '../general-history-viewer/general-history-viewer.service';
import { TaskAutomationService } from '../services/taskautomation.service'
// import { ThrowStmt } from '@angular/compiler';
import { LinkedEncounter } from '../models/baseviews/linked-encounter';
import { ScheduledOperation } from '../models/baseviews/scheduled-operation';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css']
})
export class GeneralComponent {

  subscriptions: Subscription = new Subscription();
  poaId: string;
  personId: string;

  //Date Picker Models
  model: any;
  bsConfig: any;

  maxDateValue: Date = new Date();


  private _preOpAssessment: PreOpAssessment;

  getLinkedEncounterListURI: string;
  linkedEncounterList: LinkedEncounter[];

  getLinkedEncounterURI: string;
  linkedEncounter: LinkedEncounter;

  getScheduledOperationsForPersonURI: string;
  scheduledOperationsForPerson: ScheduledOperation[];
  getScheduledOperationsForEncounterURI: string;
  scheduledOperationsForEncounter: ScheduledOperation[];


  @Input() set preOpAssessment(value: PreOpAssessment) {

    this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };

    this.personId = value.person_id;
    this.poaId = value.poa_preopassessment_id;

    this.getPOAURI = this.appService.baseURI +  "/GetObject?synapsenamespace=local&synapseentityname=poa_preopassessment&id=" + this.poaId;
    this.postPOAURI = this.appService.baseURI + "/PostObject?synapsenamespace=local&synapseentityname=poa_preopassessment";

    this.getLinkedEncounterListURI = this.appService.baseURI + "/GetBaseViewListByAttribute/poa_linkedencounters?synapseattributename=person_id&attributevalue=" + this.personId;




    this.GetLinkedEncounters();

    this.gotoTop();

  };

  get preOpAssessment(): PreOpAssessment { return this._preOpAssessment; }

  async GetLinkedEncounters() {
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getLinkedEncounterListURI)
      .subscribe((response) => {
        this.linkedEncounterList = JSON.parse(response);
        this.GetLivePOA();
      })
    )
  }


  async GetScheduledOperationsForPerson() {
      this.getScheduledOperationsForPersonURI = this.appService.baseURI + "/GetBaseViewListByAttribute/poa_scheduledoperations?synapseattributename=person_id&attributevalue=" + this.selectedPOA.person_id;
      await this.subscriptions.add(
        this.apiRequest.getRequest(this.getScheduledOperationsForPersonURI)
        .subscribe((response) => {
          this.scheduledOperationsForPerson = JSON.parse(response);
        })
      )
  }

  async GetScheduledOperationsForEncounter() {
    this.getScheduledOperationsForEncounterURI = this.appService.baseURI + "/GetBaseViewListByAttribute/poa_scheduledoperations?synapseattributename=encounter_id&attributevalue=" + this.selectedPOA.linkedencounterid;
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getScheduledOperationsForEncounterURI)
      .subscribe((response) => {
        this.scheduledOperationsForEncounter = JSON.parse(response);
      })
    )
}

  async GetLinkedEncounter(postUpdateToServer: boolean) {

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
        var promptUser = false;
        var updateMeta = false;
        if(this.selectedPOA.surgeon != this.linkedEncounter.consultingdoctortext) {
          updateMeta = true;
          if(this.selectedPOA.surgeon) {
            promptUser = true;
          }
        }
        if(!this.selectedPOA.admissiondate && this.linkedEncounter.patientclasstext === 'TCI') {
          if(this.selectedPOA.admissiondate != this.linkedEncounter.intendedadmissiondate) {
            updateMeta = true;
            if(this.selectedPOA.admissiondate) {
              promptUser = true;
            }
          }
        }
        if(!this.selectedPOA.admissiondate && this.linkedEncounter.patientclasstext != 'TCI') {
          if(this.selectedPOA.admissiondate != this.linkedEncounter.admitdatetime) {
            updateMeta = true;
            if(this.selectedPOA.admissiondate) {
              promptUser = true;
            }
          }

          if(this.selectedPOA.dischargedate != this.linkedEncounter.dischargedatetime) {
            updateMeta = true;
            if(this.selectedPOA.dischargedate) {
              promptUser = true;
            }
          }

        }


        if(updateMeta) {
          if(promptUser) {

            var displayConfirmation = this.appService.displayWarnings;
            if(displayConfirmation) {
              var response = false;
              this.confirmationDialogService.confirm('Information', 'Linked encounter details have been updated on PAS - Consultant, Admission Date and Dischage Date will be updated')
              .then((confirmed) => response = confirmed)
              .catch(() => response = false);
              // if(!response) {
              //   return;
              // }
            }
          }
        }

        // console.log("lockedonadmission:" + this.selectedPOA.lockedonadmission);
        // console.log("islocked:" + this.selectedPOA.islocked);


        this.selectedPOA.surgeon = this.linkedEncounter.consultingdoctortext;

        if(this.linkedEncounter.patientclasstext === 'TCI') {
            this.selectedPOA.admissiondate = new Date (this.linkedEncounter.intendedadmissiondate as Date);
            this.selectedPOA.lockedonadmission = false;
            this.selectedPOA.islocked = false;
        }

        if(this.linkedEncounter.patientclasstext != 'TCI') {
          this.selectedPOA.admissiondate = new Date (this.linkedEncounter.admitdatetime as Date);
          if(this.linkedEncounter.dischargedatetime) {
            this.selectedPOA.dischargedate = new Date (this.linkedEncounter.dischargedatetime as Date);
          }

          if(!this.selectedPOA.lockedonadmission) {
            this.selectedPOA.lockedonadmission = true;
            this.selectedPOA.islocked = true;
          }



        }

        if(postUpdateToServer) {
          this.postAssessment();
        }

      })

    )



  }

  @Output() viewClosed = new EventEmitter<boolean>();

  save() {
    this.viewClosed.emit(true);
  }


  lockPOA(opt: boolean) {
    this.selectedPOA.islocked = opt;
  }

  constructor(private apiRequest: ApirequestService, public appService: AppService, private subjects: SubjectsService, private spinner: NgxSpinnerService, private toasterService: ToasterService, private modalService: BsModalService, @Inject(LOCALE_ID) private locale: string, private confirmationDialogService: ConfirmationDialogService, private generalHistoryViewerService: GeneralHistoryViewerService, private taskAutomationService: TaskAutomationService) {

  }

  getPOAURI: string;
  postPOAURI: string;
  selectedPOA: PreOpAssessment;
  currentPOA: PreOpAssessment;
  async GetLivePOA() {
     await this.subscriptions.add(
      this.apiRequest.getRequest(this.getPOAURI)
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

      this.GetLinkedEncounter(true);

      this.GetScheduledOperationsForPerson();
      //this.GetScheduledOperationsForEncounter();

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
        this.selectedPOA.iscompletedgeneral = completed;
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


   async postAssessment() {
    //Get the latest version in case someone has changed something in another section at the same time
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getPOAURI)
      .subscribe((response) => {
        this.currentPOA = JSON.parse(response);
        //Update the observables with the latest statuses

        this.selectedPOA.iscompletedallergies = this.currentPOA.iscompletedallergies;
        this.selectedPOA.iscompletedassessments = this.currentPOA.iscompletedassessments;
        this.selectedPOA.iscompletedbaselineobservations = this.currentPOA.iscompletedbaselineobservations;
        this.selectedPOA.iscompletedfamilyhistory = this.currentPOA.iscompletedfamilyhistory;
        this.selectedPOA.iscompletedinfectioncontrol = this.currentPOA.iscompletedinfectioncontrol;
        this.selectedPOA.iscompletedinformationprovided = this.currentPOA.iscompletedinformationprovided;
        this.selectedPOA.iscompletedmedicationhistory = this.currentPOA.iscompletedmedicationhistory;
        this.selectedPOA.iscompletednursingassessment = this.currentPOA.iscompletednursingassessment;
        this.selectedPOA.iscompletedpastmedicalhistory = this.currentPOA.iscompletedpastmedicalhistory;
        this.selectedPOA.iscompletedphysicalexamination = this.currentPOA.iscompletedphysicalexamination;
        this.selectedPOA.iscompletedsocialhistory = this.currentPOA.iscompletedsocialhistory;
        this.selectedPOA.iscompletedsurgicalhistory = this.currentPOA.iscompletedsurgicalhistory;

        //Convert any dates
        this.selectedPOA.poadate = this.selectedPOA.poadate as Date;
        this.selectedPOA.admissiondate = this.selectedPOA.admissiondate as Date;
        this.selectedPOA.dischargedate = this.selectedPOA.dischargedate as Date;
        this.selectedPOA.revalidateddate = this.selectedPOA.revalidateddate as Date;


        //update the entity record
        this.subscriptions.add(
          this.apiRequest.postRequest(this.postPOAURI, this.selectedPOA)
            .subscribe((response) => {

              this.appService.locked = this.selectedPOA.islocked;
              if(this.appService.blocked || this.appService.locked) {
                this.appService.lockedOrBlocked = true;
              }
              else
              {
                this.appService.lockedOrBlocked = false;
              }

            })
          )

      })
    )
    }


async saveAssessment() {
//Get the latest version in case someone has changed something in another section at the same time
await this.subscriptions.add(
  this.apiRequest.getRequest(this.getPOAURI)
  .subscribe((response) => {
    this.currentPOA = JSON.parse(response);
    //Update the observables with the latest statuses

    this.selectedPOA.iscompletedallergies = this.currentPOA.iscompletedallergies;
    this.selectedPOA.iscompletedassessments = this.currentPOA.iscompletedassessments;
    this.selectedPOA.iscompletedbaselineobservations = this.currentPOA.iscompletedbaselineobservations;
    this.selectedPOA.iscompletedfamilyhistory = this.currentPOA.iscompletedfamilyhistory;
    this.selectedPOA.iscompletedinfectioncontrol = this.currentPOA.iscompletedinfectioncontrol;
    this.selectedPOA.iscompletedinformationprovided = this.currentPOA.iscompletedinformationprovided;
    this.selectedPOA.iscompletedmedicationhistory = this.currentPOA.iscompletedmedicationhistory;
    this.selectedPOA.iscompletednursingassessment = this.currentPOA.iscompletednursingassessment;
    this.selectedPOA.iscompletedpastmedicalhistory = this.currentPOA.iscompletedpastmedicalhistory;
    this.selectedPOA.iscompletedphysicalexamination = this.currentPOA.iscompletedphysicalexamination;
    this.selectedPOA.iscompletedsocialhistory = this.currentPOA.iscompletedsocialhistory;
    this.selectedPOA.iscompletedsurgicalhistory = this.currentPOA.iscompletedsurgicalhistory;

    //Convert any dates
    this.selectedPOA.poadate = this.selectedPOA.poadate as Date;
    this.selectedPOA.admissiondate = this.selectedPOA.admissiondate as Date;
    this.selectedPOA.dischargedate = this.selectedPOA.dischargedate as Date;
    this.selectedPOA.revalidateddate = this.selectedPOA.revalidateddate as Date;


    //update the entity record
    this.subscriptions.add(
      this.apiRequest.postRequest(this.postPOAURI, this.selectedPOA)
        .subscribe((response) => {
          this.toasterService.showToaster("Success","General Section Saved");
          // if(this.selectedPOA.hdurequired) {
          //   this.taskAutomationService.checkTask(this.selectedPOA.poa_preopassessment_id, this.selectedPOA.person_id, "taskreferanaesthetist", "POA Nurse", "Please refer to anaesthetist", "Patient requires HDU Post-Operatively, please refer to anaesthetist");
          // }

          this.appService.locked = this.selectedPOA.islocked;
          if(this.appService.blocked || this.appService.locked) {
            this.appService.lockedOrBlocked = true;
          }
          else
          {
            this.appService.lockedOrBlocked = false;
          }

          if(this.appService.autoproceedtonextsection) {
            this.appService.viewToShow = 'medicalHistory';
            this.viewClosed.emit(true);
          }

        })
      )

  })
)
}

// async viewHistory() {
//   var response = false;
//   await this.formioHistoryService.confirm(this.formContextKey, 'Past Medical History')
//   .then((confirmed) => response = confirmed)
//   .catch(() => response = false);
//   if(!response) {
//     return;
//   }
// }

async viewHistory() {
  var response = false;
  await this.generalHistoryViewerService.confirm(this.poaId, this.personId, 'General History','','Import')
  .then((confirmed) => response = confirmed)
  .catch(() => response = false);
  if(!response) {
    return;
  }
  else {
   // await this.getSelectedFormWithContext();
  }
}

selectOperation(opt: any, e:any) {
  e.preventDefault();
  this.selectedPOA.operation = opt.operationname;

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

  this.appService.viewToShow = 'home';
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

  this.appService.viewToShow = 'medicalHistory';
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
