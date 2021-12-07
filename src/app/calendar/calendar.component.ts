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
import { Component, Injectable, OnInit, ViewChild } from '@angular/core';

import { NgbCalendar, NgbDateAdapter, NgbDateParserFormatter, NgbDatepicker, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStructAdapter } from '@ng-bootstrap/ng-bootstrap/datepicker/adapters/ngb-date-adapter';
import * as moment from 'moment';
import { months } from 'moment';
import { CustomAdapter } from '../datepicker-helpers/custom-adapter';
import { CustomDateParserFormatter } from '../datepicker-helpers/custom-date-parser-formatter';




@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],

  // NOTE: For this example we are only providing current component, but probably
  // NOTE: you will want to provide your main App Module
  // providers: [
  //   {provide: NgbDateAdapter, useClass: CustomAdapter},
  //   {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  // ]
})
export class CalendarComponent implements OnInit {

  model: any;
  //date: { year: number, month: number, day: number };
  @ViewChild('dp',null) dp: NgbDatepicker;


  constructor( private ngbCalendar: NgbCalendar, private dateAdapter: NgbDateAdapter<string>,  ) {

   }

  ngOnInit() {
    // this.model = {} as NgbDateStruct;
    // this.model.day =  this.ngbCalendar.getToday().day;
    // this.model.month =  this.ngbCalendar.getToday().month;
    // this.model.year =  this.ngbCalendar.getToday().year;

    const now = new Date();
    const since = moment().subtract(14,'d').toDate();


    var dayStr;
    var monthStr;
    if((now.getMonth() + 1)  < 10) {
      monthStr = '0' + (now.getMonth() + 1);
    }
    else {
      monthStr = (now.getMonth() + 1);
    }

    if(now.getDate() < 10) {
      dayStr = '0' + now.getDate();
    }
    else {
      dayStr = now.getDate();
    }


    //this.model =  now.getDate() + '-' +  (now.getMonth() + 1) + '-' +  (now.getFullYear()) ;
    //this.model = now.getFullYear() + '-'  + (now.getMonth() + 1)  + '-' +   now.getDate();
    this.model = now.getFullYear() + '-'  + monthStr + '-' +   dayStr;

  }

  get today() {
    return this.dateAdapter.toModel(this.ngbCalendar.getToday())!;
  }

  //date: string;


}
