import { KEY } from "./config.js";

export const state = {
  travelList: [],
  sortList: [],
  searchList: [],
  map,
  mapZoomSize: 14,
  mapEvent: [], // 儲存點擊地圖獲得的資訊 [lat, lng, address]
  layers: [], // 圖層列表
  layerGroup: null, // 圖層群組 (方便修改圖層)
};

export const createNewTravelItem = function (newItem) {
  newItem = {
    id: uuid.v4(),
    itemPosition: [state.mapEvent[0], state.mapEvent[1]],
    date:
      newItem.inputYear +
      newItem.inputMonth +
      newItem.inputDay +
      newItem.inputHour +
      newItem.inputMin,
    ...newItem,
  };
  console.log(newItem);
  state.travelList.unshift(newItem);
  setLocalStorage();
  updateMapMarker();

  state.map.setView(newItem.itemPosition, state.mapZoomSize);
};

export const deleteTravelItem = function (id) {
  state.travelList.forEach((item, i) => {
    if (item.id === id) {
      state.travelList.splice(i, 1);
    }
  });
  setLocalStorage();
  updateMapMarker();
  // 執行完刪除動作後，移動到最近創建的項目
  if (state.travelList.length === 0) return;
  moveToPopup(state.travelList[0].id);
};

export const updateTravelItem = function (id, coords, address, updateItem) {
  const [lat, lng] = coords.split(",");
  coords = [+lat, +lng];

  state.travelList.forEach((item, i) => {
    if (item.id === id) {
      state.travelList[i] = {
        id: id,
        itemPosition:
          address === updateItem.inputPlace
            ? coords
            : [state.mapEvent[0], state.mapEvent[1]],
        ...updateItem,
      };
    }
  });
  setLocalStorage();
  updateMapMarker();
  moveToPopup(id);
};

export const sortTravelItem = function (sort) {
  console.log("sort", sort);
  state.sortList = sort
    ? state.travelList.slice().sort((a, b) => a.date - b.date)
    : state.travelList;
  console.log(state.sortList);
  console.log(state.travelList);
};

export const searchTravelItem = function (query) {
  state.searchList = state.travelList.filter((item) => {
    return item.inputTitle.includes(query);
  });
};

// 儲存到 local storage
const setLocalStorage = function () {
  localStorage.setItem("travelList", JSON.stringify(state.travelList));
};

export const getLocalStorage = function () {
  const data = JSON.parse(localStorage.getItem("travelList"));

  if (!data) return;

  state.travelList = data;
};

////////////////////// MAP ////////////////////////

const loadMap = function (position) {
  const { latitude, longitude } = position.coords;
  const coords = [latitude, longitude];

  state.map = L.map("map", { zoomControl: false });

  L.control
    .scale({
      position: "bottomright",
    })
    .addTo(state.map);

  L.control
    .zoom({
      position: "bottomleft",
    })
    .addTo(state.map);

  L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(state.map);

  state.map.on("click", onMapClick);
  state.travelList.forEach((item) => createMapMarker(item));
  state.layerGroup = L.layerGroup(state.layers); // 創建圖層群組
  state.map.addLayer(state.layerGroup); // 把圖層群組匯入到地圖中

  state.map.setView(coords, state.mapZoomSize);
};

export const getPosition = function () {
  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(loadMap, () =>
      alert("無法獲取您的位置")
    );
};

const onMapClick = async function (e) {
  try {
    state.mapEvent = [];
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    state.mapEvent = [lat, lng];

    // 接收點擊位置經緯度，透過here api轉換成地址
    const res = await fetch(
      `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&limit=1&lang=zh-TW&apikey=${KEY}`
    );
    const data = await res.json();

    state.mapEvent = [...state.mapEvent, data.items[0].address.label];
  } catch (err) {
    console.log(err);
  }
};

const createMapMarker = function (item) {
  // 創建 marker 圖層
  let layer = L.marker(item.itemPosition);
  state.layers.push(layer);

  // 加入 marker圖標到地圖中
  layer
    .addTo(state.map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${item.inputType}-pop`,
      })
    )
    .setPopupContent(
      `<strong>${item.inputTitle}</strong><br>${item.inputPlace}`
    )
    .openPopup();
};

// 更新 marker 圖層
const updateMapMarker = function () {
  state.layerGroup.clearLayers();
  state.layers = [];
  state.travelList.forEach((item) => createMapMarker(item));
  state.layerGroup = L.layerGroup(state.layers);
  state.map.addLayer(state.layerGroup);
};

export const moveToPopup = function (id) {
  const item = state.travelList.find((item) => item.id === id);

  state.map.setView(item.itemPosition, state.mapZoomSize);
};

//////// 使用 EasyAutocomplete 套件 //////////
// 參考 https://ithelp.ithome.com.tw/articles/10235402，結合 hereapi 跟 EasyAutocomplete
let options = {
  // 定義 EasyAutocomplete 的選取項目來源
  url: function (phrase) {
    return `https://autosuggest.search.hereapi.com/v1/autosuggest?q=${phrase}&limit=6&lang=zh_TW&at=
${state.map.getCenter().lat},
${state.map.getCenter().lng}&apikey=${KEY}`; // hereapi key
  },

  listLocation: "items", // 使用回傳的 item 作為選取清單
  getValue: "title", // 在選取清單中顯示 title

  // 添加列表事件
  list: {
    onClickEvent: function () {
      // 按下選取項目之後的動作
      state.mapEvent = [];
      let data = $("#inputbox").getSelectedItemData();
      if (!data.position)
        return alert(
          "尚未建立此地標，請重新選擇其他搜尋結果，或直接點擊地圖的其他鄰近地點。"
        );
      const { lat, lng } = data.position;
      const { label } = data.address;
      // const coords = [lat, lng];
      state.mapEvent = [lat, lng, label];

      state.map.setView([lat, lng], state.mapZoomSize);
    },
  },
  requestDelay: 100, // 延遲 100 毫秒再送出請求
  placeholder: "輸入地點...", // 預設顯示的字串
};
$("#inputbox").easyAutocomplete(options); // 啟用 EasyAutocomplete 到 inpupbox 這個元件
