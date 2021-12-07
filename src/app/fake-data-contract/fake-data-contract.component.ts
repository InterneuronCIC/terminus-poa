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
import { Component, EventEmitter, Input, OnInit, Output, isDevMode, OnDestroy } from '@angular/core';
import { FormControl, SelectMultipleControlValueAccessor } from '@angular/forms';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ApirequestService } from '../services/apirequest.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import { action, DataContract } from '../models/filter.model';
import { KeyValuePair } from '../models/keyvaluepair';
import { environment } from 'src/environments/environment';
import { Person } from '../models/entities/core-person.model';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from "ngx-spinner";
import { ConfigService } from '../services/config.service';
import { isArray } from 'util';

@Component({
  selector: 'app-fake-data-contract',
  templateUrl: './fake-data-contract.component.html',
  styleUrls: ['./fake-data-contract.component.css']
})
export class FakeDataContractComponent implements OnInit, OnDestroy {


  appContexts: string;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  showManualContext: boolean = false;
  
  personId: string;
  encounterId: string;
  persons: Person[];

  subscriptions: Subscription = new Subscription();

  constructor(private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService, private modalService: BsModalService, private httpClient: HttpClient , private spinner: NgxSpinnerService, private configService: ConfigService) {



  }



   async ngOnInit() {
    //Only init if not Prod
    if (isDevMode) {
      
        let value: any = {};
        value.authService = {};
        value.authService.user = {};
        let auth = this.apiRequest.authService;
    
        await auth.getToken().then((token) => {
          value.authService.user.access_token = token;
          
          let decodedToken: any;
          decodedToken = this.appService.decodeAccessToken(token);



          this.subscriptions.add(this.apiRequest.getRequest("./assets/config/terminus-poa-config.json?V" + Math.random()).subscribe(
            async (response) => {
              this.appService.appConfig = response;
              this.appService.baseURI = this.appService.appConfig.uris.baseuri;
              //console.log(this.appService.appConfig.uris.baseuri);
              this.appService.enableLogging = this.appService.appConfig.enablelogging;
       
           
             
              this.dtOptions = {
                pagingType: 'simple',
                pageLength: 25,
                dom: "-f -t -p"
              };
        
              this.personId = this.appService.personId;
              this.encounterId = this.appService.encounterId;
              
              this.spinner.show("spinner2");
          
              this.subscriptions.add(

              this.apiRequest.getRequest(this.appService.baseURI + '/GetList?synapsenamespace=core&synapseentityname=person&orderby=fullname ASC&limit=600')
                .subscribe((response) => {
                  var data = JSON.parse(response); 
                  //console.log(data);
                  this.persons = data;
                  this.dtTrigger.next();
                  this.spinner.hide("spinner2");    
                })

              );


              
       
            }));



              
            
            
              
       
              
          
        }); 
    
    }

  }



  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
    this.subscriptions.unsubscribe();
  }


  selectPerson(personId: string) {
    this.personId = personId;

    this.appContexts =  '{"encounter_id": "19bed96b-d4e6-4f63-b7d6-e92ce0a8b1a7", "person_id":"' + this.personId + '"}';

    this.updateContextObject();    
  }


  

  updateContextObject() {
    
    this.appService.contexts = JSON.parse(this.appContexts);


    this.appService.personId = this.personId;
    //this.appService.encounterId = this.encounterId;
    this.subjects.apiServiceReferenceChange.next();
    this.subjects.personIdChange.next();
  }


  toggleContextView() {
    this.showManualContext = !this.showManualContext;
  }



}
