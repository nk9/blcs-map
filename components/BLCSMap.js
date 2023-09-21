import React from "react";

import Map, { Popup, Source, Layer, ScaleControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// import lineLength from '@turf/length';
import styles from "./BLCSMap.module.scss";
// import ControlPanel from './CIMapControlPanel';
import { deepMerge } from 'src/utilities';

import access from 'public/static/gis/access.geojson'
import boundary from 'public/static/gis/boundary.geojson'
import cells from 'public/static/gis/cells.geojson'
import filters from 'public/static/gis/filters.geojson'

export default function BLCSMap() {
    const cellColors = [
        1, '#b950e9',
        2, '#fcf006',
        3, '#e735c9',
        4, '#1a41ed',
        5, '#fe9400',
        6, '#2d921e']
    const layers = {
        boundary: {
            layer: boundary,
            interactive: false,
            style: {
                'id': 'boundary',
                'type': 'line',
                'paint': {
                    'line-color': 'red',
                    'line-opacity': 1,
                    'line-width': 2,
                    'line-dasharray': [10, 4],
                }
            }
        },
        access: {
            layer: access,
            interactive: false,
            style: {
                'id': 'access',
                'type': 'circle',
                'paint': {
                    'circle-color': 'blue',
                    'circle-opacity': 1
                }
            } 
        },
        cells: {
            layer: cells,
            interactive: false,
            style: {
                'id': 'cells',
                'type': 'fill',
                'paint': {
                    'fill-color': ['match', ['get', 'traffshed'], ...cellColors, '#AAAAAA'],
                    'fill-opacity': 0.15
                }
            } 
        },
        filters: {
            layer: filters,
            interactive: false,
            style: {
                'id': 'filters',
                'type': 'circle',
                'paint': {
                    'circle-color': 'green',
                    'circle-opacity': 1
                }
            }
        }
    }

    const [layersVisibility, setLayersVisibility] = React.useReducer((state, updates) => ({ ...state, ...updates }),
        {});
    // const [hoverInfo, setHoverInfo] = React.useState(null);
    // const [hoveredFeature, setHoveredFeature] = React.useState(null);

    // const onHover = React.useCallback(event => {
    //     if (event.features.length > 0) {
    //         setHoveredFeature(event.features[0])
    //         setHoverInfo({
    //             longitude: event.lngLat.lng,
    //             latitude: event.lngLat.lat
    //         })
    //     } else {
    //         setHoveredFeature(null)
    //     }
    // }, []);

    const mapLayers = [];
    var interactiveLayerIds = [];

    for (const [layerID, { layer, interactive, style }] of Object.entries(layers)) {
        var layerStyle = deepMerge(style, { layout: { visibility: layersVisibility[layerID] } })

        mapLayers.push(
            <Source key={layerID} type="geojson" data={layer}>
                <Layer key={layerID}
                    {...style}
                />
            </Source>
        )
        if (interactive) {
            interactiveLayerIds.push(layerID)
        }
    }

    return (
        <Map
            initialViewState={{
                longitude: -0.109,
                latitude: 51.542,
                zoom: 14
            }}
            style={{ width: "100%", height: 700 }}
            mapStyle="mapbox://styles/nkocharh/clmt1bsj702f201qx1mvtdqoh"
            styleDiffing
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            // onMouseMove={onHover}
            interactiveLayerIds={interactiveLayerIds}
        >
            {mapLayers}
            {/* hoveredFeature && preparePopover(hoverInfo, hoveredFeature, styles) */}

            <ScaleControl />
            {/*<ControlPanel layers={layers} onChange={setLayersVisibility} />*/}
        </Map>
    )
}

// function preparePopover(hoverInfo, feature, styles) {
//     let infoPairs = {}
//     let headline = ""
//     let props = feature.properties

//     switch (feature.layer.id) {
//         case "protectedSegmentsHover":
//             headline = "Cycle Track"
//             const meters = (lineLength(feature) * 1000) || 0;
//             let length = meters;

//             if (props.bidi) {
//                 length = meters * 2;
//             }

//             infoPairs = {
//                 "Road": props.road,
//                 "Authority": (props.tfl == 1) ? "TfL" : "Council",
//                 "Bidirectional": (props.bidi == 1) ? "Yes" : "No",
//                 "Lane meters": length.toFixed() + "m",
//                 "Open as of": prettyDate(props.completed)
//             }
//             break;
//         case "ltns":
//             headline = "Low-Traffic Neighbourhood"
//             infoPairs = {
//                 "Name": props.Name,
//                 "Area": props.area.toFixed() + "ha",
//                 "Open as of": prettyDate(props.begin)
//             }
//             break;
//         case "hubs":
//             headline = "Cycle Logistics Hub"
//             infoPairs = {
//                 "Name": props.name,
//                 "Open as of": prettyDate(props.begin)
//             }
//             break;
//         default: return
//     }

//     let infoDivs = []
//     for (let [k, v] of Object.entries(infoPairs)) {
//         infoDivs.push(
//             <div className={styles.key} key={k}>{k}</div>,
//             <div className={styles.value} key={k + '-value'}>{v}</div>
//         )
//     }

//     return (
//         <Popup
//             longitude={hoverInfo.longitude}
//             latitude={hoverInfo.latitude}
//             closeButton={false}
//         >
//             <h3 className={styles.headline}>{headline}</h3>
//             <div className={styles.container}>
//                 {infoDivs}
//             </div>
//             {props.notes && <div className={styles.notes}>{props.notes}</div>}
//         </Popup>

//     )
// }

// function prettyDate(isoDate) {
//     if (isoDate) {
//         const date = new Date(isoDate)
//         return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(date)
//     }

//     return '';
// }
