// @ts-nocheck
import type { Marker } from '$models/Marker';
import { getLabelHexColor } from '$lib/label';
import { Extension, EXTENSION_POINT } from 'cm-chessboard/src/model/Extension';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

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
    const parent: Document = this?.chessboard?.view?.markersLayer;
    const width = this?.chessboard?.view?.squareWidth;
    const height = this?.chessboard?.view?.squareHeight;
    let point;
    const svgs = [];
    this?.markers?.forEach((marker) => {
      point = this.chessboard.view.squareToPoint(marker.square);
      const rect = document.createElementNS(SVG_NAMESPACE, 'rect');
      rect.setAttribute('x', point.x);
      rect.setAttribute('y', point.y);
      rect.setAttribute('fill', getLabelHexColor(marker.label));
      rect.setAttribute('fill-opacity', '60%');
      rect.setAttribute('width', width);
      rect.setAttribute('height', height);
      svgs.push(rect);
    });
    parent?.replaceChildren(...svgs);
  }
}
