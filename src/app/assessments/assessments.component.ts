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
import { ThrowStmt } from '@angular/compiler';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { PreOpAssessment } from '../models/entities/poa-preopassessment';
import { PreOpAssessmentSummary } from '../models/entities/poa-assessmentsummary';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ToasterService } from '../services/toaster-service.service';
import { KeyValuePair } from '../models/keyvaluepair';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.css']
})
export class AssessmentsComponent {

  subscriptions: Subscription = new Subscription();
  poaId: string;
  personId: string;

  selectedView: string;
  allergiesPOA: PreOpAssessment;

  kvp: KeyValuePair[];


  getAsssessmentSummaryURI: string;
  postAsssessmentSummaryURI: string;
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
       //console.log(this.kvp);
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


  private _preOpAssessment: PreOpAssessment;
  @Input() set preOpAssessment(value: PreOpAssessment) {
    this.personId = value.person_id;
    this.poaId = value.poa_preopassessment_id;

    this.getPOAURI = this.appService.baseURI +  "/GetObject?synapsenamespace=local&synapseentityname=poa_preopassessment&id=" + this.poaId;
    this.postPOAURI = this.appService.baseURI + "/PostObject?synapsenamespace=local&synapseentityname=poa_preopassessment";
    this.GetLivePOA();

    this.getAsssessmentSummaryURI = this.appService.baseURI + "/GetObject?synapsenamespace=local&synapseentityname=poa_assessmentsummary&id=" + this.poaId;
    this.postAsssessmentSummaryURI = this.appService.baseURI + "/PostObject?synapsenamespace=local&synapseentityname=poa_assessmentsummary";
    this.GetPOASummary();

    this.allergiesPOA = value;
    this.selectedView = "assessments";

    this.gotoTop();

  };
  get preOpAssessment(): PreOpAssessment { return this._preOpAssessment; }

  @Output() viewClosed = new EventEmitter<boolean>();

  save() {
    this.viewClosed.emit(true);
  }



  constructor(private apiRequest: ApirequestService, public appService: AppService, private subjects: SubjectsService, private spinner: NgxSpinnerService, private toasterService: ToasterService, private modalService: BsModalService, private confirmationDialogService: ConfirmationDialogService) {

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
        this.selectedPOA.iscompletedassessments = completed;
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

   gotoView(view: string) {
    this.selectedView = view;
  }

  @Output() allergiesPOAChange: EventEmitter<PreOpAssessment> = new EventEmitter<PreOpAssessment>();
  update() {
    this.appService.poaId = this.poaId;
    this.allergiesPOAChange.emit(this.allergiesPOA);
    console.log
  }

  onAssessmentsViewClosed(childViewClosed: boolean) {
    this.GetPOASummary();
    this.selectedView = "assessments";
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

  this.appService.viewToShow = 'socialHistory';
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

  this.appService.viewToShow = 'infectionControl';
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
