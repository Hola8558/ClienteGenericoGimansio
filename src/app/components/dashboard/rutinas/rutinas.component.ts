import { AfterViewInit, Component } from '@angular/core';
import { ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { RutinasService } from './rutinas.service';

@Component({
  selector: 'app-rutinas',
  templateUrl: './rutinas.component.html',
  styleUrls: ['./rutinas.component.css']
})
export class RutinasComponent implements AfterViewInit {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  constructor(private rutinasService: RutinasService) {}

  ngAfterViewInit() {
    //const savedTabIndex = this.rutinasService.getItem('selectedTabIndex');
    //if (savedTabIndex !== null) {
    //  this.tabGroup.selectedIndex = +savedTabIndex;
    //}
  }

  tabChanged(event: any): void {
    //const selectedIndex = event.index.toString();
    //this.rutinasService.setItem('selectedTabIndex', selectedIndex);
  }
}
