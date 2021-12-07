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
export class SNOMED{
  private _term: string = "";
  private _code: string = "";
  get term(): string{
      return this._term
  };
  set term(v:string){
      this._term = v;
      this.bindingValue = `${this.code} | ${this.term}`;
  }
  fsn: string;
  get code(): string{
      return this._code;
  };
  set code(v:string){
      this._code = v;
      this.bindingValue = `${this.code} | ${this.term}`;
  }
  parentCode: string;
  level: string;
  bindingValue: string = "";
}
