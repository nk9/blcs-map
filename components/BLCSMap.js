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
import one_ways from 'public/static/gis/one_ways.geojson'
import boundary from 'public/static/gis/boundary.geojson'
import cells from 'public/static/gis/cells.geojson'
import filters from 'public/static/gis/filters.geojson'
import wards from 'public/static/gis/islington-ward-boundaries.geojson'

export default function BLCSMap() {
    const cellColors = [
        1, '#b950e9', // purple  Tolpuddle Triangle
        2, '#fcf006', // yellow  Thornhill Sq
        3, '#e735c9', // pink    HMS Pentonville
        4, '#1a41ed', // blue    Paradise Park
        5, '#fe9400', // orange  Liverpool Rd
        6, '#2d921e'] // green   Upper St

    const layers = {
        boundary_phase1: {
            layer: boundary,
            interactive: false,
            style: {
                'id': 'boundary_phase1',
                'type': 'line',
                'paint': {
                    'line-color': 'red',
                    'line-opacity': 1,
                    'line-width': 2,
                    'line-dasharray': [5, 2],
                },
                'layer-before': 'ward_boundaries',
                'filter': ['==', ['get', 'phase'], 1]
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
                'layer-before': 'one_ways',
            },
        },
        cells: {
            layer: cells,
            interactive: true,
            default_visibility: false,
            style: {
                'id': 'cells',
                'type': 'fill',
                'paint': {
                    'fill-color': ['match', ['get', 'traffshed'], ...cellColors, '#AAAAAA'],
                    'fill-opacity': 0.15
                }
            } 
        },
        one_ways: {
            layer: one_ways,
            interactive: false,
            style: {
                'id': 'one_ways',
                'type': 'line',
                'paint': {
                    'line-color': '#01A938',
                    'line-opacity': 1,
                    'line-width': 2,
                    'line-dasharray': [3, 1],
                },
            }
        },
        one_ways_clickable: {
            layer: one_ways,
            interactive: true,
            style: {
                'id': 'one_ways_clickable',
                'type': 'line',
                'paint': {
                    'line-width': 15,
                    'line-opacity': 0
                },
            }
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
        upgraded_filters: {
            layer: filters,
            interactive: true,
            style: {
                'id': 'upgraded_filters',
                'type': 'circle',
                'paint': {
                    'circle-color': 'white',
                    'circle-opacity': 1,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': 'blue',
                },
                'layer-before': 'ward_names',
                'filter': ['==', ['get', 'existing'], 2]
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
                longitude: -0.11,
                latitude: 51.542,
                zoom: 13.8
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
        case "cells":
            headline = "Motor Traffic Sub-Area"

            infoPairs = {
                "Access via": props.access,
            }

            break;
        case "existing_filters":
            headline = "Existing Filter"

            infoPairs = {
                "Road": props.name,
                "Street View": street_view(props.url)
            }
            break;
        case "upgraded_filters":
            headline = "Upgraded Filter"

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
        case "one_ways_clickable":
            console.log("one_ways_clickable??", props)
            headline = "Changed One-Way Rules"
            infoPairs = {
                "Road": props.name,
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
