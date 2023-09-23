import React, { useState, useEffect } from "react";
import styles from "./BLCSMapControlPanel.module.scss";
import useMediaQuery from '@mui/material/useMediaQuery';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';

const CustomAccordion = styled(Accordion)(({ theme }) => {
    return {
        boxShadow: 'none',
        border: `0`,
        '.MuiAccordionDetails-root': { padding: 0 },
        '.MuiAccordionSummary-root': { padding: 0, minHeight: "2rem" },
        '.MuiAccordionSummary-content': { margin: 0 },
    };
});

const hideableLayers = {
    'ward_boundaries': { fullName: "Ward Boundaries", shortName: "Wards" },
    // 'majorRoads': { fullName: "Major Roads", shortName: "Roads" },
    // 'ltns': { fullName: "Low-Traffic Neighbourhoods", shortName: "LTNs" },
    // 'hubs': { fullName: "Cycle Logistics Hubs", shortName: "Hubs" }
}

// When the hideable layer above has its visibility toggled, also
// toggle this other layer
const pairedLayers = {
    'ward_boundaries': 'ward_names'
}

function ControlPanel({ layers, onChange }) {
    let defaultVisibility = Object.fromEntries(Object.entries(layers).map(
        // Apply default_visibility property, with default of visible
        ([key, info]) => [key, (info.default_visibility ?? true)])
    )
    const [visibility, setVisibility] = useState(defaultVisibility);

    useEffect(() => {
        // Convert true/false to "visible"/"none"
        const visibilityState = Object.fromEntries(
            Object.entries(visibility).map(([k, v]) => [k, v ? "visible" : "none"])
        );
        onChange(visibilityState);
    }, [visibility]);

    const onVisibilityChange = (name, value) => {
        var newVisibility = { ...visibility, [name]: value }

        if (Object.hasOwn(pairedLayers, name)) {
            newVisibility[pairedLayers[name]] = value
        }

        setVisibility(newVisibility);
    };
    
    const isMobile = useMediaQuery('(max-width: 768px)');

    const legend_line = (color, title, shortTitle, isDashed = false) => (
        <Typography variant="body1">
            <span className={styles["swatch"]} style={{
                borderColor: color,
                borderStyle: isDashed ? "dashed" : "solid"
            }}></span>
            {isMobile ? shortTitle : title}
        </Typography>)

    const legend_circle = (color, stroke_color, title, shortTitle) => (
        <Typography variant="body1">
            <span className={styles["circle-swatch"]} style={{
                borderColor: stroke_color,
                backgroundColor: color
            }}></span>
            {isMobile ? shortTitle : title}
        </Typography>)

    return (
        <div className={styles["control-panel"]}>
            <Typography variant="body1" style={{ fontWeight: 'bold' }}>Layers</Typography>
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
            <div> {/*Remove top line*/}
                <CustomAccordion disableGutters={true}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ flexDirection: "row-reverse" }}
                    >
                        <Typography variant="body1" mb={0} style={{ fontWeight: 'bold' }}>Legend</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {legend_circle('white', 'red', 'Proposed Filter', 'New')}
                        {legend_circle('#000', '#000', 'Existing Filter', 'Exist.')}
                        {legend_line('blue', 'Ward Boundaries', 'Wards')}
                        {legend_line('red', 'Phase 1', 'Phase 1', true)}
                    </AccordionDetails>
                </CustomAccordion>
            </div>
        </div>
    );
}

export default React.memo(ControlPanel);
