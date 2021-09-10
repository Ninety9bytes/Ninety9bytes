import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import 'bingmaps';

@Component({
  selector: 'bing-map',
  templateUrl: './bing-map.component.html'
})
export class BingMapComponent implements AfterViewInit {
  @Input() longitude: number;
  @Input() latitude: number;
  @Input() buildingName: string;
  @Input() mapZoom: number;

  apiKey = this.configService.getSettings('bingMapAPIKey');
  defaultMapZoom = 15;

  @ViewChild('bingMap', {static: false}) bingMap;

  constructor(private configService: ConfigService) { }

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap() {
    const map = new Microsoft.Maps.Map(this.bingMap.nativeElement, {
      mapTypeId: Microsoft.Maps.MapTypeId.aerial,
      credentials: this.apiKey,
      disableBirdseye: true
    });
    const location = new Microsoft.Maps.Location(this.latitude, this.longitude);
    //Add a pushpin at the user's location.
    const options = {};
    if (this.buildingName) {
      options['title'] = this.buildingName;
    }
    const pin = new Microsoft.Maps.Pushpin(location, options);
    map.entities.push(pin);
    //Center the map on the user's location.
    map.setView({ center: location, zoom: this.mapZoom && this.mapZoom > 0 ? this.mapZoom : this.defaultMapZoom });
  }
}
