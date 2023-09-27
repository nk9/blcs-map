import access from 'public/static/gis/access.geojson'
import one_ways from 'public/static/gis/one_ways.geojson'
import boundary from 'public/static/gis/boundary.geojson'
import cells from 'public/static/gis/cells.geojson'
import filters from 'public/static/gis/filters.geojson'
import parades from 'public/static/gis/parades.geojson'
import main_roads from 'public/static/gis/main-roads.geojson'
import cycle_routes from 'public/static/gis/cycle-routes.geojson'
import wards from 'public/static/gis/islington-ward-boundaries.geojson'

const cellColors = [
    1, '#b950e9', // purple  Tolpuddle Triangle
    2, '#fcf006', // yellow  Thornhill Sq
    3, '#e735c9', // pink    HMS Pentonville
    4, '#1a41ed', // blue    Paradise Park
    5, '#fe9400', // orange  Liverpool Rd
    6, '#2d921e'] // green   Upper St

const layers = {
    ward_boundaries: {
        layer: wards,
        interactive: false,
        default_visibility: true,
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
        default_visibility: true,
        style: {
            'id': 'ward_text',
            'type': 'symbol',
            'paint': {
                'text-color': 'blue',
                'text-opacity': 0.5,
                'text-halo-color': '#fff',
                'text-halo-width': 1,
            },
            'layout': {
                'text-field': ['get', 'NAME'],
                'text-size': 20,
                'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
            },
        },
    },
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
            'filter': ['==', ['get', 'phase'], 1]
        }
    },
    cells: {
        layer: cells,
        interactive: true,
        default_visibility: false,
        group: "traffic_filters",
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
        default_visibility: false,
        group: "traffic_filters",
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
        default_visibility: false,
        group: "traffic_filters",
        style: {
            'id': 'one_ways_clickable',
            'type': 'line',
            'paint': {
                'line-width': 15,
                'line-opacity': 0
            },
        }
    },
    main_roads: {
        layer: main_roads,
        interactive: true,
        default_visibility: false,
        group: "through_roads",
        style: {
            'id': 'main_roads',
            'type': 'line',
            'paint': {
                'line-width': 15,
                'line-color': 'green',
                'line-dasharray': [.5, .25],
            },
        }
    },
    parades: {
        layer: parades,
        interactive: true,
        default_visibility: true,
        group: "shop_parades",
        style: {
            'id': 'parades',
            'type': 'line',
            'paint': {
                'line-width': 15,
                'line-color': 'orange',
                'line-dasharray': [.5, .25],
            },
        }
    },
    cycle_routes: {
        layer: cycle_routes,
        interactive: false,
        default_visibility: false,
        group: "safe_routes",
        style: {
            'id': 'cycle_routes',
            'type': 'line',
            'paint': {
                'line-width': 2,
                'line-color': 'purple',
            },
        }
    },
    cycle_routes_clickable: {
        layer: cycle_routes,
        interactive: true,
        default_visibility: false,
        group: "safe_routes",
        style: {
            'id': 'cycle_routes_clickable',
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
        default_visibility: false,
        group: "traffic_filters",
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
        default_visibility: false,
        group: "traffic_filters",
        style: {
            'id': 'existing_filters',
            'type': 'circle',
            'paint': {
                'circle-color': 'black',
                'circle-opacity': 1,
                'circle-stroke-width': 2,
                'circle-stroke-color': 'black',
            },
            'filter': ['in', ['get', 'existing'], ["literal", [1, 2]]]
        }
    },
    new_filters: {
        layer: filters,
        interactive: true,
        default_visibility: false,
        group: "traffic_filters",
        style: {
            'id': 'new_filters',
            'type': 'circle',
            'paint': {
                'circle-color': 'white',
                'circle-opacity': 1,
                'circle-stroke-width': 2,
                'circle-stroke-color': 'red',
            },
            'filter': ['==', ['get', 'existing'], 0]
        }
    },
    one_way_filters: {
        layer: filters,
        interactive: true,
        default_visibility: false,
        group: "traffic_filters",
        style: {
            'id': 'one_way_filters',
            'type': 'symbol',
            'layout': {
                'icon-image': 'road-closure'
            },
            'filter': ['==', ['get', 'existing'], 3]
        }
    },
    upgraded_filters: {
        layer: filters,
        interactive: true,
        default_visibility: false,
        group: "safe_routes",
        style: {
            'id': 'upgraded_filters',
            'type': 'circle',
            'paint': {
                'circle-color': 'white',
                'circle-opacity': 1,
                'circle-stroke-width': 2,
                'circle-stroke-color': 'blue',
            },
            'filter': ['==', ['get', 'existing'], 2],
        }
    },

}

export default layers
