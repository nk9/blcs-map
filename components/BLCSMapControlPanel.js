import React, { useState, useEffect, Fragment } from "react";
import styles from "./BLCSMapControlPanel.module.scss";

import Tooltip from "@mui/material/Tooltip";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
} from "@mui/material";

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import MapIcon from '@mui/icons-material/Map';

import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const CustomAccordion = styled(Accordion)(({ theme }) => {
    return {
        boxShadow: 'none',
        border: `0`,
        '.MuiAccordionDetails-root': { padding: 0 },
        '.MuiAccordionSummary-root': { padding: 0, minHeight: "2rem", marginTop: "4px" },
        '.MuiAccordionSummary-content': { margin: 0 },
    };
});

const hideableLayers = {
    'parades': { fullName: "1. Shop parades", shortName: "1. Shops" },
    'cycle_routes': { fullName: "2. Safe routes", shortName: "2. Routes" },
    'existing_filters': { fullName: "3. Traffic filters", shortName: "3. Filters" },
    'main_roads': { fullName: "4. Through roads", shortName: "4. Thru" },
    'ward_boundaries': { fullName: "Ward Boundaries", shortName: "Wards" },
}

// When the hideable layer above has its visibility toggled, also
// toggle this other layer
const pairedLayers = {
    'ward_boundaries': ['ward_names'],
    'existing_filters': ['cells', 'new_filters', 'one_way_filters', 'access', 'one_ways', 'one_ways_clickable'],
    'cycle_routes': ['upgraded_filters', 'cycle_routes_clickable'],
}

function ControlPanel({ layers, setLayersVisibility, mapStyle, setMapStyle }) {
    const [visibility, setVisibility] = useState(() => {
        // Apply default_visibility property, with default of visible
        return Object.fromEntries(Object.entries(layers).map(
            ([key, info]) => [key, (info.default_visibility ?? true)])
        )
    });
    // const [mapBackground, setMapBackground] = useState(process.env.NEXT_PUBLIC_MAPBOX_STYLE)

    useEffect(() => {
        // Convert true/false to "visible"/"none"
        const visibilityState = Object.fromEntries(
            Object.entries(visibility).map(([k, v]) => [k, v ? "visible" : "none"])
        );
        setLayersVisibility(visibilityState);
    }, [visibility]);

    const onVisibilityChange = (name, value) => {
        var newVisibility = { ...visibility, [name]: value }

        if (Object.hasOwn(pairedLayers, name)) {
            for (const layerID of pairedLayers[name]) {
                newVisibility[layerID] = value
            }
        }

        setVisibility(newVisibility);
    };

    const handleMapStyleChange = (event, newStyle) => {
        setMapStyle(newStyle)
    }

    // useEffect(() => {
    //     setMapStyle(mapBackground)
    // }, [mapBackground])
    
    const isMobile = useMediaQuery('(max-width: 700px)');
    const underlineStyle = {
        textDecoration: 'underline dashed',
        WebkitTextDecorationLine: 'underline',
        WebkitTextDecorationStyle: 'dashed',
    }

    const legend_line = (color, title, shortTitle, isDashed = false) => (
        <Typography variant="body1" key={title}>
            <span className={styles["swatch"]} style={{
                borderColor: color,
                borderStyle: isDashed ? "dashed" : "solid"
            }}></span>
            {isMobile ? shortTitle : title}
        </Typography>)

    const legend_circle = (color, stroke_color, title, shortTitle) => (<div key={title}>
        <span className={styles["circle-swatch"]} style={{
            borderColor: stroke_color,
            backgroundColor: color
        }}></span>
        <Typography variant="body1" sx={{ display: 'inline' }}>
            {isMobile ?
                (<Tooltip title={title} enterTouchDelay={0}>
                    <span style={underlineStyle}>
                        {shortTitle}
                    </span>
                </Tooltip>) :
                title
            }
        </Typography>
    </div>)

    const legend_half_square = (color1, color2, title, shortTitle, tooltip) => (
        <Fragment key={title}>
            <span className={styles["half-square-swatch"]} style={{
                borderTopColor: color1,
                borderLeftColor: color1,
                borderRightColor: color2,
                borderBottomColor: color2
            }}></span>
            <Typography variant="body1" sx={{ display: 'inline' }}>
                <Tooltip title={tooltip} enterTouchDelay={0} leaveTouchDelay={4000}>
                    <span style={underlineStyle}>
                        {isMobile ? shortTitle : title}
                    </span>
                </Tooltip>
            </Typography>
        </Fragment>
    )

    const build_legend = () => {
        var items = []

        if (visibility["ward_boundaries"]) {
            items.push(legend_line('blue', 'Ward Boundaries', 'Wards'))
        }
        if (visibility["parades"]) {
            items.push(legend_line('orange', 'Shop Parades', 'Shops', true))
        }
        if (visibility["cycle_routes"]) {
            items.push(legend_line('purple', 'Cycle Routes', 'Cycles'))
        }
        if (visibility["upgraded_filters"]) {
            items.push(legend_circle('white', 'blue', 'Upgraded Filter', 'Upgr.'))
        }
        if (visibility["new_filters"]) {
            items.push(legend_circle('white', 'red', 'Proposed Filter', 'Prop.'))
        }
        if (visibility["existing_filters"]) {
            items.push(legend_circle('#000', '#000', 'Existing Filter', 'Exist.'))
        }
        if (visibility["one_ways"]) {
            items.push(legend_line('#01A938', '1-way Changes', '1-ways', true))
        }
        if (visibility["cells"]) {
            items.push(legend_half_square(
                'rgba(185, 80, 233, 0.35)',
                'rgba(254, 148, 0, 0.35)',
                'Sub-areas',
                'Areas',
                'A sub-area is a network of streets all reachable by motor vehicle without using a boundary road.')
            )
        }
        if (visibility["main_roads"]) {
            items.push(legend_line('green', 'Improved Roads', 'Improve', true))
        }

        items.push(legend_line('red', 'Phase 1', 'Phase 1', true))

        return items
    }

    return (
        <div className={styles["control-panel"]}>
            <div className={styles["toggle-buttons"]}>
                <ToggleButtonGroup
                    size="small"
                    value={mapStyle}
                    onChange={handleMapStyleChange}
                    exclusive={true}
                >
                    <ToggleButton value={process.env.NEXT_PUBLIC_MAPBOX_STYLE} aria-label="map" key="map">
                        <MapIcon style={{ fontSize: "14px" }} />
                    </ToggleButton>
                    <ToggleButton value={process.env.NEXT_PUBLIC_MAPBOX_SATELLITE_STYLE} aria-label="satellite" key="satellite">
                        <SatelliteAltIcon style={{ fontSize: "14px" }} />
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
            <div> {/*Remove top line*/}
                <CustomAccordion disableGutters defaultExpanded>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ flexDirection: "row-reverse" }}
                    >
                        <Typography variant="body1" mb={0} style={{ fontWeight: 'bold' }}>Layers</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {Object.entries(hideableLayers).map(([layerID, { fullName, shortName }]) => (
                            <div key={layerID} className="input">
                                <input
                                    id={layerID}
                                    type="checkbox"
                                    checked={visibility[layerID]}
                                    onChange={evt => onVisibilityChange(layerID, evt.target.checked)}
                                />
                                <label htmlFor={layerID}>{isMobile ? shortName : fullName}</label>
                            </div>
                        ))}
                    </AccordionDetails>
                </CustomAccordion>
            </div>

            <div> {/*Remove top line*/}
                <CustomAccordion disableGutters={true}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ flexDirection: "row-reverse" }}
                    >
                        <Typography variant="body1" mb={0} style={{ fontWeight: 'bold' }}>Legend</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {build_legend()}
                    </AccordionDetails>
                </CustomAccordion>
            </div>
        </div>
    );
}

export default React.memo(ControlPanel);
