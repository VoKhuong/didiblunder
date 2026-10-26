import type { Marker } from '$models/Marker';
import { getLabelHexColor } from '$lib/label';
import { mount } from 'svelte';
import {
  Extension,
  EXTENSION_POINT,
  type ChessboardWithMarkers
} from 'cm-chessboard/src/model/Extension';
import LabelPath from '../components/LabelPath.svelte';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export class EvaluationMarkerExtension extends Extension<Marker> {
  markers: Marker[];

  constructor(chessboard: ChessboardWithMarkers<Marker>) {
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
    const beforePieceLayer = this.chessboard.view.markersLayer;
    const afterPieceLayer = this.chessboard.view.markersTopLayer;
    const width = this.chessboard.view.squareWidth;
    const height = this.chessboard.view.squareHeight;
    const overlays: SVGRectElement[] = [];
    const icons: (SVGCircleElement | SVGSVGElement)[] = [];
    this.markers.forEach((marker) => {
      // Overlay
      const point = this.chessboard.view.squareToPoint(marker.square);
      const rect = document.createElementNS(SVG_NAMESPACE, 'rect');
      rect.setAttribute('x', String(point.x));
      rect.setAttribute('y', String(point.y));
      rect.setAttribute('fill', getLabelHexColor(marker.label));
      rect.setAttribute('fill-opacity', '50%');
      rect.setAttribute('width', String(width));
      rect.setAttribute('height', String(height));
      overlays.push(rect);

      // Icon
      if (marker.showIcon) {
        const radius = width / 4;
        const iconSize = radius * 1.5;
        const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
        svg.setAttribute('fill', 'white');
        const circle = document.createElementNS(SVG_NAMESPACE, 'circle');
        circle.setAttribute('r', String(radius));
        circle.setAttribute('cx', String(point.x + width));
        circle.setAttribute('cy', String(point.y));
        circle.setAttribute('fill', getLabelHexColor(marker.label));

        svg.setAttribute('x', String(point.x + width - iconSize / 2));
        svg.setAttribute('y', String(point.y - iconSize / 2));
        svg.setAttribute('width', String(iconSize));
        svg.setAttribute('height', String(iconSize));
        svg.setAttribute('viewBox', '0 0 24 24');

        mount(LabelPath, { props: { label: marker.label }, target: svg });

        icons.push(circle);
        icons.push(svg);
      }
    });
    beforePieceLayer?.replaceChildren(...overlays);
    afterPieceLayer?.replaceChildren(...icons);
  }
}
