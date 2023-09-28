import { useState, useReducer } from "react";

import Map, { Popup, Source, Layer, ScaleControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// import lineLength from '@turf/length';
import styles from "./BLCSMap.module.scss";
import ControlPanel from './BLCSMapControlPanel';
import layers from './layers'
import { deepMerge } from 'src/utilities';
import Link from "src/Link";

import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function BLCSMap() {
    const [layersVisibility, setLayersVisibility] = useReducer((state, updates) => ({ ...state, ...updates }),
        {});
    const [hoverInfo, setHoverInfo] = useState(null);
    const [activeFeature, setActiveFeature] = useState(null);
    const [mapStyle, setMapStyle] = useState(process.env.NEXT_PUBLIC_MAPBOX_STYLE);

    const handleClick = (event) => {
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

    for (const [layerID, { layer, interactive, style, group }] of Object.entries(layers)) {
        var layerStyle = deepMerge(style, { layout: { visibility: layersVisibility[layerID] } })

        mapLayers.push(
            <Source key={layerID} type="geojson" data={layer}>
                <Layer key={layerID}
                    {...layerStyle}
                    metadata={{ "blcs:layer_group": group }}
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
            mapStyle={mapStyle}
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
            <ControlPanel
                layers={layers}
                setLayersVisibility={setLayersVisibility}
                mapStyle={mapStyle}
                setMapStyle={setMapStyle}
            />
        </Map>
    )
}

function preparePopup(hoverInfo, feature, styles, setActiveFeature) {
    let infoPairs = {}
    let headline = ""
    let props = feature.properties

    const lbi_links = {
        through_roads: "https://www.letstalk.islington.gov.uk/barnsbury-laycock-liveable-neighbourhood/widgets/77204/faqs#question20531",
        safe_routes: "https://www.letstalk.islington.gov.uk/barnsbury-laycock-liveable-neighbourhood/widgets/77204/faqs#question20529",
        shop_parades: "https://www.letstalk.islington.gov.uk/barnsbury-laycock-liveable-neighbourhood/widgets/77204/faqs#question20528",
        traffic_filters: "https://www.letstalk.islington.gov.uk/barnsbury-laycock-liveable-neighbourhood/widgets/77204/faqs#question20530"
    }

    const street_view = (url) => (<>
        <Link href={url} target="_blank">Show Me</Link>&nbsp;
        <OpenInNewIcon sx={{ fontSize: 12 }} />
    </>)

    const lbi_link = (layer_group) => (<>
        <Link href={lbi_links[layer_group]} target="_blank">LBI Let's Talk</Link>&nbsp;
        <OpenInNewIcon sx={{ fontSize: 12 }} />
    </>)

    const defaultInfo = () => ({
        "Road": props.name,
        "Street View": street_view(props.url),
        "More Info": lbi_link(feature.layer.metadata["blcs:layer_group"])
    })

    switch (feature.layer.id) {
        case "cells":
            headline = "Motor Traffic Sub-Area"

            infoPairs = {
                "Access via": props.access,
                "More Info": lbi_link(feature.layer.metadata["blcs:layer_group"])
            }

            break;
        case "existing_filters":
            headline = "Existing Filter"
            infoPairs = defaultInfo()
            break;

        case "upgraded_filters":
            headline = "Upgraded Filter"
            infoPairs = defaultInfo()
            break;

        case "new_filters":
            headline = "Proposed Filter"
            infoPairs = defaultInfo()
            break;

        case "one_way_filters":
            headline = "Proposed One-Way Filter"
            infoPairs = defaultInfo()
            break;

        case "access":
            headline = "Access Point"
            infoPairs = defaultInfo()
            break;

        case "one_ways_clickable":
            headline = "Changed One-Way Rules"
            infoPairs = defaultInfo()
            break;

        case "parades":
            headline = "Local Shops"
            infoPairs = defaultInfo()
            break;

        case "main_roads":
            headline = "Improved Through Road"
            infoPairs = defaultInfo()
            break;

        case "cycle_routes_clickable":
            headline = "Cycle Route"
            infoPairs = defaultInfo()
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
