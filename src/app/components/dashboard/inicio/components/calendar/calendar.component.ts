import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { ClientService } from '../../clientes.service';

@Component({
  selector: 'module-calendar-component',
  standalone: true,
  imports:[ CommonModule ],
  templateUrl: './calendar.component.html',
  styleUrls: [ './calendar.component.css'
  ]
})
export class CalendarComponent implements OnInit, OnChanges {

  week: any = [
    "L",
    "M",
    "M",
    "J",
    "V",
    "S",
    "D"
  ];


  monthSelect: any[];
  dateSelect: any;
  dateValue: any;

  monthString:any;

  dayToTitle : string;

  daysAsisted: number[];
  public isSmallScreen: boolean = false;

  @Input() public _id : string = '';

  public _idRespado = '0000'
  constructor(private breakpointObserver: BreakpointObserver, private clientService: ClientService) {
    this.daysAsisted = [];
    this.monthSelect = [];
    this.dayToTitle = '';
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (this._id != this._idRespado){
      const currentDate = new Date();
      const month = (currentDate.getMonth() + 1); // Obtener el mes sin ceros iniciales
      const year = currentDate.getFullYear(); // Obtener el año

      let y = `${((year.toString().split(""))[2])}${((year.toString().split(""))[3])}`;
      this.daysAsisted = await this.clientService.getDaysAssited( this._id , month.toString() , y );

      this._idRespado = this._id;
    }
  }

  async ngOnInit() {
    const currentDate = new Date();
    const month = (currentDate.getMonth() + 1); // Obtener el mes sin ceros iniciales
    const year = currentDate.getFullYear(); // Obtener el año

    this.getDaysFromDate(month, year);

    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
  }

  getDaysFromDate(month: any, year : number) {

    const currentDate = new Date();
    this.monthString = currentDate.toLocaleString('default', { month: 'long' })

    const startDate = moment.utc(`${year}-${month}-01`)
    const endDate = startDate.clone().endOf('month')
    this.dateSelect = startDate;
    this.dayToTitle = `${this.monthString} - ${year}`

    const diffDays = endDate.diff(startDate, 'days', true)
    const numberDays = Math.round(diffDays);

    const arrayDays = Object.keys([...Array(numberDays)]).map((a: any) => {
      a = parseInt(a) + 1;
      const dayObject = moment(`${year}-${month}-${a}`);
      return {
        name: dayObject.format("dddd"),
        value: a,
        indexWeek: dayObject.isoWeekday()
      };
    });

    this.monthSelect = arrayDays;
  }

  async changeMonth(flag: any) {
    if (flag < 0) {
      const prevDate = this.dateSelect.clone().subtract(1, "month");
      this.getDaysFromDate(prevDate.format("MM"), prevDate.format("YYYY"));
      this.daysAsisted = await this.clientService.getDaysAssited( this._id , prevDate.format("M"), prevDate.format("YY") );

    } else {
      const nextDate = this.dateSelect.clone().add(1, "month");
      this.getDaysFromDate(nextDate.format("MM"), nextDate.format("YYYY"));
      this.daysAsisted = await this.clientService.getDaysAssited( this._id , nextDate.format("M"), nextDate.format("YY") );
    }

    const newMonth = this.dateSelect.month() + 1; // Añadir 1 para ajustar el índice de Moment.js
    this.monthString = this.dateSelect.format('MMMM'); // Obtener el nombre del mes completo
    this.dayToTitle = `${this.monthString} - ${this.dateSelect.year()}`;
  }

  clickDay(day: any) {
    const monthYear = this.dateSelect.format('YYYY-MM')
    const parse = `${monthYear}-${day.value}`
    const objectDate = moment(parse)
    this.dateValue = objectDate;
  }

}
