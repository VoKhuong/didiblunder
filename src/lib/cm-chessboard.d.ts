declare module 'cm-chessboard/src/model/Extension' {
  export interface ChessboardView {
    markersLayer: SVGElement;
    markersTopLayer: SVGElement;
    squareWidth: number;
    squareHeight: number;
    squareToPoint(square: string): { x: number; y: number };
  }

  export interface ChessboardWithView {
    view: ChessboardView;
  }

  export interface ChessboardWithMarkers<Marker> extends ChessboardWithView {
    setMarkers?: (markers: Marker[]) => void;
  }

  export const EXTENSION_POINT: {
    afterRedrawBoard: string;
    [point: string]: string;
  };

  export class Extension<Marker = unknown> {
    protected chessboard: ChessboardWithMarkers<Marker>;

    constructor(chessboard: ChessboardWithMarkers<Marker>);

    registerExtensionPoint(name: string, callback: () => void): void;
  }
}
