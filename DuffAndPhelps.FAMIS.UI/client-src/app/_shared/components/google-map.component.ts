import { Component, Input, OnInit } from '@angular/core';
import { MapMarker } from '../../_ui/models/map-marker';
import { MapTypeStyle } from '@agm/core';

@Component({
  selector: 'google-map',
  templateUrl: './google-map.component.html'
})
export class GoogleMapComponent implements OnInit {
  @Input() longitude: number;
  @Input() latitude: number;
  @Input() buildingName: string;
  @Input() googleMapZoom: number;

  mapMarkers = new Array<MapMarker>();

  mapStyles: MapTypeStyle[] = [
    {
      elementType: 'labels',
      stylers: [
        {
          visibility: 'off'
        }
      ]
    },
    {
      featureType: 'administrative.neighborhood',
      stylers: [
        {
          visibility: 'off'
        }
      ]
    }
  ];

  constructor() {}

  ngOnInit() {
    this.initMap();
  }

  private initMap() {
      this.mapMarkers.push(<MapMarker>{ lat: this.latitude, lng: this.longitude, label: this.buildingName, draggable: false });
  }
}
