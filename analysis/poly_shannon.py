import numpy as np
import geopandas as gpd
import time


#landuse = gpd.read_file('aspern_blocks_final.geojson') #read in the file with the landuse polygons

#totalTime = time.time()

########################
#reproject the geodataframe
#######################


def reproject (geodf, crs = "EPSG:3857"):
    # print('reproject func')
    # geodf = input geodataframe
    # crs = a projected crs (unit must be meter), default is EPSG:3857

    if geodf.crs == "EPSG:4326":
        geodf_reprj = geodf.to_crs(crs) # reproject, so the unit is meter and not degree


    return geodf_reprj


########################
# create centroids and buffer
#######################


def indexCalculation (geodf_reprj, landUseCol, radius = 500, uniqueID = None):
    # print('index calc funct')

    #geodf_reprj = reprojected geodataframe (unit mut be meter)
    #landUseCol = attribute (column) with the landuse information
    #radius --> defines how big the neighborhood should be
    #uniqueID = unique identifier for the polygons (blocks)


    if uniqueID == None:
        geodf_reprj.reset_index(inplace=True)  # create a column with index as unique ID
        geodf_reprj = geodf_reprj.rename(columns={'index': 'polyID'})  # rename index column
    else:
        if uniqueID != 'polyID':
            geodf_reprj = geodf_reprj.rename(columns={uniqueID: 'polyID'})  # rename index column


    if landUseCol != 'landuse':
        geodf_reprj.rename(columns={landUseCol: "landuse"}, inplace=True)



    # create centroids
    centroids = geodf_reprj.centroid

    polyCenter = gpd.GeoDataFrame.copy(geodf_reprj)  # duplicate polygon geodataframe
    polyCenter['geometry'] = centroids # assign the centroids as new geometry


    # create buffer areas with defined radius
    centerbuf = gpd.GeoDataFrame.copy(polyCenter)  # copy center points GeoDataFrame (--> variable for buffer polygons)
    centerbuf['geometry'] = centerbuf.buffer(radius)  # calculate 500m buffer around center points, assign new geometry to the copy
    centerbuf = gpd.GeoDataFrame(centerbuf[['polyID', 'geometry']]) # leave only two columns with ID and geometry, drop the rest
    centerbuf.rename(columns={"polyID": "bufID"}, inplace=True)  # rename unique ID, so that it is clear for the intersection



    # do the intersection
    _overlay = gpd.overlay(centerbuf, geodf_reprj,how='intersection')  # the result is a new gdf, containing the geometry of the overlapping features


    # calculate the area
    _overlay['area'] = _overlay['geometry'].area # area is important to weigh the landuse types


    #preperation for index calc
    geodf_reprj['div_index'] = ""  # create a column for the index
    uniqueLandUseTypes  = geodf_reprj['landuse'].unique()


    ### INDEX CALCULATION ###

    for point in polyCenter['polyID']: # for each polygon center point
        summands = []
        neighborhoodArea = sum(_overlay.loc[_overlay['bufID'] == point, ['area']].values[0:])  # calcualte the whole area of a neighboorhood (all areas within radius)
        neighborhoodObjects = _overlay[(_overlay['bufID'] == point)] #put all the polygons within the specific neighborhood of the current loop in a new GDF
        for landUseType in uniqueLandUseTypes: #geodf_reprj['landuse'].unique(): #iterate through laduse types
            landUseArea= []
            for row in neighborhoodObjects.itertuples(): #iterate throogh all objects (polygons) within the specific neighborhood of curent loop
                landUse = row.landuse
                if landUse == landUseType: #if landuse of object equals the landuse type of the current loop
                    landUseArea.append(row.area)
            landUseSum = sum(landUseArea)
            if landUseSum != 0:
                shareLanduse = landUseSum / neighborhoodArea
                p1 = shareLanduse * np.log(shareLanduse)  # calculate the summand of the land Use type for the index
                summands.append(p1)
        shannonValue = (-1) * (np.sum(summands))  # calculate the index value for the specific gridID (resp. point)
        geodf_reprj.loc[geodf_reprj['polyID'] == point, 'div_index'] = shannonValue  # add value to the polygon





    #print (geodf_reprj.head())
    #geodf_reprj.to_file('shan_layer_new.geojson', driver='GeoJSON')

    if uniqueID != None:
        geodf_reprj = geodf_reprj.rename(columns={'polyID': uniqueID})  # rename index column

    geodf_reprj.rename(columns={"landuse": landUseCol}, inplace=True)

    geodf_reprj = geodf_reprj.to_crs("EPSG:4326")


    return geodf_reprj


######################################################
### call the functions #####


# geodf_reprj = reproject(landuse)
#
# result = indexCalculation (geodf_reprj,'landuse', 500, 'OBJECTID')


#print ("here is the result")
#print("totalTime, ", time.time() - totalTime)
#print (result)