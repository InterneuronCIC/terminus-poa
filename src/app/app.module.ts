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
import { BrowserModule } from '@angular/platform-browser';
import { DoBootstrap, Injector, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';

import { createCustomElement } from '@angular/elements';
import { ViewerComponent } from './viewer/viewer.component';

import { ModalModule, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { HttpClientModule } from '@angular/common/http';
import { FakeDataContractComponent } from './fake-data-contract/fake-data-contract.component';

import { DataTablesModule } from 'angular-datatables';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from "ngx-spinner";
// import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { PersonIdentifiersComponent } from './person-identifiers/person-identifiers.component';
import { ToastrModule } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { FormioAppConfig, FormioModule } from 'angular-formio';
import { DynamicFormRendererComponent } from './dynamic-form-renderer/dynamic-form-renderer.component';
import { IdentifierTransformPipe } from './pipes/identifier-transform'
import { LinebreaksPipe } from './pipes/line-breaks'
import { AppConfig } from './formio.config';
import { HomeComponent } from './home/home.component';
import { AllergiesComponent } from './allergies/allergies.component';
import { PastMedicalHistoryComponent } from './past-medical-history/past-medical-history.component';
import { MedicineHistoryComponent } from './medicine-history/medicine-history.component';
import { ModuleLoaderDirective } from './directives/module-loader.directive';
import { SurgicalHistoryComponent } from './surgical-history/surgical-history.component';
import { PhysicalExaminationComponent } from './physical-examination/physical-examination.component';
import { FamilyHistoryComponent } from './family-history/family-history.component';
import { SocialHistoryComponent } from './social-history/social-history.component';
import { InfectionControlComponent } from './infection-control/infection-control.component';
import { InformationProvidedComponent } from './information-provided/information-provided.component';
import { NursingAssessmentComponent } from './nursing-assessment/nursing-assessment.component';
import { BaselineObservationsComponent } from './baseline-observations/baseline-observations.component';
import { CurrentMedicationsComponent } from './current-medications/current-medications.component';
import { NotesComponent } from './notes/notes.component';
import { TasksComponent } from './tasks/tasks.component';
import { QuillModule } from 'ngx-quill'
import { AssessmentsComponent } from './assessments/assessments.component';
import { AssessmentAKIComponent } from './assessment-aki/assessment-aki.component';
import { AssessmentSORTComponent } from './assessment-sort/assessment-sort.component';
import { AssessmentFrailtyComponent } from './assessment-frailty/assessment-frailty.component';
import { AssessmentCognitiveComponent } from './assessment-cognitive/assessment-cognitive.component';
import { AssessmentAdultMalnutritionComponent } from './assessment-adult-malnutrition/assessment-adult-malnutrition.component';
import { GeneralComponent } from './general/general.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarComponent } from './calendar/calendar.component';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { enableProdMode } from '@angular/core';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from './confirmation-dialog/confirmation-dialog.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormioHistoryViewerComponent } from './formio-history-viewer/formio-history-viewer.component';
import { FormioHistoryService } from './formio-history-viewer/formio-history-viewer.service';
import { FormioImportComponent } from './formio-import/formio-import.component';
import { FormioImportService } from './formio-import/formio-import.service';
import { GeneralHistoryViewerComponent } from './general-history-viewer/general-history-viewer.component';
import { GeneralHistoryViewerService } from './general-history-viewer/general-history-viewer.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AllergyLookupDescriptionsComponent } from './allergy-lookup-descriptions/allergy-lookup-descriptions.component';
import { AllergyLookupDescriptionsService } from './allergy-lookup-descriptions/allergy-lookup-descriptions.service';
import { AllergyHistoryViewerComponent } from './allergy-history-viewer/allergy-history-viewer.component';
import { AllergyHistoryViewerService } from './allergy-history-viewer/allergy-history-viewer.service';
import { TaskHistoryViewerComponent } from './task-history-viewer/task-history-viewer.component';
import { TaskHistoryViewerService } from './task-history-viewer/task-history-viewer.service';
import { PrintViewComponent } from './print-view/print-view.component';
//import { AutoCompleteValidationDirective } from "./utilities/auto-complete-validation";

@NgModule({
    declarations: [
        AppComponent,
        ViewerComponent,
        FakeDataContractComponent,
        PersonIdentifiersComponent,
        DynamicFormRendererComponent,
        IdentifierTransformPipe,
        HomeComponent,
        AllergiesComponent,
        PastMedicalHistoryComponent,
        MedicineHistoryComponent,
        ModuleLoaderDirective,
        SurgicalHistoryComponent,
        PhysicalExaminationComponent,
        FamilyHistoryComponent,
        SocialHistoryComponent,
        InfectionControlComponent,
        InformationProvidedComponent,
        NursingAssessmentComponent,
        BaselineObservationsComponent,
        CurrentMedicationsComponent,
        NotesComponent,
        TasksComponent,
        AssessmentsComponent,
        AssessmentAKIComponent,
        AssessmentSORTComponent,
        AssessmentFrailtyComponent,
        AssessmentCognitiveComponent,
        AssessmentAdultMalnutritionComponent,
        GeneralComponent,
        CalendarComponent,
        LinebreaksPipe,
        ConfirmationDialogComponent,
        FormioHistoryViewerComponent,
        FormioImportComponent,
        GeneralHistoryViewerComponent,
        AllergyLookupDescriptionsComponent,
        AllergyHistoryViewerComponent,
        TaskHistoryViewerComponent,
        PrintViewComponent
        // ,
        // ConfirmationDialogService
    ],
    imports: [
        QuillModule.forRoot(),
        FormioModule,
        ToastrModule.forRoot({
            timeOut: 10000,
            positionClass: 'toast-bottom-right',
            preventDuplicates: true,
        }),
        // AngularFontAwesomeModule,
        BrowserAnimationsModule,
        NgxSpinnerModule,
        DataTablesModule,
        BrowserModule,
        ModalModule.forRoot(),
        HttpClientModule,
        FormsModule,
        NgbModule,
        BsDatepickerModule.forRoot(),
        PopoverModule.forRoot(),
        AutoCompleteModule,
        NgMultiSelectDropDownModule.forRoot()
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [BsModalRef, BsModalService, { provide: FormioAppConfig, useValue: AppConfig }, BsDatepickerConfig, ConfirmationDialogService, FormioHistoryService, FormioImportService, GeneralHistoryViewerService, AllergyLookupDescriptionsService, AllergyHistoryViewerService, TaskHistoryViewerService],
    //bootstrap: [AppComponent],  //Comment out when running build command for packaging
    bootstrap: [],
    entryComponents: [
      AppComponent,
      ConfirmationDialogComponent,
      FormioHistoryViewerComponent,
      FormioImportComponent,
      GeneralHistoryViewerComponent,
      AllergyLookupDescriptionsComponent,
      AllergyHistoryViewerComponent,
      TaskHistoryViewerComponent
    ]
  })
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {

  }

  ngDoBootstrap() {
    const el = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('app-terminus-poa', el); //Must Be unique - Gets passed to Sudio
  }

}
