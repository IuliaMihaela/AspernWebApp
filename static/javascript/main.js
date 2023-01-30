// initialization collapsible
console.log('collapsible elem', $('.collapsible').collapsible())
$('.collapsible').collapsible();


// this function will be used to find the index of a layer in the order list of the map
function getKeyByValue(object, value) {
            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    if (object[prop] === value)
                    return prop;
                }
            }
        }


// for the minimal legend, the hover effect on the colors
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})


mapboxgl.accessToken = 'pk.eyJ1IjoiaXVsaWFtaWhhZWxhIiwiYSI6ImNsNmdiMTEwZTBwYmczb3ByMGY2YnhwcGEifQ.iwOH4cy-z0B3Q8a41_yfSQ';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/light-v10',
  center: [16.507,48.225], // starting position [lng, lat]
  zoom: 13.66, // starting zoom
  minZoom: 10.4,
 });

// store the properties to be displayed for each layer
const properties_aspern_blocks = ['main_cover', 'OSR', 'max_height', 'count_trees', 'count_trees20m', 'count_shops', 'zoning']
// const properties_aspern_landcover = ['class'];
const properties_aspern_bkmBlocks = ['height'];
const properties_aspern_landuse = ['landuse'];
const properties_aspern_roads = ['name', 'category', 'form ', 'width '];
const properties_aspern_publiclines = ['line', 'line_type'];
const properties_aspern_trees = ['species', 'year', 'address', 'height'];
const properties_aspern_publicstops = ['stop_name', 'line', 'line_type'];
const properties_shops = ['shop'];
const properties_osr = ['main_cover', 'OSR', 'openspace'];
const properties_zoning = ['main_cover', 'zoning_code', 'zoning'];
const properties_green_area = ['main_cover', 'area_green_rel'];
const properties_max_height = ['main_cover', 'max_height'];


// define the dictionaries that are going to store the geojson data that is going to get updated
// at the moment only the data for the landuse (inside blocks) and the 3d buildings (bkmblocks) can be changes by the user
let data_aspern_blocks;
let data_aspern_landcover;
let data_aspern_bkmBlocks;
let data_aspern_roads;
let data_aspern_publiclines ;
let data_aspern_trees;
let data_aspern_publicstops;
let data_shops;

// define the dictionaries that are going to store the geojson data that is going to stay intact
let original_data_aspern_blocks;
let original_data_aspern_landcover ;
let original_data_aspern_bkmBlocks;
let original_data_aspern_roads;
let original_data_aspern_publiclines;
let original_data_aspern_trees;
let original_data_aspern_publicstops;
let original_data_shops;

//define data for graphs for each layer
let graph_data_aspern_blocks;
let graph_data_aspern_landuse;
let graph_data_aspern_roads;
let graph_data_aspern_publiclines;
let graph_data_aspern_trees;
let graph_data_aspern_publicstops;
let graph_data_shops;

//define colors for graphs for each layer
//if len is 1, we have only one color for the graph
//if not, we have more colors
const graph_colors_aspern_blocks={'green area':
                '#60c36c',
                'other sealed area':
                '#856666',
                'buildings':
                '#ad949e',
                'construction site':
                '#808080',
                'water':
                '#0080FF'};
const graph_colors_aspern_landuse = {'recreation & leisure facilities':
                '#88db35',
                'business uses':
                '#e2d4c0',
                'water':
                '#60c8c5',
                'industrial & commercial uses':
                '#de8d24',
                'agriculture':
                '#8baf76',
                'natural area':
                '#bce48b',
                'social infrastructure':
                '#c4bcef',
                'technical infrastructure':
                '#c2d0a1',
                'other transportation uses':
                '#a8cfc6',
                'residential use':
                '#d9bdc6',
                'road space':
                '#d2e0c5'};
const graph_colors_aspern_roads = {'municipal road':
                '#FFFF66',
                'state main road':
                '#FF9933',
                'main road':
                '#a117c7'};
const graph_colors_aspern_publiclines = {'astax':
                '#CC0000',
                'regional bus':
                '#FF8000',
                'bus':
                '#FFFF00',
                'rapid transit and regional train':
                '#00FF00',
                'astax':
                '#00FFFF',
                'night bus':
                '#0000FF',
                'night bus':
                '#FF33FF',
                'subway':
                '#FF3399'};
const graph_colors_aspern_trees = '#009900';
const graph_colors_aspern_publicstops = {'astax':
                '#CC0000',
                'regional bus':
                '#FF8000',
                'bus':
                '#FFFF00',
                'rapid transit and regional train':
                '#00FF00',
                'astax':
                '#00FFFF',
                'night bus':
                '#0000FF',
                'night bus':
                '#FF33FF',
                'subway':
                '#FF3399'};
const graph_colors_shops = 'rgba(0,0,5,0.34)';
const graph_colors_zoning = {'recreation area':
                '#774c43',
                'mixed developement':
                '#8B4513',
                 'business developement area':
                '#D2691E',
                'commercial district':
                '#CD853F',
                'industrial area':
                '#F4A460',
                'protected area':
                '#DEB887',
                'residential area':
                '#FFE4B5'};
const graph_colors_shannon_index = '#811515';


// const file_path = ["../data/final/aspern_blocks_final.geojson", "../data/final/aspern_landcover_final.geojson", "../data/final/aspern_bkmBlocks.geojson",  "../data/final/aspern_roads.geojson", "../data/final/aspern_publiclines.geojson", "../data/final/aspern_trees_blocks.geojson", "../data/final/aspern_publicstops.geojson", "../data/final/shops.geojson"]
const file_path = ["blocks", "landcover", "bkmBlocks",  "roads", "publiclines", "trees", "publicstops", "shops"]


//..............open all files...............//
cnt = 0, xmlhttp = new XMLHttpRequest(), method = "GET";
function getXml() {
  xmlhttp.open(method, file_path[cnt], true);
  xmlhttp.onreadystatechange = async function() {
    if (xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {
        try {
            const json_response = JSON.parse(this.responseText);
            console.log(JSON.parse(this.responseText).name);
            switch(json_response.name){
                case 'aspern_blocks_final':
                    data= json_response;
                    data_aspern_blocks = json_response;
                    original_data_aspern_blocks = json_response;
                    load_layer_aspern_landuse()
                    load_layer_zoning()
                    load_layer_osr()
                    load_layer_green_area()
                    load_layer_max_height()


                    graph_data_aspern_blocks = await getGraphData(data_aspern_blocks, 'main_cover');
                    console.log('blocks', graph_data_aspern_blocks);

                    graph_data_aspern_landuse = await getGraphData(data_aspern_blocks, 'landuse');
                    console.log('landuse', graph_data_aspern_landuse);

                    graph_data_zoning = await getGraphData(data_aspern_blocks, 'zoning')
                    console.log('zoning', graph_data_zoning);

                    break;
                case 'aspern_landcover_final':
                    data_aspern_landcover = json_response;
                    original_data_aspern_landcover = json_response;
                    load_layer_aspern_blocks_landcover()

                    break;
                case 'aspern_bkmBlocks':
                    data_aspern_bkmBlocks = json_response;
                    original_data_aspern_bkmBlocks = json_response;
                    load_layer_aspern_bkmBlocks()
                    break;
                case 'aspern_roads':
                    data_aspern_roads = json_response;
                    original_data_aspern_roads = json_response;
                    load_layer_aspern_roads()

                    graph_data_aspern_roads = await getGraphData(data_aspern_roads, 'category');
                    console.log('roads', graph_data_aspern_roads);

                    break;
                case 'aspern_publiclines':
                    data_aspern_publiclines = json_response;
                    original_data_aspern_publiclines = json_response;
                    load_layer_aspern_publiclines()

                    graph_data_aspern_publiclines = await getGraphData(data_aspern_publiclines, 'line_type');
                    console.log('pub lines', graph_data_aspern_publiclines);

                    break;
                case 'aspern_trees_blocks':
                    data_aspern_trees = json_response;
                    original_data_aspern_trees = json_response;
                    load_layer_aspern_trees()

                    graph_data_aspern_trees = await getGraphData(data_aspern_trees, 'species');
                    console.log('trees', graph_data_aspern_trees);

                    break;
                case 'aspern_publicstops':
                    data_aspern_publicstops = json_response;
                    original_data_aspern_publicstops = json_response;
                    load_layer_aspern_publicstops()

                    graph_data_aspern_publicstops = await getGraphData(data_aspern_publicstops, 'line_type');
                    console.log('pub stops', graph_data_aspern_publicstops);

                    break;
                case 'shops':
                    data_shops = json_response;
                    original_data_shops = json_response;

                    graph_data_shops = await getGraphData(data_shops, 'shop');
                    console.log('shops', graph_data_shops);

                    load_layer_shops()


                    // switch the layers order
                    // we put the 3d buildings layer to be above the others
                    index_landuse = getKeyByValue(map.style._order, 'layer_aspern_publicstops');
                    index_bkm = getKeyByValue(map.style._order, 'layer_aspern_bkmBlocks');
                    map.style._order[index_bkm] = 'layer_aspern_publicstops';
                    map.style._order[index_landuse] = 'layer_aspern_bkmBlocks';
                    break;
            }
        }
        catch (error) {
            console.log('Error parsing JSON:', error, data);
        }
      cnt++;
      if (cnt < file_path.length) getXml(); // call again
    }
  };
  xmlhttp.send();
}

async function getGraphData(data, prop){
    const query = await fetch('/graph/', { method: 'POST', body: JSON.stringify({'data':data, 'prop': prop})});
    console.log('graph response: ',await query)
    const response = await query.json();
    console.log('api graph 2  response: ', response)
    return response
}

function create_graph(response, layer_id, graph_colors){
    console.log('graph creation');

    graph_elem = document.getElementById('graph_'+layer_id);
    layout= {
            height : 350,
            width : 300,
         margin: {
            l: 0,
          },
        };
    var x = response.chartData[0].chartBinsLabels;
    var y = response.chartData[0].chartValues;

    //display the appropriate colors
    let mar ={};
    if(typeof graph_colors == 'string'){
        mar = {color: graph_colors};
    }
    else{ // it is an object
        let list_colors=[];
        for (let label of x){
            list_colors.push(graph_colors[label])
        }
        mar={'color': list_colors};
    }
    console.log('marker: ', mar);


        if(response.chartData[0].chartType == 'histogram'){
            console.log('histogram');

            console.log('labels: ', x);
            console.log('values: ', y);
            var grdata = [
                  {
                    histfunc: "sum",
                    y: y,
                    x: x,
                    type: "histogram",
                      marker: mar,
                  }]
        }
        else if(response.chartData[0].chartType == 'pieChart'){
            consoloe.log('pie chart')
            console.log('labels: ', response.chartData[0].chartBinsLabels);
            console.log('values: ', response.chartData[0].chartValues);
            var grdata = [
                {
                    label: x,
                    values: y,
                    type: 'pie',
                    marker: mar,
                }
                ];
        }
        console.log('grdata: ', grdata);


    Plotly.newPlot(graph_elem, grdata, layout);
}


// navigation control
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-left')

//scale control
map.addControl(new mapboxgl.ScaleControl(), 'bottom-right');


function load_layer_aspern_bkmBlocks(){
    map.addLayer(
    {
        'id': 'layer_aspern_bkmBlocks',
        'source': {
            type: 'geojson',
            data: data_aspern_bkmBlocks
            },
        'type': 'fill-extrusion',
        'paint': {
        'fill-extrusion-color': '#aaa',
        // Use an 'interpolate' expression to
        // add a smooth transition effect to
        // the buildings as the user zooms in.
        'fill-extrusion-height': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15,
        0,
        15.05,
        ['to-number', ['get', 'height']]
        ],
        'fill-extrusion-base': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15,
        0,
        15.05,
        ['get', 'min_height']
        ],
        'fill-extrusion-opacity': 0.6
        },
        'layout': {
                'visibility': 'none'
        },
    });
}

function load_layer_aspern_landuse(){
     map.addLayer(
      {
        'id': 'layer_aspern_landuse',
        'type': 'fill',
        'source': {
            type: 'geojson',
            data: data_aspern_blocks
            },
        'paint': {

        'fill-color': [
                'match',
                ['get', 'landuse'],
                'recreation & leisure facilities',
                '#88db35',
                'business uses',
                '#e2d4c0',
                'water',
                '#60c8c5',
                'industrial & commercial uses',
                '#de8d24',
                'agriculture',
                '#8baf76',
                'natural area',
                '#bce48b',
                'social infrastructure',
                '#c4bcef',
                'technical infrastructure',
                '#c2d0a1',
                'other transportation uses',
                '#a8cfc6',
                'residential use',
                '#d9bdc6',
                'road space',
                '#d2e0c5',

                '#000000' // any other store type
              ]
        },
        'layout': {
                'visibility': 'none'
        },
      });
}

function load_layer_aspern_roads(){
      map.addLayer(
      {
        'id': 'layer_aspern_roads',
        'type': 'line',
        'source': {
            type: 'geojson',
            data: data_aspern_roads
            },
        'paint': {

            'line-color': [
                'match',
                ['get', 'category_code'],
                'G',
                '#FFFF66',
                'L',
                '#FF9933',
                'B',
                '#a117c7',
                '#000000' // any other store type
            ],
        },
        'layout': {
                'visibility': 'none'
        },
      });
}

function load_layer_aspern_publiclines(){
    map.addLayer(
      {
        'id': 'layer_aspern_publiclines',
        'type': 'line',
        'source': {
            type: 'geojson',
            data: data_aspern_publiclines
            },
        'paint': {
            'line-color': [

                'match',
                ['get', 'line_type_code'],
                '13',
                '#CC0000',
                '3',
                '#FF8000',
                '2',
                '#FFFF00',
                '5',
                '#00FF00',
                '9',
                '#00FFFF',
                '10',
                '#0000FF',
                '11',
                '#FF33FF',
                '4',
                '#FF3399',

                '#000000' // any other store type
            ],
        },
        'layout': {
                'visibility': 'none'
        },
      });
}

function load_layer_aspern_trees(){
    // map.addLayer(
    //   {
    //     'id': 'layer_aspern_trees',
    //     'type': 'circle',
    //     'source': {
    //         type: 'geojson',
    //         data: data_aspern_trees
    //         },
    //     'paint': {
    //         'circle-color': [
    //
    //             'match',
    //             ['to-string', ['get', 'height_code']],
    //             '0',
    //             '#99FF99',
    //             '1',
    //             '#66FF66',
    //             '2',
    //             '#33FF33',
    //             '3',
    //             '#00CC00',
    //             '4',
    //             '#00CC00',
    //             '5',
    //             '#009900',
    //
    //             '#000000' // any other store type
    //         ],
    //     },
    //     'layout': {
    //             'visibility': 'none'
    //     },
    //   });

    map.loadImage('https://th.bing.com/th/id/R.5c1a39945842274c34d82674ffced06c?rik=Lu%2b8gyKnJA1ymQ&riu=http%3a%2f%2fwww.clker.com%2fcliparts%2fq%2fb%2fG%2fE%2fV%2fD%2fgrey-tree-hi.png&ehk=DklSEInlNHzVRdXIy5Eh0YwXFpVqjyg6mg7%2fdlnVDac%3d&risl=&pid=ImgRaw&r=0', (error, image) => {
          if (error) throw error;
          map.addImage('tree-icon', image, { 'sdf': true });

          map.addLayer({
            'id': 'layer_aspern_trees',
            // 'type': 'circle',
            'type': 'symbol',
            'source': {
                type: 'geojson',
                data: data_aspern_trees
                },
            'paint': {
                'icon-color': [

                    'match',
                    ['to-string', ['get', 'height_code']],
                    '0',
                    '#99FF99',
                    '1',
                    '#66FF66',
                    '2',
                    '#33FF33',
                    '3',
                    '#00CC00',
                    '4',
                    '#00CC00',
                    '5',
                    '#009900',

                    '#000000' // any other store type
                ],
            },
            'layout': {
                    'visibility': 'none',
                    'icon-image': 'tree-icon',
                    'icon-size': 0.08
            },

            });
         });


}

function load_layer_aspern_publicstops(){
    map.addLayer(
      {
        'id': 'layer_aspern_publicstops',
        'type': 'circle',
        'source': {
            type: 'geojson',
            data: data_aspern_publicstops
            },
        'paint': {
            'circle-color': [

                'match',
                ['to-string', ['get', 'line_type_code']],
                '13',
                '#CC0000',
                '3',
                '#FF8000',
                '2',
                '#FFFF00',
                '5',
                '#00FF00',
                '9',
                '#00FFFF',
                '10',
                '#0000FF',
                '11',
                '#FF33FF',
                '4',
                '#FF3399',

                '#000000' // any other store type
            ],
        },
        'layout': {
                'visibility': 'none'
        },
      });
}

function load_layer_shops(){
    map.addLayer(
      {
        'id': 'layer_shops',
        'type': 'circle',
        'source': {
            type: 'geojson',
            data: data_shops
            },
        'paint': {
            'circle-color':

                '#000000'

        },
        'layout': {
                'visibility': 'none'
        },
      });
}

function load_index_layer(data_index){
  map.addLayer(
      {
        'id': 'layer_index',
        'type': 'fill',
        'source': {
            type: 'geojson',
            data: data_index
            },
        'paint': {

        'fill-color': [
                'case',
                  ['<=', ['to-number',  ['get', 'div_index']], 0.8],
                  '#e1aeb4',
                  ['<=', ['to-number',  ['get', 'div_index']], 1],
                  '#d3828f',
                  ['<=', ['to-number',  ['get', 'div_index']], 1.4],
                  '#d55f5f',
                  ['<=', ['to-number',  ['get', 'div_index']], 1.8],
                  '#b42f2f',
                  ['<=', ['to-number',  ['get', 'div_index']], 2.21],
                  '#8c172c',

                  '#000005'

              ]
        }
      });
}

function load_layer_aspern_blocks_landcover(){
    const zoomThreshold = 15;

    map.addLayer(
      {
        'id': 'layer_aspern_blocks',
        'type': 'fill',
        'source': {
            type: 'geojson',
            data: data_aspern_blocks
            },
        'paint': {
        'fill-color': [
                'match',
                ['get', 'main_cover'],
                'green area',
                '#60c36c',
                'other sealed area',
                '#856666',
                'buildings',
                '#ad949e',
                'construction site',
                '#808080',
                'water',
                '#0080FF',
                '#000000' // any other store type
              ]
        },
        'layout': {
                'visibility': 'none'
        },
      });


    map.addLayer(
      {
        'id': 'layer_aspern_landcover_zoom',
        'type': 'fill',
        'minzoom': zoomThreshold,
        'source': {
            type: 'geojson',
            data: data_aspern_landcover
            },
        'paint': {
        'fill-color': [
                'match',
                ['get', 'class'],
                'green area',
                '#60c36c',
                'sealed area (excluding buildings)',
                '#856666',
                'buildings',
                '#ad949e',
                'construction site',
                '#808080',
                'water body',
                '#0080FF',
                '#000000' // any other store type
              ]
        },
        'layout': {
                'visibility': 'none'
        },
      });

}

function load_layer_osr(){
    map.addLayer(
      {
        'id': 'layer_osr',
        'type': 'fill',
        'source': {
            type: 'geojson',
            data: data_aspern_blocks
            },
        'paint': {

        'fill-color': [
                'case',
                  ['<=', ['to-number',  ['get', 'OSR']], 5],
                  '#a9d6e5',
                  ['<=', ['to-number',  ['get', 'OSR']], 10],
                  '#89c2d9',
                  ['<=', ['to-number',  ['get', 'OSR']], 15],
                  '#61a5c2',
                  ['<=', ['to-number',  ['get', 'OSR']], 20],
                  '#468faf',
                  ['<=', ['to-number',  ['get', 'OSR']], 30],
                  '#2c7da0',
                  ['<=', ['to-number',  ['get', 'OSR']], 50],
                  '#2a6f97',
                  ['<=', ['to-number',  ['get', 'OSR']], 70],
                  '#014f86',
                  ['<=', ['to-number',  ['get', 'OSR']], 80],
                  '#01497c',
                  ['<=', ['to-number',  ['get', 'OSR']], 100],
                  '#013a63',
                  ['<=', ['to-number',  ['get', 'OSR']], 200],
                  '#01365b',
                  ['<=', ['to-number',  ['get', 'OSR']], 300],
                  '#022c49',
                  ['<=', ['to-number',  ['get', 'OSR']], 400],
                  '#011e31',
                  ['==', ['to-number',  ['get', 'OSR']], 0],
                  '#ede0d4',

                  '#ede0d4'

              ],

        },
        'layout': {
                'visibility': 'none'
        },
      });

}

function load_layer_zoning(){
     map.addLayer(
      {
        'id': 'layer_zoning',
        'type': 'fill',
        'source': {
            type: 'geojson',
            data: data_aspern_blocks
            },
        'paint': {
        'fill-color': [
                'match',
                ['get', 'zoning'],
                'recreation area',
                '#774c43',
                'mixed developement',
                '#8B4513',
                 'business developement area',
                '#D2691E',
                'commercial district',
                '#CD853F',
                'industrial area',
                '#F4A460',
                'protected area',
                '#DEB887',
                'residential area',
                '#FFE4B5',
                '#efdada' // any other store type
              ]
        },
        'layout': {
                'visibility': 'none'
        },
      });
}

function load_layer_green_area(){
    map.addLayer(
      {
        'id': 'layer_green_area',
        'type': 'fill',
        'source': {
            type: 'geojson',
            data: data_aspern_blocks
            },
        'paint': {

        'fill-color': [
                'case',

                  ['<=', ['to-number',  ['get', 'area_green_rel']], 10],
                  '#72de62',
                  ['<=', ['to-number',  ['get', 'area_green_rel']], 20],
                  '#6cd15c',
                  ['<=', ['to-number',  ['get', 'area_green_rel']], 30],
                  '#66c758',
                  ['<=', ['to-number',  ['get', 'area_green_rel']], 40],
                  '#62bf54',
                  ['<=', ['to-number',  ['get', 'area_green_rel']], 50],
                  '#5eb851',
                  ['<=', ['to-number',  ['get', 'area_green_rel']], 60],
                  '#57a84a',
                  ['<=', ['to-number',  ['get', 'area_green_rel']], 70],
                  '#4f9943',
                  ['<=', ['to-number',  ['get', 'area_green_rel']], 80],
                  '#478a3d',
                  ['<=', ['to-number',  ['get', 'area_green_rel']], 90],
                  '#3e7835',
                  ['<=', ['to-number',  ['get', 'area_green_rel']], 120],
                  '#34662d',
                  ['==', ['to-number',  ['get', 'area_green_rel']], 0],
                 '#dbf0a8',

                  '#dbf0a8'
              ]

        },
        'layout': {
                'visibility': 'none'
        },
      });
}

function load_layer_max_height(){
    map.addLayer(
      {
        'id': 'layer_max_height',
        'type': 'fill',
        'source': {
            type: 'geojson',
            data: data_aspern_blocks
            },
        'paint': {

        'fill-color': [
                'case',
                  ['<=', ['to-number',  ['get', 'max_height']], 10],
                  '#edc4b3',
                  ['<=', ['to-number',  ['get', 'max_height']], 20],
                  '#e6b8a2',
                  ['<=', ['to-number',  ['get', 'max_height']], 30],
                  '#deab90',
                  ['<=', ['to-number',  ['get', 'max_height']], 40],
                  '#d69f7e',
                  ['<=', ['to-number',  ['get', 'max_height']], 50],
                  '#cd9777',
                  ['<=', ['to-number',  ['get', 'max_height']], 60],
                  '#c38e70',
                  ['<=', ['to-number',  ['get', 'max_height']], 70],
                  '#b07d62',
                  ['<=', ['to-number',  ['get', 'max_height']], 80],
                  '#9d6b53',
                  ['<=', ['to-number',  ['get', 'max_height']], 100],
                  '#8a5a44',
                  ['==', ['to-number',  ['get', 'max_height']], 0],
                  '#ede0d4',

                  '#ede0d4'

              ],

        },
        'layout': {
                'visibility': 'none'
        },
      });
}

function load_layer_accessibility(data, poi){
  map.addLayer(
      {
        'id': 'layer_accessibility_fill',
        'type': 'fill',
        'source': {
            type: 'geojson',
            data: data
            },
        'paint': {

        'fill-color': '#8c172c',
        'fill-opacity': 0.5
        },
      });

  map.addLayer(
      {
        'id': 'layer_accessibility_line',
        'type': 'line',
        'source': {
            type: 'geojson',
            data: data
            },
        'paint': {

        'line-color': 'rgba(56,2,12,0.91)'
        }
      });

  map.addLayer(
      {
        'id': 'layer_accessibility_points',
        'type': 'circle',
        'source': {
            type: 'geojson',
            data: poi
            },
        'paint': {

        'circle-color': 'rgb(0,0,5)'
        }
      });

  map.addLayer(
      {
        'id': 'layer_aspern_blocks_accessibility',
        'type': 'fill',
        'source': {
            type: 'geojson',
            data: data_aspern_blocks
            },
        'paint': {
            'fill-color': '#C0C0C0',
            'fill-opacity': 0.6
        },
      });

    // switch the layers order so that the 3d buildings layer is on top of the landuse layer
    index_attr = getKeyByValue(map.style._order, 'layer_aspern_blocks_accessibility');
    index_pol = getKeyByValue(map.style._order, 'layer_accessibility_fill');
    map.style._order[index_attr] = 'layer_accessibility_fill';
    map.style._order[index_pol] = 'layer_aspern_blocks_accessibility';

}


let data_shannon_index;
// sending the data for index calculations and receiving the index data
async function calc_IndexData(){

    // the spinner on the card
    c = $('#shannon_content .card-title')[0];
    c.innerHTML = 'Shannon Index  <div class="spinner-border spinner-border-sm" role="status" style="display: inline-block;">\n      ' +
        '<span class="visually-hidden">Loading...</span>\n    </div>'

    //the spinner on the button
    $('#shannon label')[0].innerHTML= 'Shannon  <div class="spinner-border spinner-border-sm" role="status" style="display: inline-block;">\n      ' +
        '<span class="visually-hidden">Loading...</span>\n    </div>';


    console.log('function for sending the data');

    const query = await fetch('/index/', { method: 'POST', body: JSON.stringify(data_aspern_blocks)});
    const data = await query.json();
    console.log(data);
    data_shannon_index = data;

    // make the section bigger so that the graph can fit
    const s= $('#shannon_content')[0];
    s.style.height = 'fit-content';

    let graph_data = await getGraphData(data_shannon_index, 'div_index');
    create_graph(graph_data, 'shannon', graph_colors_shannon_index);


    if( map.getLayer('layer_index')){
        map.getSource('layer_index').setData(data_shannon_index);
        map.setLayoutProperty(
                    'layer_index',
                    'visibility',
                    'visible'
                );
     }
    else {
        load_index_layer(data_shannon_index);
    }

    c.innerHTML='Shannon Index'
    $('#shannon label')[0].innerHTML= 'Shannon';


}

let buffer_data;
let blocks_data
async function calc_accessibility(dist, poi, layer){

    // the spinner on the card
    c = $('#accessibility_content .card-title')[0];
    c.innerHTML = 'Accessibility  <div class="spinner-border spinner-border-sm" role="status" style="display: inline-block;">\n      ' +
        '<span class="visually-hidden">Loading...</span>\n    </div>'


    const poi_data = poi == 'transport' ? data_aspern_publicstops : data_shops;

    console.log('function for sending the accessibility data');

    const query = await fetch('/accessibility/', { method: 'POST', body: JSON.stringify({'poi':poi_data, 'dist':dist})});
    const data = await query.json();
    console.log('data', data);
    console.log(typeof data['blocks'])
    buffer_data = JSON.parse(data['buffer']);
    blocks_data =JSON.parse(data['blocks']);


    let layer_data;
    if (layer == 'polygons'){
        layer_data = blocks_data;
    }
    else{
        layer_data = buffer_data
    }


    if( map.getLayer('layer_accessibility_fill')){
        map.getSource('layer_accessibility_fill').setData(layer_data);
        map.setLayoutProperty(
                    'layer_accessibility_fill',
                    'visibility',
                    'visible'
                );
        map.getSource('layer_accessibility_line').setData(layer_data);
        map.setLayoutProperty(
                    'layer_accessibility_line',
                    'visibility',
                    'visible'
                );
        map.getSource('layer_accessibility_points').setData(poi_data);
        map.setLayoutProperty(
                    'layer_accessibility_points',
                    'visibility',
                    'visible'
                );

         map.setLayoutProperty(
                    'layer_aspern_blocks_accessibility',
                    'visibility',
                    'visible'
                );
     }
    else {
        load_layer_accessibility(layer_data, poi_data);
    }

    c.innerHTML='Accessibility';

}


async function calc_graph_data(graph_type, data_type, data, prop){
    const query = await fetch('/graph/', { method: 'POST', body: JSON.stringify({'graph_type':graph_type, 'data_type':data_type, 'data': data, 'prop': prop})});
    const response = await query.json();
    console.log('api graph response: ', response)
    return response
}

 map.on('style.load', () => {
      map.setFog({}); // Set the default atmosphere style
  });


  map.on('load', ()=>{
    getXml() // load the local geojson files

     const recalc_index_button = document.getElementById('recalculate_index');
        // trigger the function that send the data to the py script
        recalc_index_button.onclick = (function(){
            console.log('recalc index button clicked');
            calc_IndexData();
            //$('#index')[0].click();
            $('#index')[0].checked = true;
        });

          // get the button for sending the data for the accessibility calculation
        const calc_accessibility_button = document.getElementById('calc_accessibility');
        // trigger the function that send the data to the py script
        calc_accessibility_button.onclick = (function(){
            console.log('recalc index button clicked');
            const dist = $('.card-body input')[0].value;
            let poi;
            if ($('.card-body form')[1][0].checked){
                poi = 'transport'
            }
            else{
                poi = 'shops'
            }

            let layer;
            if ($('.card-body form')[2][0].checked){
                layer = 'polygons'
            }
            else{
                layer = 'buffer'
            }

            calc_accessibility(dist, poi, layer);


        });


        // main layers ///////////////////////////////////////////
        const blocks_button =$('#blocks_arrow')[0];
        blocks_button.onclick = function (e){
            if ($('#blocks_content')[0].style.display == 'none')
            {
                $('#blocks_content').css('display', 'block');

            }else {
                $('#blocks_content')[0].style.display = 'none'

            }
        }
        const close_blocks_button =$('#btn-close-blocks')[0];
        close_blocks_button.onclick = function (e){
            $('#blocks_content').css('display', 'none');

        }

        const landuse_button =$('#landuse_arrow')[0];
        landuse_button.onclick = function (e){
            if ($('#landuse_content')[0].style.display == 'none')
            {
                $('#landuse_content').css('display', 'block');

            }else {
                $('#landuse_content')[0].style.display = 'none'

            }
        }
        const close_landuse_button =$('#btn-close-landuse')[0];
        close_landuse_button.onclick = function (e){
            $('#landuse_content').css('display', 'none');

        }

        const zoning_button =$('#zoning_arrow')[0];
        zoning_button.onclick = function (e){
            if ($('#zoning_content')[0].style.display == 'none')
            {
                $('#zoning_content').css('display', 'block');

            }else {
                $('#zoning_content')[0].style.display = 'none'

            }
        }
        const close_zoning_button =$('#btn-close-zoning')[0];
        close_zoning_button.onclick = function (e){
            $('#zoning_content').css('display', 'none');

        }

        const streets_button =$('#streets_arrow')[0];
        streets_button.onclick = function (e){
            if ($('#streets_content')[0].style.display == 'none')
            {
                $('#streets_content').css('display', 'block');

            }else {
                $('#streets_content')[0].style.display = 'none'

            }
        }
        const close_streets_button =$('#btn-close-streets')[0];
        close_streets_button.onclick = function (e){
            $('#streets_content').css('display', 'none');

        }

        const public_lines_button =$('#public_lines_arrow')[0];
        public_lines_button.onclick = function (e){
            if ($('#public_lines_content')[0].style.display == 'none')
            {
                $('#public_lines_content').css('display', 'block');

            }else {
                $('#public_lines_content')[0].style.display = 'none'

            }
        }
        const close_public_line_button =$('#btn-close-public_lines')[0];
        close_public_line_button.onclick = function (e){
            $('#public_lines_content').css('display', 'none');

        }

        const shops_button =$('#shops_arrow')[0];
        shops_button.onclick = function (e){
            if ($('#shops_content')[0].style.display == 'none')
            {
                $('#shops_content').css('display', 'block');

            }else {
                $('#shops_content')[0].style.display = 'none'

            }
        }
        const close_shops_button =$('#btn-close-shops')[0];
        close_shops_button.onclick = function (e){
            $('#shops_content').css('display', 'none');

        }

        const trees_button =$('#trees_arrow')[0];
        trees_button.onclick = function (e){
            if ($('#trees_content')[0].style.display == 'none')
            {
                $('#trees_content').css('display', 'block');

            }else {
                $('#trees_content')[0].style.display = 'none'

            }
        }
        const close_trees_button =$('#btn-close-trees')[0];
        close_trees_button.onclick = function (e){
            $('#trees_content').css('display', 'none');

        }

        const public_stations_button =$('#public_stations_arrow')[0];
        public_stations_button.onclick = function (e){
            if ($('#public_stations_content')[0].style.display == 'none')
            {
                $('#public_stations_content').css('display', 'block');

            }else {
                $('#public_stations_content')[0].style.display = 'none'

            }
        }
        const close_public_stations_button =$('#btn-close-public_stations')[0];
        close_public_stations_button.onclick = function (e){
            $('#public_stations_content').css('display', 'none');

        }


        const shannon_button =$('#shannon_arrow')[0];
        shannon_button.onclick = function (e){
            // show the layer and the content
            if ($('#shannon_content')[0].style.display == 'none')
            {
                $('#shannon_content').css('display', 'block');


            }else{  //hide the layer and the content
                $('#shannon_content')[0].style.display = 'none'

            }

        }
        const close_shannon_button =$('#btn-close-shannon')[0];
        close_shannon_button.onclick = function (e){
            $('#shannon_content').css('display', 'none');

        }
        const shannon_button_l =$('#index')[0];
        shannon_button_l.onclick = function (e){
            console.log('shannon button layer');
            console.log(this.checked);
            console.log(e);
            // show the layer
            if (this.checked)
            {
                if( map.getLayer('layer_index')){
                   map.setLayoutProperty(
                        'layer_index',
                        'visibility',
                        'visible'
                    );
                   console.log('make the already calculated index layer visible ')
                }else{
                    console.log('calculate index layer first time ');
                    calc_IndexData('');
                }


            }else{  //hide the layer
                if( map.getLayer('layer_index')){
                   map.setLayoutProperty(
                        'layer_index',
                        'visibility',
                        'none'
                    );
                }
            }

        }


        const green_button =$('#green_arrow')[0];
        green_button.onclick = function (e){
            if ($('#green_content')[0].style.display == 'none')
            {
                $('#green_content').css('display', 'block');

            }else {
                $('#green_content')[0].style.display = 'none'

            }
        }
        const close_green_button =$('#btn-close-green')[0];
        close_green_button.onclick = function (e){
            $('#green_content').css('display', 'none');

        }

        const osr_button =$('#osr_arrow')[0];
        osr_button.onclick = function (e){
            if ($('#osr_content')[0].style.display == 'none')
            {
                $('#osr_content').css('display', 'block');

            }else {
                $('#osr_content')[0].style.display = 'none'

            }
        }
        const close_osr_button =$('#btn-close-osr')[0];
        close_osr_button.onclick = function (e){
            $('#osr_content').css('display', 'none');

        }

        const max_height_button =$('#max_height_arrow')[0];
        max_height_button.onclick = function (e){
            if ($('#max_height_content')[0].style.display == 'none')
            {
                $('#max_height_content').css('display', 'block');

            }else {
                $('#max_height_content')[0].style.display = 'none'

            }
        }
        const close_max_height_button =$('#btn-close-max_height')[0];
        close_max_height_button.onclick = function (e){
            $('#max_height_content').css('display', 'none');

        }

        const accessibility_button =$('#accessibility_arrow')[0];
        accessibility_button.onclick = function (e){
            //open the section
            if ($('#accessibility_content')[0].style.display == 'none')
            {
                $('#accessibility_content').css('display', 'block');
                if( map.getLayer('layer_accessibility_fill')){
                   map.setLayoutProperty(
                        'layer_accessibility_fill',
                        'visibility',
                        'visible'
                    );
                   map.setLayoutProperty(
                        'layer_accessibility_line',
                        'visibility',
                        'visible'
                    );
                   map.setLayoutProperty(
                        'layer_accessibility_points',
                        'visibility',
                        'visible'
                    );
                   map.setLayoutProperty(
                        'layer_aspern_blocks_accessibility',
                        'visibility',
                        'visible'
                    );

                }
                else{
                    //at first when we open the section, we have the transportation option already checked
                    $('.card-body form')[1][0].checked=true
                    //at first when we open the section, we have the polygon layer option already checked
                    $('.card-body form')[2][0].checked=true
                }


                     $('#accessibility_layers')[0].onchange = function (e){
                       console.log(e.target.value)
                       value = e.target.value;
                       if (value == 'buffer'){
                           try {
                               map.getSource('layer_accessibility_fill').setData(buffer_data);
                               map.getSource('layer_accessibility_line').setData(buffer_data);
                           }
                           catch (e) {
                               console.log('no buffer data yet...')
                           }


                       }
                       else{
                           map.getSource('layer_accessibility_fill').setData(blocks_data);
                           map.getSource('layer_accessibility_line').setData(blocks_data);
                       }
                   }

                $('#accessibility')[0].checked = true;


            }else {
                $('#accessibility_content')[0].style.display = 'none'

            }
        }
        const close_accessibility_button =$('#btn-close-accessibility')[0];
        close_accessibility_button.onclick = function (e){
            $('#accessibility_content').css('display', 'none');

        }
        const accessibility_button_layer = $('#accessibility')[0];
        accessibility_button_layer.onclick = function (e){
            if (this.checked){
                if( map.getLayer('layer_accessibility_fill')){
                   map.setLayoutProperty(
                        'layer_accessibility_fill',
                        'visibility',
                        'visible'
                    );
                   map.setLayoutProperty(
                        'layer_accessibility_line',
                        'visibility',
                        'visible'
                    );
                   map.setLayoutProperty(
                        'layer_accessibility_points',
                        'visibility',
                        'visible'
                    );
                   map.setLayoutProperty(
                        'layer_aspern_blocks_accessibility',
                        'visibility',
                        'visible'
                    );
                }
            }else
            {
                if( map.getLayer('layer_accessibility_fill')){
                   map.setLayoutProperty(
                        'layer_accessibility_fill',
                        'visibility',
                        'none'
                    );
                   map.setLayoutProperty(
                        'layer_accessibility_line',
                        'visibility',
                        'none'
                    );
                   map.setLayoutProperty(
                        'layer_accessibility_points',
                        'visibility',
                        'none'
                    );

                   map.setLayoutProperty(
                        'layer_aspern_blocks_accessibility',
                        'visibility',
                        'none'
                    );
                }
            }
        }



        //toolbar   ///////////////////////////////////////////
        const landuse_tool_but = $('#landuse_tool_but')[0];
        landuse_tool_but.onclick =function(e) {
            console.log('landuse_tool_but clicked ');

            const initial_data = JSON.parse(JSON.stringify(map.getSource('layer_aspern_landuse')._data));


            const toolbar_content_but_group = $('#toolbar_content_but_group')[0];
            toolbar_content_but_group.innerHTML = '';
            $('#toolbar_content')[0].style.display= 'none';

            //make visible the footer
            $('#toolbar_footer')[0].style.display = 'block';
            const toolbar_footer_group = $('#toolbar_footer_group')[0];
            toolbar_footer_group.innerHTML =
                '<div class="input-group input-group-sm mb-3" style="height: 20px; visibility: hidden; display: grid; align-items: baseline;\n' +
                '    justify-items: start;"\n' +
                '    align-content: stretch;>\n' +
                '  <span class="input-group-text" style="height: 20px;" id="inputGroup-sizing-sm">Type shop</span>\n' +
                '  <input type="text" class="form-control" style="height: 20px; border-color: black; width: fit-content;" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">\n' +
                '</div>\n'+
                '<button type="button" class="btn btn-outline-success" id="save_toolbar">Save</button>\n' +
                '            <button type="button" class="btn btn-outline-danger" id="discard_toolbar">Discard</button>'

          //check landuse layer
          //uncheck other layers
          const inputs_layers = document.getElementsByClassName('input_layers');
          for (const input of inputs_layers){
              //if we find a layer that is shown on the map
            if (input.id != 'aspern_landuse' && input.checked){
                input.click()
              }
            if (input.id == 'aspern_landuse'&& input.checked==false){
                input.click()
            }
          }

          // save button
          const save = $('#save_toolbar')[0];
          save.onclick = async function (e){
              console.log('save clicked');

              // deactivate the landuse layer and the toolbar
              $('#aspern_landuse')[0].click();
              $('#landuse_tool_but')[0].checked = false;
              $('#toolbar_footer')[0].style.display = 'none';


              //calculate graph data again
              graph_data_aspern_landuse = await getGraphData(data_aspern_blocks, 'landuse');
              console.log('landuse new graph data', graph_data_aspern_landuse);
              create_graph(graph_data_aspern_landuse, 'aspern_landuse', graph_colors_aspern_landuse);

          }
          //discard button
          const discard = $('#discard_toolbar')[0];
          discard.onclick = function (e) {
              console.log('discard clicked');

              // not saving the changes
              // the data is back to the state that was when the user clicked on the landuse tool button
              data_aspern_blocks = JSON.parse(JSON.stringify(initial_data));
              map.getSource('layer_aspern_landuse').setData(initial_data);

              // deactivate the landuse layer and the toolbar
              $('#aspern_landuse')[0].click();
              $('#landuse_tool_but')[0].checked = false;
              $('#toolbar_footer')[0].style.display = 'none';

          }


        }

        const poi_tool_but = $('#poi_tool_but')[0];
        poi_tool_but.onclick =function(e) {
            //make visible the content
            $('#toolbar_content')[0].style.display= 'block';
            //the footer still not visible until shops button clicked
            $('#toolbar_footer')[0].style.display= 'none';



            const toolbar_content_but_group = $('#toolbar_content_but_group')[0];
            console.log('poi_tool_but clicked ');
            toolbar_content_but_group.innerHTML =
                '<button type="button" id="shop_tool" class="btn btn-secondary"><i class="material-icons">shopping_basket</i>shop</button>\n' +
            '      <button type="button" id="school_tools" class="btn btn-secondary"><i class="material-icons">school</i>school</button>';


            // https://github.com/mapbox/mapbox-gl-draw/blob/main/docs/API.md
            // add draw control
                 const draw = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    point: true,
                    trash: true
                },
                //userProperties: true,
                });


          $('#shop_tool')[0].onclick = function(e){
           //check shops layer
          // uncheck other layers
          const inputs_layers = document.getElementsByClassName('input_layers');
          for (const input of inputs_layers){
              //if we find a layer that is shown on the map
            if (input.id != 'shops' && input.checked){
                input.click()
              }
            if (input.id == 'shops' && input.checked==false){
                input.click()
            }
          }

              //make visible the footer
            $('#toolbar_footer')[0].style.display = 'block';
            const toolbar_footer_group = $('#toolbar_footer_group')[0];
            toolbar_footer_group.innerHTML =
                '<div class="input-group input-group-sm mb-3" style="height: 20px; visibility: hidden; display: grid; align-items: baseline;\n' +
                '    justify-items: start;"\n' +
                '    align-content: stretch;>\n' +
                '  <span class="input-group-text" style="height: 20px;" id="inputGroup-sizing-sm">Type shop</span>\n' +
                '  <input type="text" class="form-control" style="height: 20px; border-color: black; width: fit-content;" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">\n' +
                '</div>\n'+
                '<button type="button" class="btn btn-outline-success" id="save_toolbar">Save</button>\n' +
                '            <button type="button" class="btn btn-outline-danger" id="discard_toolbar">Discard</button>'


              //the user can enter the shop type  and see the control after clicking on the shops button
              $('#toolbar_footer_group .input-group')[0].style.visibility = 'visible';


              map.addControl(draw);

              map.on('draw.create', updateArea);
              map.on('draw.delete', updateArea);
              map.on('draw.update', updateArea);


              //while in drawing mode, the landuse, transit and school(from poi) buttons are disabled
              $('#landuse_tool_but')[0].disabled = true;
              $('#transit_tool_but')[0].disabled = true;
              $('#school_tools')[0].disabled = true;


              var new_points = []; // list with all new added points
              function updateArea(e) {
                  console.log('draw e: ', e);

                  //if we add a point to the map
                  if (e.type == 'draw.create') {
                      console.log('draw create');
                      console.log(e.features[0].id);

                      // define the point's attributes
                      let point = {"type": "", "properties": "", "geometry": ""};
                      point.type = e.features[0].type;
                      point.properties = {"osm_id": e.features[0].id, "shop": $('#toolbar_footer_group input')[0].value}
                      point.geometry = e.features[0].geometry;

                      // add the with point to the list
                      new_points.push(point);

                      console.log(point);
                      console.log(new_points);


                  }
                  //if we delete a drawn point
                  else
                      if (e.type == 'draw.delete') {
                      console.log('draw delete');
                      delete_point_id = e.features[0].id;
                      for (let i = 0; i < new_points.length; i++) {
                          // if we found the point that we added (by comparing ids)
                          if (new_points[i].properties.osm_id == delete_point_id) {
                              //delete the point from the shops dictionary by its id
                              new_points.splice(i, 1);
                              break;
                          }


                      }
                  } else
                      if (e.type == 'draw.update') {
                      console.log('draw update');
                      update_point_id = e.features[0].id;
                      for (feature of new_points) {
                          //console.log(feature.properties.osm_id);
                          if (feature.properties.osm_id == update_point_id) {
                              //update the point's coordinates from the shops dictionary by its id
                              console.log(feature.geometry.coordinates)
                              feature.geometry.coordinates = e.features[0].geometry.coordinates;
                              console.log(feature.geometry.coordinates)
                              break;
                          }

                      }


                  }
              }

              const save = $('#save_toolbar')[0];
              save.onclick = async function (e){
                  console.log('save clicked');
                  //$('#shops')[0].click();
                  $('#poi_tool_but')[0].checked = false;
                  $('#toolbar_footer')[0].style.display = 'none';
                  $('#toolbar_content')[0].style.display= 'none';

                  // add new point to the shops data
                  console.log('new points: ', new_points);
                  data_shops.features = JSON.parse(JSON.stringify(data_shops.features.concat(new_points)));
                  console.log(data_shops);
                  //update layer data
                  map.getSource('layer_shops').setData(data_shops);

                  map.removeControl(draw);

                  //we make the disabled buttons active again after we finished drawing
                   $('#landuse_tool_but')[0].disabled = false;
                   $('#transit_tool_but')[0].disabled = false;
                   $('#school_tools')[0].disabled = false;

                   //update graph
                   graph_data_shops = await getGraphData(data_shops, 'shop');
                  console.log('landuse new graph data', graph_data_shops);
                  create_graph(graph_data_shops, 'shops', graph_colors_shops);



              }
              //discard button
              const discard = $('#discard_toolbar')[0];
              discard.onclick = function (e) {
                  console.log('discard clicked');

                  $('#shops')[0].click();
                  $('#poi_tool_but')[0].checked = false;
                  $('#toolbar_footer')[0].style.display = 'none';
                  $('#toolbar_content')[0].style.display= 'none';
                  map.removeControl(draw);

                  //we make the disabled buttons active again after we finished drawing
                   $('#landuse_tool_but')[0].disabled = false;
                   $('#transit_tool_but')[0].disabled = false;
                   $('#school_tools')[0].disabled = false;

              }

          }

        }

        const transit_tool_but = $('#transit_tool_but')[0];
        transit_tool_but.onclick =function(e) {
            //make visible the content
            $('#toolbar_content')[0].style.display= 'block';
            //make visible the footer
            $('#toolbar_footer')[0].style.display= 'block';


            const toolbar_content_but_group = $('#toolbar_content_but_group')[0];
            console.log('transit_tool_but clicked ');
            toolbar_content_but_group.innerHTML =
                '<button type="button" id="bus_tool" class="btn btn-secondary"><i class="material-icons">directions_bus</i>bus</button>\n' +
                '<button type="button" id="train_tool" class="btn btn-secondary"><i class="material-icons">directions_railway</i>train</button>\n' +
            '      <button type="button" id="subway_tools" class="btn btn-secondary" style="width: 160px"><i class="material-icons">directions_subway</i>subway</button>';



            //make visible the footer
            $('#toolbar_footer')[0].style.display = 'block';
            const toolbar_footer_group = $('#toolbar_footer_group')[0];
            toolbar_footer_group.innerHTML =
                '<div class="input-group input-group-sm mb-3" style="height: 20px; visibility: hidden; display: grid; align-items: baseline;\n' +
                '    justify-items: start;"\n' +
                '    align-content: stretch;>\n' +
                '  <span class="input-group-text" style="height: 20px;" id="inputGroup-sizing-sm">Type shop</span>\n' +
                '  <input type="text" class="form-control" style="height: 20px; border-color: black; width: fit-content;" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">\n' +
                '</div>\n'+
                '<button type="button" class="btn btn-outline-success" id="save_toolbar">Save</button>\n' +
                '            <button type="button" class="btn btn-outline-danger" id="discard_toolbar">Discard</button>';


          //check public stops and lines layer
          //uncheck other layers
          const inputs_layers = document.getElementsByClassName('input_layers');
          for (const input of inputs_layers){
              //if we find a layer that is shown on the map
            if ((input.id != 'aspern_publiclines' || input.id != 'aspern_publicstops') && input.checked){
                input.click()
              }
            if ((input.id == 'aspern_publiclines' || input.id == 'aspern_publicstops') && input.checked==false){
                input.click()
            }
          }

          // save button
          const save = $('#save_toolbar')[0];
          save.onclick =
              function (e){
              console.log('save clicked');
              // deactivate transit layers and toolbar
              $('#aspern_publiclines')[0].click();
              $('#aspern_publicstops')[0].click();
              $('#transit_tool_but')[0].checked = false;
              $('#toolbar_footer')[0].style.display = 'none';
              $('#toolbar_content')[0].style.display = 'none';
          }
          //discard button
          const discard = $('#discard_toolbar')[0];
          discard.onclick =
              function (e) {
              console.log('discard clicked');

              // deactivate transit layers and toolbar
              $('#aspern_publiclines')[0].click();
              $('#aspern_publicstops')[0].click();
              $('#transit_tool_but')[0].checked = false;
              $('#toolbar_footer')[0].style.display = 'none';
              $('#toolbar_content')[0].style.display = 'none';

          }



        }


         const layer_inputs = document.getElementsByClassName('form-check-input');

    for(const layer_input of layer_inputs){
        layer_input.onclick = function(e){

            // store the html input element id that displays each layer
            // with this id we create the different variables or functions for each layer
            let check_id = layer_input.id;

            // store the clicked layer name
            var clickedLayer = 'layer_'+check_id;

            console.log('check id: ', check_id)
            console.log('cliked layer: ', clickedLayer)


            //.....calculate the graph.....//
            try{
                create_graph(eval('graph_data_'+check_id), check_id, eval('graph_colors_'+check_id));

            }
            catch(error){
                console.log(error);
            }

            //..... dealing with the layers .....//
            if(!(layer_input.checked)){
                console.log('unclicked the layer')

                // we also hide the 2nd layer with more detailed blocks
                // that's shown only at certain zoom level
                  if (check_id == 'aspern_blocks'){
                    map.setLayoutProperty(
                        'layer_aspern_landcover_zoom',
                        'visibility',
                        'none'
                    );
                }
                 // we hide the layer clicked with the check id
                map.setLayoutProperty(
                    clickedLayer,
                    'visibility',
                    'none'
                );

                // if we unlick the 3d building we set a pitch normal
                if(clickedLayer == 'layer_aspern_bkmBlocks'){
                    map.setPitch(0);
                }

            }
            //if we click a layer
            else
            {

                console.log('clicked the layer')
                // if we show the 3d building we set a pitch to the map
                if(clickedLayer == 'layer_aspern_bkmBlocks'){
                    map.setPitch(45);
                }


                // we also show the detailed blocks layer that is visible when zooming in
                if (check_id == 'aspern_blocks'){
                map.setLayoutProperty(
                        'layer_aspern_landcover_zoom',
                        'visibility',
                        'visible'
                    );
                }

                // we make visible the layer with the id that we clicked
                map.setLayoutProperty(
                    clickedLayer,
                    'visibility',
                    'visible'
                );

            }

            map.on('mousemove', clickedLayer, (e) => {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', clickedLayer, (e) => {
                map.getCanvas().style.cursor = '';
            });

            map.on('click', clickedLayer, (e)=>{

                console.log('lngLat: ', e.lngLat)

                // zoom in on the clicked feature
                map.flyTo({center: e.lngLat, zoom:16});

                // store the feature we clicked on
                const clicked_feature = e.features[0];
                console.log('feature clicked: ', clicked_feature)

                // having a variable which stores the id of the layer
                let id_property;
                // store the id (its value) of the clicked feature
                let value_clicked_feature_id;

                // assign values for the id name and its value depending on the layer clicked
                // we use these 2 variables when we want to change some properties
                switch(clickedLayer){
                    case 'layer_aspern_blocks':
                        id_property= 'OBJECTID';//'id';
                        value_clicked_feature_id = clicked_feature.properties.OBJECTID;
                        break;
                    case 'layer_aspern_landcover':
                        id_property = 'OBJECTID';//'blockID';
                        value_clicked_feature_id = clicked_feature.properties.OBJECTID;
                        break;
                    case 'layer_aspern_bkmBlocks':
                        id_property= 'FMZK_ID';
                        value_clicked_feature_id = clicked_feature.properties.FMZK_ID;
                        break;
                    case 'layer_aspern_landuse':
                        id_property= 'OBJECTID';
                        value_clicked_feature_id = clicked_feature.properties.OBJECTID;
                        break;
                    case 'layer_aspern_roads':
                        id_property= 'OBJECTID';
                        value_clicked_feature_id = clicked_feature.properties.OBJECTID;
                        break;
                    case 'layer_aspern_publiclines':
                        id_property= 'OBJECTID';
                        value_clicked_feature_id = clicked_feature.properties.OBJECTID;
                        break;
                    case 'layer_aspern_trees':
                        id_property= 'BAUM_ID';
                        value_clicked_feature_id = clicked_feature.properties.BAUM_ID;
                        break;
                    case 'layer_aspern_publicstops':
                        id_property= 'OBJECTID';
                        value_clicked_feature_id = clicked_feature.properties.OBJECTID;
                        break;
                    case 'layer_shops':
                        id_property= 'osm_id';
                        value_clicked_feature_id = clicked_feature.properties.osm_id;
                        break;
                }
                console.log('clicked feature id: ', value_clicked_feature_id);

                properties = clicked_feature.properties; // store the feature's properties
                properties_keys = Object.keys(properties); // store the properties keys of the feature
                properties_values = Object.values(properties); // store the properties values of the feature
                console.log('prop keys: ', properties_keys);
                console.log('prop values: ', properties_values);
                console.log('prop len: ', properties_values.length);


                const popup = new mapboxgl.Popup()
                  .setLngLat(e.lngLat)
                  .addTo(map);

                // for the height property, we put a range form when changing its value
                range_property_list = ['height'];

                // creating the list of properties can can be changed directly
                function create_dynamic_prop_canvas(){

                    console.log('properties values in create dynamic func: ', properties_values)

                    const ul = document.createElement('ul');
                    ul.className = "list-group list-group-flush"
                    ul.id = 'off-canvas';

                    // check if we have a list for the clicked feature with the properties that we want to show
                      try{
                          imp_prop = eval('properties_'+check_id);
                      } catch (err){ // if not, we show all properties of the clicked feature
                          imp_prop =properties_keys;
                      }

                  console.log('type imp prop: ',  imp_prop)

                    for (let i=0; i< properties_keys.length; i++){
                        // have the important properties only shown
                        if (imp_prop.includes(properties_keys[i])){
                            // change properties stored names with user-friendly names
                            let li_prop_user = properties_keys[i];
                            switch(properties_keys[i]){
                                case 'area_green_rel':
                                    li_prop_user = 'share of green space';
                                    break;
                                case 'OSR':
                                    li_prop_user= 'open space ratio';
                                    break;
                                case 'max_height':
                                    li_prop_user = 'maximum building height';
                                    break;
                                case 'count_trees':
                                    li_prop_user= 'stock of trees';
                                    break;
                                case 'count_shops':
                                    li_prop_user= 'number of shops';
                                    break;
                                case 'main_cover':
                                    li_prop_user= 'land cover';
                                    break;
                                case 'use_lvl1':
                                    li_prop_user= 'generalized land use';
                                    break;
                                case 'use_lvl2':
                                    li_prop_user= 'land use category';
                                    break;
                                case 'use_lvl3':
                                    li_prop_user= 'detailed land use category';
                                    break;
                                case 'form':
                                    li_prop_user= 'construction form of the section';
                                    break;
                                case 'line_type':
                                    li_prop_user= 'means of transport';
                                    break;
                                case 'year':
                                    li_prop_user= 'year of planting';
                                    break;
                                case 'stop_name':
                                    li_prop_user= 'name of stop';
                                    break;
                                case 'shop':
                                    li_prop_user= 'type of shop/service';
                                    break;
                                case 'landuse':
                                    li_prop_user= 'landuse category';
                                    break;
                            }


                            const li = document.createElement('li');
                            li.id = 'p'+ i.toString();
                            li.className = 'list-group-item';
                            li.innerHTML = '<b style="">'+li_prop_user+'</b>: '+'<span style="width: auto" ></span>';
                            ul.appendChild(li);

                            // save the property name and its value
                            li_prop = properties_keys[i];
                            span_text = properties_values[i];

                            // putting the range for certain properties that have number values
                            // if the property is one of the above and its value is not null
                            if (range_property_list.includes(li_prop) && span_text!='null'){
                                // we define the range stop number
                                if (Number(span_text)<10){
                                    max_range_nr ='100'
                                }
                                else if (Number(span_text)>1000){
                                    max_range_nr = String(Number(span_text)*3)
                                }
                                else if (Number(span_text)>10000){
                                    max_range_nr = String(Number(span_text)*2)
                                }
                                else{
                                    max_range_nr = String(Math.pow(Number(span_text),2));
                                }

                                li.getElementsByTagName('span')[0].innerHTML = '\n        <form action="#" style="width:130px; font-size: 14px">\n            <p class="range-field">\n                <input type="range" id="test5" min="0" max="'+max_range_nr+'"  value="'+span_text+'"><span class="thumb"><span class="value"></span></span>\n            </p>\n        </form>\n    '


                            }else
                            // putting the dropdown for landuse property
                            // we have the dropdown available only when the tool button is clicked
                            if(properties_keys[i]== 'landuse' && landuse_tool_but.checked){
                                console.log('span text: ', span_text)
                                li.getElementsByTagName('span')[0].innerHTML =
                                    '<form action="#" style="width:150px; font-size: 14px;" id="select_form">\n'+
                                    '<select name="level2" id="level2" style="display: block;  height: 35px">\n' +
                                    '  <option value="recreation & leisure facilities">recreation & leisure facilities</option>\n' +
                                    '  <option value="water">water</option>\n' +
                                    '  <option value="agriculture">agriculture</option>\n' +
                                    '  <option value="natural area">natural area</option>\n' +
                                    '  <option value="business uses">business uses</option>\n' +
                                    '  <option value="industrial & commercial uses">industrial & commercial uses</option>\n' +
                                    '  <option value="social infrastructure">social infrastructure</option>\n' +
                                    '  <option value="technical infrastructure">technical infrastructure</option>\n' +
                                    '  <option value="residential use">residential use</option>\n' +
                                    '  <option value="road space">road space</option>\n' +
                                    '  <option value="other transportation uses">other transportation uses</option>\n' +
                                    '</select>\n'+
                                    '</form>'

                                // show the current landuse value
                                li.getElementsByTagName('select')[0].value = span_text;

                            } else {
                                // the values are just plain text
                                li.getElementsByTagName('span')[0].innerHTML= properties_values[i];

                            }

                            //when the user changes a property's value
                           li.getElementsByTagName('span')[0].onchange = function(e){
                                console.log('e: ', e);
                                console.log('on change this: ', this);
                                let new_value =e.target.value; // store the new value

                               // save the new value in the layer's data dictionary
                                if (check_id == 'aspern_landuse' && landuse_tool_but.checked){
                                    // we store the changes of landuse in the main blocks layer
                                    save_dict_property(li, new_value, 'aspern_blocks');
                                }
                                else{
                                    save_dict_property(li, new_value, check_id);
                                }

                            }

                            ul.appendChild(li);

                        }
                        popup.setDOMContent(ul);


                    }
                }
                create_dynamic_prop_canvas();

                // function for saving the changes into the dictionary
                function save_dict_property(li, new_value, data_check_id){
                    console.log('save the data into the dict');

                    console.log('data check id: ', data_check_id)


                    for (f of eval('data_'+data_check_id).features){
                        // f is the clicked feature from the dictionary
                        // we find the feature in the dictionary that has been changed (we look for the same id)
                        if ( f['properties'][id_property] == value_clicked_feature_id){
                            console.log('found: ', f);

                            console.log('li in save dict: ', li);

                            dict_key = li.getElementsByTagName('b')[0].innerHTML;


                            // user-friendly prop names changed back to initial names
                            // because we get the property from the form and check it in the dictionary
                            switch(dict_key){
                                case 'share of green space':
                                    dict_key = 'area_green_rel';
                                    break;
                                case 'open space ratio':
                                    dict_key= 'OSR';
                                    break;
                                case 'maximum building height':
                                    dict_key = 'max_height';
                                    break;
                                case 'stock of trees':
                                    dict_key= 'count_trees';
                                    break;
                                case 'number of shops':
                                    dict_key= 'count_shops';
                                    break;
                                case 'land cover':
                                    dict_key= 'main_cover';
                                    break;
                                case 'generalized land use':
                                    dict_key= 'use_lvl1';
                                    break;
                                case 'land use category':
                                    dict_key= 'use_lvl2';
                                    break;
                                case 'detailed land use category':
                                    dict_key= 'use_lvl3';
                                    break;
                                case 'construction form of the section':
                                    dict_key= 'form';
                                    break;
                                case 'means of transport':
                                    dict_key= 'line_type';
                                    break;
                                case 'year of planting':
                                    dict_key= 'year';
                                    break;
                                case 'name of stop':
                                    dict_key= 'stop_name';
                                    break;
                                case 'type of shop/service':
                                    dict_key= 'shop';
                                    break;
                                case 'landuse category':
                                    dict_key= 'landuse';
                                    break;
                            }



                            console.log(li.getElementsByTagName('b'));
                            console.log('dict key from li: ', dict_key);
                            console.log('f prop: ', f['properties']);
                            //change the current value to the updated one
                            f['properties'][dict_key] = new_value;

                            console.log('clicked layer in save in dict: ', clickedLayer)

                            //update layer's data
                            map.getSource(clickedLayer).setData(eval('data_'+data_check_id));
                            console.log('data after: ', f);
                            feature = JSON.parse(JSON.stringify(f));

                            return feature
                        }

                    }
                }

            });
        }
    }

});
