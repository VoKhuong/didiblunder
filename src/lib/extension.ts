// @ts-nocheck
import type { Marker } from '$models/Marker';
import { Extension, EXTENSION_POINT } from 'cm-chessboard/src/model/Extension';

export class EvaluationMarkerExtension extends Extension {
  markers: Marker[];

  constructor(chessboard: any) {
    super(chessboard);
    this.markers = [];

    chessboard.setMarkers = this.setMarkers.bind(this);

    this.registerExtensionPoint(EXTENSION_POINT.afterRedrawBoard, this.drawMarkers);
  }

  setMarkers(markers: Marker[]) {
    this.markers = markers;
    this.drawMarkers();
  }

  drawMarkers() {
    console.log('draw');
    this?.markers?.forEach((marker) => {
      console.log(marker);
    });
  }
}
