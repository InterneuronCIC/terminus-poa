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
import { Component, Injectable, OnInit, ViewChild } from '@angular/core';

import { NgbCalendar, NgbDateAdapter, NgbDateParserFormatter, NgbDatepicker, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStructAdapter } from '@ng-bootstrap/ng-bootstrap/datepicker/adapters/ngb-date-adapter';
import * as moment from 'moment';
import { months } from 'moment';
/**
 * This Service handles how the date is represented in scripts i.e. ngModel.
 */
 @Injectable()
 export class CustomAdapter extends NgbDateAdapter<string> {

   readonly DELIMITER = '-';

   fromModel(value: string | null): NgbDateStruct | null {
     if (value) {
       let date = value.split(this.DELIMITER);
       return {
         day : parseInt(date[2], 10),
         month : parseInt(date[1], 10),
         year : parseInt(date[0], 10)
       };
     }
     return null;
   }

   toModel(date: NgbDateStruct | null): string | null {
     //return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : null;


     if(!date) {
      return null;
    }
   var dayStr;
   if(date.day < 10) {
     dayStr = '0' + date.day;
   }
   else {
    dayStr = date.day;
   }
   var monthStr;
   if(date.month < 10) {
     monthStr = '0' + date.month;
   }
   else {
    monthStr = date.month;
   }

   return date ? date.year + this.DELIMITER + monthStr + this.DELIMITER + dayStr : null;

     //return date ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day : null;
   }
 }
