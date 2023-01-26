from flask import Flask, render_template, request
from os.path import join
import json
import geopandas as gpd
from analysis.poly_shannon import reproject, indexCalculation
from analysis.distance_calc import reprojectdist, bufferDist
from analysis.graphs2 import graphs_calc



app = Flask(__name__)

@app.route("/", methods=['GET'])
def home():
    return render_template('index.html')


@app.route("/data/final/aspern_blocks_final.geojson", methods=['GET'])
def blocks():
    with open(join('data', 'aspern_blocks_final.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/data/final/aspern_landcover_final.geojson", methods=['GET'])
def landcover():
    with open(join('data', 'aspern_landcover_final.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/data/final/aspern_bkmBlocks.geojson", methods=['GET'])
def bkmblocks():
    with open(join('data', 'aspern_bkmBlocks.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/data/final/aspern_roads.geojson", methods=['GET'])
def roads():
    with open(join('data', 'aspern_roads.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/data/final/aspern_publiclines.geojson", methods=['GET'])
def publines():
    with open(join('data', 'aspern_publiclines.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/data/final/aspern_trees_blocks.geojson", methods=['GET'])
def trees():
    with open(join('data', 'aspern_trees_blocks.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/data/final/aspern_publicstops.geojson", methods=['GET'])
def pubstops():
    with open(join('data', 'aspern_publicstops.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/data/final/shops.geojson", methods=['GET'])
def shops():
    with open(join('data', 'shops.geojson'), encoding='utf-8') as f:
        return f.read()



@app.route('/flask/', methods=['POST'])
def post_calculated_data():
    #steps:
    # get data from map,
    # call function for index calculation with the data,
    # (store the changes and the indices in a file ?),
    # return the result from the function

    print('flask route')
    print('request decode type', type((request.data).decode()))
    dict = json.loads((request.data).decode())
    print('data: ', dict)

    # save the updated landuse data on a separate file
    # with open(r'webapp\data\final\aspern_blocks_final_updated.geojson', 'w', encoding='utf-8') as f:
    #     f.write(json.dumps(dict))


    df = gpd.GeoDataFrame.from_features(dict, crs="EPSG:4326")
    print(type(df), df)

    df = reproject(df)

    result = indexCalculation(df, 'landuse')
    print('index result: ', result)
    return result.to_json()


@app.route('/accessibility/', methods=['POST'])
def post_calculated_accessibility():

    print('accessibility route')
    print('request decode type', type((request.data).decode()))
    dict = json.loads((request.data).decode())
    poi = dict['poi']
    dist = dict['dist']
    print(poi, dict)

    # if poi == 'transport':
    #     poi_file = gpd.read_file(r'webapp\data\final\aspern_publicstops.geojson')
    # else:
    #     poi_file = gpd.read_file(r'webapp\data\final\shops.geojson')

    blocks_file = gpd.read_file(join('data', 'aspern_blocks_final.geojson'))

    poi_file = gpd.GeoDataFrame.from_features(dict['poi'], crs="EPSG:4326")


    reprojection = reprojectdist(poi_file, blocks_file)
    print('reprojection', reprojection)

    result = bufferDist(reprojection[0], reprojection[1], int(dist))
    print('accessibility result: ', result)
    blocksWithinDist, bufArea_dis =result
    print('type blocksWithinDist: ', type(blocksWithinDist))
    # return blocksWithinDist.to_json()
    response = {'blocks': blocksWithinDist.to_json(), 'buffer': bufArea_dis.to_json()}
    #return blocksWithinDist.to_json() #, bufArea_dis.to_json()

    return response


@app.route('/graph2/', methods=['POST'])
def post_calculated_graph2_data():
    print('graph 2 route')
    dict = json.loads((request.data).decode())
    df = gpd.GeoDataFrame.from_features(dict['data'], crs="EPSG:4326")
    print('df', df)
    print('prop', dict['prop'])

    result = graphs_calc(df, dict['prop'])
    print('graph data: ', result)
    print(type(result))

    #return {'result': result}
    return result



if __name__ == "__main__":
    app.run(debug=True, port=5000, template_folder="../templates")