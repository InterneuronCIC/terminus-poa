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
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, Subscription } from 'rxjs';
import { PreOpAssessment } from '../models/entities/poa-preopassessment';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ToasterService } from '../services/toaster-service.service';
import { ComponentModuleData } from '../directives/module-loader.directive';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-current-medications',
  templateUrl: './current-medications.component.html',
  styleUrls: ['./current-medications.component.css']
})
export class CurrentMedicationsComponent implements OnDestroy, AfterViewInit {

  subscriptions: Subscription = new Subscription();
  poaId: string;
  personId: string;
  showCurrentMedsModule = false;
  componentModuleData: ComponentModuleData;
  scriploaded = false;
  private _preOpAssessment: PreOpAssessment;
  @Input() set preOpAssessment(value: PreOpAssessment) {
    this.personId = value.person_id;
    this.poaId = value.poa_preopassessment_id;
    this.getPOAURI = this.appService.baseURI +  "/GetObject?synapsenamespace=local&synapseentityname=poa_preopassessment&id=" + this.poaId;
    this.postPOAURI = this.appService.baseURI + "/PostObject?synapsenamespace=local&synapseentityname=poa_preopassessment";
    this.GetLivePOA();
  };
  get preOpAssessment(): PreOpAssessment { return this._preOpAssessment; }

  @Output() currentMedsViewClosed = new EventEmitter<boolean>();

  save() {
    this.currentMedsViewClosed.emit(true);
  }

  cancel() {
      this.currentMedsViewClosed.emit(true);
  }

  getPOAURI: string;
  postPOAURI: string;
  selectedPOA: PreOpAssessment;
  async GetLivePOA() {
     this.subscriptions.add(
      this.apiRequest.getRequest(this.getPOAURI)
      .subscribe((response) => {
        this.selectedPOA = JSON.parse(response);
        this.selectedPOA.reviewedbypharmacistdate = this.adjustForTimezone(this.selectedPOA.reviewedbypharmacistdate);
      })
    )
   }

   adjustForTimezone(date:Date):Date{
    date = new Date (date as Date)
   var timeOffsetInMS:number = date.getTimezoneOffset() * 60000;
   date.setTime(date.getTime() - timeOffsetInMS);
   return date
 }

   async markSectionCompleted(completed) {
     //Get the latest version in case someone has changed something in another section at the same time
    this.subscriptions.add(
      this.apiRequest.getRequest(this.getPOAURI)
      .subscribe((response) => {
        this.selectedPOA = JSON.parse(response);
        //Ubdate the observable
        this.selectedPOA.iscompletedmedicationhistory = completed;
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



   async markReviewed(completed) {
    //Get the latest version in case someone has changed something in another section at the same time
   this.subscriptions.add(
     this.apiRequest.getRequest(this.getPOAURI)
     .subscribe((response) => {
       this.selectedPOA = JSON.parse(response);
       //Ubdate the observable
       this.selectedPOA.reviewedbypharmacist = completed;
       if(completed) {
          this.selectedPOA.reviewedbypharmacistdate = new Date();
          this.selectedPOA.reviewedbypharmacistuser = this.appService.loggedInUserName;
       }
       else
       {
        this.selectedPOA.reviewedbypharmacistdate = null;
        this.selectedPOA.reviewedbypharmacistuser = null;
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

  constructor(private apiRequest: ApirequestService, public appService: AppService, private subjects: SubjectsService, public cd: ChangeDetectorRef, private confirmationDialogService: ConfirmationDialogService) {
    this.subjects.currentmedsunload.subscribe(() => {
      this.reloadOnUnload();
    })
  }
  ngAfterViewInit(): void {
    this.LoadCurrentMedsComponent();
  }
  ngOnDestroy(): void {
    console.log("destroying current medicaitons compoent")
    this.showCurrentMedsModule = false;
  }

  LoadCurrentMedsComponent() {
    console.log("in load component");
    this.showCurrentMedsModule = false;
    this.componentModuleData = new ComponentModuleData();
    this.componentModuleData.elementTag = "poa-currentmeds";
    this.componentModuleData.url = this.appService.currentMedicationModuleURI;
    this.componentModuleData.datacontract = {
      referralId: "",
      poaId: this.poaId,
      personId: this.personId,
      apiService: this.appService.apiService,
      unload: new Subject(),
      isReadOnly:false
    };

    this.showCurrentMedsModule = true;

    this.cd.detectChanges();

  }
  reloadOnUnload()
  {
    this.LoadCurrentMedsComponent();
  }

  onModuleUnLoad(e) {
    this.showCurrentMedsModule = false;
  }

  hideModuleLoadingMessage() {
    setTimeout(() => {
      this.scriploaded = true
    }, 2000);
  }

}
