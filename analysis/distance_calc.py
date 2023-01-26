import numpy as np
import geopandas as gpd
import time



# poi = gpd.read_file('aspern_publicstops.geojson') #read in the file with the landuse polygons
# blocks = gpd.read_file('aspern_blocks_final.geojson')
#


###reproject


def reprojectdist (pois, blocks, crs = "EPSG:3857"):
    #  = input geodataframe with points
    # crs = a projected crs (unit must be metter), default is EPSG:3857

    if pois.crs == "EPSG:4326":
        pois_reprj = pois.to_crs(crs) # reproject, so the unit is meter and not degree

    if blocks.crs == "EPSG:4326":
        blocks_reprj = blocks.to_crs(crs) # reproject, so the unit is meter and not degree


    return pois_reprj, blocks_reprj



###calcualtion of buffer


def bufferDist (pois_reprj, blocks_reprj,  distance):




    # create buffer areas with defined radius
    bufArea = gpd.GeoDataFrame.copy(pois_reprj)  # copy points GeoDataFrame (--> variable for buffer polygons)
    bufArea['geometry'] = bufArea.buffer(distance)  # calculate buffer around points, assign new geometry to the copy
    bufArea_dis= bufArea.dissolve()



    blocks_reprj.reset_index(inplace=True)  # create a column with index as unique ID
    blocks_reprj.rename(columns={'index': 'polyID'}, inplace= True)  # rename index column
    blocks_reprj['polyArea']= blocks_reprj['geometry'].area

    _overlay = gpd.overlay(blocks_reprj, bufArea_dis, how='intersection')
    _overlay['intersectArea'] = _overlay['geometry'].area
    polyIDsWithinDist = []

    for row in _overlay.itertuples():
        rowID= row.polyID
        if row.intersectArea > (0.5 * blocks_reprj.loc[blocks_reprj['polyID'] == rowID, ['polyArea']].values[0]):
            polyIDsWithinDist.append (rowID)


    blocksWithinDist = blocks_reprj[blocks_reprj['polyID'].isin(polyIDsWithinDist)]

    blocksWithinDist = blocksWithinDist.to_crs("EPSG:4326")
    bufArea_dis = bufArea_dis.to_crs("EPSG:4326")


    return blocksWithinDist, bufArea_dis


###call the function

# pois_reprj, blocks_reprj = reproject(poi, blocks)
#
# bufferDist(pois_reprj, blocks_reprj, 200)