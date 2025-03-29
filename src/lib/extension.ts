// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Marker } from '$models/Marker';
import { getLabelHexColor } from '$lib/label';
import { Extension, EXTENSION_POINT } from 'cm-chessboard/src/model/Extension';
import LabelPath from '../components/LabelPath.svelte';
import { mount } from "svelte";

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
    const beforePieceLayer: Document = this?.chessboard?.view?.markersLayer;
    const afterPieceLayer: Document = this?.chessboard?.view?.markersTopLayer;
    const width = this?.chessboard?.view?.squareWidth;
    const height = this?.chessboard?.view?.squareHeight;
    let point;
    const overlays = [];
    const icons = [];
    this?.markers?.forEach((marker) => {
      // Overlay
      point = this.chessboard.view.squareToPoint(marker.square);
      const rect = document.createElementNS(SVG_NAMESPACE, 'rect');
      rect.setAttribute('x', point.x);
      rect.setAttribute('y', point.y);
      rect.setAttribute('fill', getLabelHexColor(marker.label));
      rect.setAttribute('fill-opacity', '50%');
      rect.setAttribute('width', width);
      rect.setAttribute('height', height);
      overlays.push(rect);

      // Icon
      if (marker.showIcon) {
        const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
        svg.setAttribute('fill', 'white');
        const circle = document.createElementNS(SVG_NAMESPACE, 'circle');
        circle.setAttribute('r', width / 4);
        circle.setAttribute('cx', point.x + width);
        circle.setAttribute('cy', point.y);
        circle.setAttribute('fill', getLabelHexColor(marker.label));

        svg.setAttribute('x', point.x + width - 12);
        svg.setAttribute('y', point.y - 12);
        svg.setAttribute('viewbox', '0 0 24 24');

        mount(LabelPath, { props: { label: marker.label }, target: svg });

        icons.push(circle);
        icons.push(svg);
      }
    });
    beforePieceLayer?.replaceChildren(...overlays);
    afterPieceLayer?.replaceChildren(...icons);
  }
}
