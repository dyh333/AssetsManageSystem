define(function () {
    return {
        baseMapUrl: "http://58.210.9.131/scms/sipsd/service/DycService/2f489053-4e4a-4580-8400-165d79552cce/MapServer?token={token}",

        paramUrl: "http://58.210.9.134/zcglserver/getBuildInitParam/{bldgId}",

        initParamUrl: "http://58.210.9.134/zcglserver/getInitParam/{propId}",

        boundaryLineUrl: "http://58.210.9.134/zcglserver/getBoundaryLine/{0}",

        floorsUrl: "http://58.210.9.134/zcglserver/getFloors/{0}",

        textNoteUrl: "http://58.210.9.134/zcglserver/getTextNotes/{0}",

        floorListUrl: "http://58.210.9.134/zcglserver/getFloorList/{0}",

        floorRoomsUrl: "http://58.210.9.134/zcglserver/getFloorRooms/{comp}/{sect}/{floor}",

        floorWallsUrl: "http://58.210.9.134/zcglserver/getFloorWalls/{comp}/{sect}/{floor}",

        roomAreaUrl: "http://58.210.9.134/zcglserver/getRoomArea/{bldgId}/{flrId}",

        getDMPropertyTree: "http://58.210.9.134/zcglserver/getDMPropertyTree",

        getDMSectFloorList: "http://58.210.9.134/zcglserver/getDMSectFloorList/{comp}/{sect}",

        getDMFloorPropertyList: "http://58.210.9.134/zcglserver/getDMFloorPropertyList/{comp}/{sect}/{floor}",

        cutRoomByLine: "http://58.210.9.134/zcglserver/cutRoomByLine/",

        loadTempSplitRoomUrl: "http://58.210.9.134/zcglserver/loadTempSplitRoom/{roomFatId}",

        cancelCutRoom: "http://58.210.9.134/zcglserver/cancelCutRoom/{roomId}",

        saveCutRoomUrl: "http://58.210.9.134/zcglserver/saveCutRoom/{roomId}/{user}",

        mergeRoomsById: "http://58.210.9.134/zcglserver/mergeRoomsById/{roomId1}/{roomId2}",

        loadTempMergeRoomUrl: "http://58.210.9.134/zcglserver/loadTempMergeRoom/{roomFatId1}/{roomFatId2}",

        saveMergeRoomUrl: "http://58.210.9.134/zcglserver/saveMergeRoom/{roomId1}/{roomId2}/{user}",

        cancelMergeRoom: "http://58.210.9.134/zcglserver/cancelMergeRoom/{roomId1}/{roomId2}",

        hookRoomUrl: "http://58.210.9.134/zcglserver/hookRoom/{propertyId}/{roomId}"
    };
});