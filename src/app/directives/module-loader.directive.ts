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
import { Directive, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { SubjectsService } from '../services/subjects.service';
import { v4 as uuidv4 } from 'uuid';
import { AppService, loadedcomponents } from '../services/app.service'

@Directive({
  selector: '[ModuleLoader]',
})
export class ModuleLoaderDirective {

  @Output() ModuleUnLoad?: EventEmitter<any> = new EventEmitter<any>();
  @Output() ScripLoadComplete?: EventEmitter<any> = new EventEmitter<any>();

  constructor(private elRef: ElementRef, private subjects: SubjectsService, private appService: AppService) {
  }

  @Input('ModuleLoader')
  set moduleDataSubject(moduleData: ComponentModuleData) {

    //console.log('Received Module Data');
    //console.log(moduleData);

    console.log(moduleData);
    if (moduleData) {
      this.elRef.nativeElement.innerHtml = '';
      this.loadComponent(moduleData);
    }
  }


  private loadComponent(moduleData: ComponentModuleData) {

    console.log("loading component");

    const scriptEle: HTMLScriptElement = document.getElementById(`assessment:WCScript_${moduleData.elementTag}`) as HTMLScriptElement;

    if (!scriptEle) {

      console.log('Creating Script element');

      this.createScriptElement(moduleData,
        (e) => {
          this.createCustomElement(moduleData);
          this.ScripLoadComplete.emit();
        }
      );
    } else {
      console.log('Script element alredy exists. Creating element.');
      this.createCustomElement(moduleData);
      this.ScripLoadComplete.emit();

    }
  }

  private createScriptElement = (moduleData: ComponentModuleData, onloadComplete: any) => {

    console.log('Script loading...' + moduleData.url);

    const scriptEle = document.createElement('script');

    scriptEle.id = `assessment:WCScript_${moduleData.elementTag}`;

    scriptEle.src = moduleData.url + "?V" + Math.random();

    scriptEle.async = true;

    scriptEle.onload = (e) => {

      console.log('Script load complete');
      this.subjects.showMessage.next({ result: "complete", message: " ", timeout: 10 });

      if (onloadComplete) {
        onloadComplete(e);
      }
    };
    scriptEle.onerror = (e) => {
      this.subjects.showMessage.next({ result: "failed", message: "<h5>Error loading module </h5>", timeout: 15000 });
      scriptEle.parentNode.removeChild(scriptEle);

      console.log(e);
    };
    document.body.appendChild(scriptEle);
  }

  private createCustomElement(moduleData: ComponentModuleData) {

    let uc = this.appService.lc.filter(x => x.unloaded == false).length;
    if (uc == 0) {
      console.log('inside createCustomElement');

      const customEle: HTMLElement = document.createElement(moduleData.elementTag);
      let uniqueid = uuidv4();
      moduleData.datacontract.uniqueid = uniqueid;
      customEle['datacontract'] = moduleData.datacontract;

      let el = this.elRef; //Local reference - closure wont work

      // customEle['unload'] = 
      // (data: any) => {
      //   this.ComponentUnloadHandler(data, el);
      // }

      moduleData.datacontract.unload.subscribe((e) => {
        let c = this.appService.lc.find(x => x.id == e);
        if (c)
          c.unloaded = true;
        this.subjects.currentmedsunload.next();
      });

      this.elRef.nativeElement.appendChild(customEle);
      let ulc = new loadedcomponents(uniqueid, false);
      this.appService.lc.push(ulc);
      //console.log('this.contextChangedEventInvoker=' + customEle);
      console.log(customEle);

      //console.log(customEle['currentPatientId']);
    }
  }

  private ComponentUnloadHandler(data: any, el: ElementRef<any>) {
    this.elRef.nativeElement.innerHtml = '';
    //console.log('Unloaded Sepsis Component');
    //console.log(data);
    if (this.ModuleUnLoad) this.ModuleUnLoad.emit();
  }

}

export class ComponentModuleData {
  url: string;
  elementTag: string;
  datacontract: Idatacontract;//{ assessment?: Assessment, apiServiceFromFW: any, action: 'new' | 'edit' | 'view' | 'amend' | 'viewhistory' | 'showtasks' };
}

// This should go as a package
export class Idatacontract {
  poaId?: string;
  referralId?: string;
  personId?: string;
  apiService: any;
  unload: any;
  isReadOnly: boolean
  uniqueid?: string
}


