import React from "react";

import Map, { Popup, Source, Layer, ScaleControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// import lineLength from '@turf/length';
import styles from "./BLCSMap.module.scss";
import ControlPanel from './BLCSMapControlPanel';
import { deepMerge } from 'src/utilities';
import Link from "src/Link";

import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import access from 'public/static/gis/access.geojson'
import boundary from 'public/static/gis/boundary.geojson'
import cells from 'public/static/gis/cells.geojson'
import filters from 'public/static/gis/filters.geojson'
import wards from 'public/static/gis/islington-ward-boundaries.geojson'

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
                    'line-dasharray': [5, 2],
                },
                'layer-before': 'ward_boundaries',
            }
        },
        ward_boundaries: {
            layer: wards,
            interactive: false,
            default_visibility: false,
            style: {
                'id': 'ward_boundaries',
                'type': 'line',
                'paint': {
                    'line-color': 'blue',
                    'line-opacity': 1,
                    'line-width': 1,
                },
            }
        },
        ward_names: {
            layer: wards,
            interactive: false,
            default_visibility: false,
            style: {
                'id': 'ward_text',
                'type': 'symbol',
                'paint': {
                    'text-color': 'blue',
                    'text-opacity': 0.5,
                },
                'layout': {
                    'text-field': ['get', 'NAME'],
                    'text-size': 20,
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                },
            },
        },
        access: {
            layer: access,
            interactive: true,
            style: {
                'id': 'access',
                'type': 'symbol',
                'layout': {
                    'icon-image': 'double-arrow-36',
                    'icon-rotate': ['get', 'rotation'],
                    'icon-size': 0.8,
                    'icon-allow-overlap': true,
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
        existing_filters: {
            layer: filters,
            interactive: true,
            style: {
                'id': 'existing_filters',
                'type': 'circle',
                'paint': {
                    'circle-color': 'black',
                    'circle-opacity': 1,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': 'black',
                },
                'layer-before': 'ward_names',
                'filter': ['==', ['get', 'existing'], 1]
            }
        },
        new_filters: {
            layer: filters,
            interactive: true,
            style: {
                'id': 'new_filters',
                'type': 'circle',
                'paint': {
                    'circle-color': 'white',
                    'circle-opacity': 1,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': 'red',
                },
                'layer-before': 'ward_names',
                'filter': ['==', ['get', 'existing'], 0]
            }
        },
        one_way_filters: {
            layer: filters,
            interactive: true,
            style: {
                'id': 'one_way_filters',
                'type': 'symbol',
                'layout': {
                    'icon-image': 'road-closure'
                },
                'layer-before': 'ward_names',
                'filter': ['==', ['get', 'existing'], 3]
            }
        },
    }

    const [layersVisibility, setLayersVisibility] = React.useReducer((state, updates) => ({ ...state, ...updates }),
        {});
    const [hoverInfo, setHoverInfo] = React.useState(null);
    const [activeFeature, setActiveFeature] = React.useState(null);

    const handleClick = (event) => {
        console.log("clicked", event.features)
        if (event.features.length > 0) {
            setActiveFeature(event.features[0])
            setHoverInfo({
                longitude: event.lngLat.lng,
                latitude: event.lngLat.lat
            })
        } else {
            setActiveFeature(null)
        }
    };

    const handleMouseEnter = (event) => {
        let canvas = event.originalEvent.target
        canvas.style.cursor = 'pointer'
    }

    const handleMouseLeave = (event) => {
        let canvas = event.originalEvent.target
        canvas.style.cursor = ''
    }

    const mapLayers = [];
    var interactiveLayerIds = [];

    for (const [layerID, { layer, interactive, style }] of Object.entries(layers)) {
        var layerStyle = deepMerge(style, { layout: { visibility: layersVisibility[layerID] } })

        mapLayers.push(
            <Source key={layerID} type="geojson" data={layer}>
                <Layer key={layerID}
                    {...layerStyle}
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
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            interactiveLayerIds={interactiveLayerIds}
        >
            {mapLayers}
            {activeFeature && preparePopup(hoverInfo, activeFeature, styles, setActiveFeature)}

            <ScaleControl />
            <ControlPanel layers={layers} onChange={setLayersVisibility} />
        </Map>
    )
}

function preparePopup(hoverInfo, feature, styles, setActiveFeature) {
    let infoPairs = {}
    let headline = ""
    let props = feature.properties

    const street_view = (url) => (<>
        <Link href={url} target="_blank">Show Me</Link>&nbsp;
        <OpenInNewIcon sx={{ fontSize: 12 }} />
    </>)

    switch (feature.layer.id) {
        case "existing_filters":
            headline = "Existing Filter"

            infoPairs = {
                "Road": props.name,
                "Street View": street_view(props.url)
            }
            break;
        case "new_filters":
            headline = "Proposed Filter"
            infoPairs = {
                "Road": props.name,
                "Street View": street_view(props.url)
            }
            break;
        case "one_way_filters":
            headline = "Proposed One-Way Filter"
            infoPairs = {
                "Road": props.name,
                "Street View": street_view(props.url)
            }
            break;
        case "access":
            headline = "Access Point"
            infoPairs = {
                "Road": props.street,
                "Street View": street_view(props.url)
            }
            break;
        default: return
    }

    let infoDivs = []
    for (let [k, v] of Object.entries(infoPairs)) {
        infoDivs.push(
            <div className={styles.key} key={k}>{k}</div>,
            <div className={styles.value} key={k + '-value'}>{v}</div>
        )
    }

    const handleClosePopup = () => {
        setActiveFeature(null);
    };

    return (
        <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={true}
            onClose={handleClosePopup}
            key={`${feature.layer.id}-${feature.properties.id}`}
        >
            <h3 className={styles.headline}>{headline}</h3>
            <div className={styles.container}>
                {infoDivs}
            </div>
            {props.notes && <div className={styles.notes}>{props.notes}</div>}
        </Popup>

    )
}

// function prettyDate(isoDate) {
//     if (isoDate) {
//         const date = new Date(isoDate)
//         return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(date)
//     }

//     return '';
// }
