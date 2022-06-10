import * as model from "./model.js";
import travelListView from "./views/travelListView.js";
import searchView from "./views//searchView.js";

// 獲取當前地理位置
const controlGetLocalStorage = function () {
  model.getLocalStorage();
  if (model.state.travelList.length === 0)
    return travelListView.renderErrorMessage("創建屬於你的旅遊行程吧！！");

  travelListView.render(model.state.travelList);
};

// 處理新建行程
const controlNewItem = function () {
  const newItem = travelListView.getNewItem();
  if (!newItem) return;

  model.createNewTravelItem(newItem);

  travelListView.render(model.state.travelList);
};

const controlDeleteItem = function (id) {
  if (!id) return;

  model.deleteTravelItem(id);

  if (model.state.travelList.length === 0)
    return travelListView.renderErrorMessage("創建屬於你的旅遊行程吧！！");

  travelListView.render(model.state.travelList);
};

const controlUpdateItem = function (id, coords, address) {
  const updateItem = travelListView.getUpdateItem();

  model.updateTravelItem(id, coords, address, updateItem);

  travelListView.render(model.state.travelList);
};

const controlSortItem = function (sort) {
  model.sortTravelItem(sort);

  travelListView.render(model.state.sortList);
};

const controlSearchItem = function () {
  const query = searchView.getQuery();
  if (!query && model.state.travelList.length === 0)
    return travelListView.renderErrorMessage("創建屬於你的旅遊行程吧！！");

  if (!query) return travelListView.render(model.state.travelList);

  model.searchTravelItem(query);

  travelListView.render(model.state.searchList);
};

///////////////////////////////////////////////////////////
////////////////////// MAP ////////////////////////
///////////////////////////////////////////////////////////

const controlGetNowPosition = function () {
  model.getPosition();
};

// 傳送 map 數據
const controlClickMap = function () {
  return model.state.mapEvent;
};

const controlMoveToPopup = function (id) {
  model.moveToPopup(id);
};

const init = (function () {
  controlGetLocalStorage();
  controlGetNowPosition();

  travelListView.addHandlerToolBtn(controlSortItem);
  travelListView.addHandlerNewTravelItem(controlNewItem);
  travelListView.addHandlerTravelItem(
    controlDeleteItem,
    controlUpdateItem,
    controlMoveToPopup
  );
  travelListView.addHandlerClickMap(controlClickMap);
  travelListView.addHandlerSearchAddressList(controlClickMap);

  searchView.addHandlerSearch(controlSearchItem);

  console.log("Welcome to use it.");
})();
