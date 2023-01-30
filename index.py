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
    return render_template('main.html')


@app.route("/blocks/", methods=['GET'])
def blocks():
    with open(join('data', 'aspern_blocks_final.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/landcover/", methods=['GET'])
def landcover():
    with open(join('data', 'aspern_landcover_final.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/bkmBlocks/", methods=['GET'])
def bkmblocks():
    with open(join('data', 'aspern_bkmBlocks.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/roads/", methods=['GET'])
def roads():
    with open(join('data', 'aspern_roads.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/publiclines/", methods=['GET'])
def publines():
    with open(join('data', 'aspern_publiclines.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/trees/", methods=['GET'])
def trees():
    with open(join('data', 'aspern_trees_blocks.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/publicstops/", methods=['GET'])
def pubstops():
    with open(join('data', 'aspern_publicstops.geojson'), encoding='utf-8') as f:
        return f.read()

@app.route("/shops/", methods=['GET'])
def shops():
    with open(join('data', 'shops.geojson'), encoding='utf-8') as f:
        return f.read()



@app.route('/index/', methods=['POST'])
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

    blocks_file = gpd.read_file(join('data', 'aspern_blocks_final.geojson'))

    poi_file = gpd.GeoDataFrame.from_features(dict['poi'], crs="EPSG:4326")


    reprojection = reprojectdist(poi_file, blocks_file)
    print('reprojection', reprojection)

    result = bufferDist(reprojection[0], reprojection[1], int(dist))
    print('accessibility result: ', result)
    blocksWithinDist, bufArea_dis =result
    print('type blocksWithinDist: ', type(blocksWithinDist))
    response = {'blocks': blocksWithinDist.to_json(), 'buffer': bufArea_dis.to_json()}

    return response


@app.route('/graph/', methods=['POST'])
def post_calculated_graph_data():
    print('graph route')
    dict = json.loads((request.data).decode())
    df = gpd.GeoDataFrame.from_features(dict['data'], crs="EPSG:4326")
    print('df', df)
    print('prop', dict['prop'])

    result = graphs_calc(df, dict['prop'])
    print('graph data: ', result)
    print(type(result))

    return result



if __name__ == "__main__":
    app.run(debug=True, port=5000)